import { ref, onMounted, onUnmounted, nextTick, type Ref} from 'vue'
import { initStream, openCamera, initLocalScreenStream, type MediaStreamType } from '@/utils/media'
import Bus from '@/utils/eventBus'
import { useMeetingStore, type NewUser } from '@/store/useMeetingStore'
import { ElMessage } from 'element-plus'
import { sendOpenVideoChangeMessage } from '@/service/service'
import { SettingFormData } from "../meeing_window_type"
import { isEmpty } from '@/utils/tool'

export interface MessageContent {
  meetingMemberList: NewUser[]
  newMember: NewUser
}

interface MessageContentType2 {
  signalData: string,
  signalType: SIGNAL_TYPE,
}

export interface WsDataType {
  meetingId: string,
  messageContent: MessageContent | MessageContentType2 | boolean | string,
  messageSend2Type: number,
  messageType: number,
  receiveUserId?: string,
  sendUserId?: string,
}

export type VideoRef = HTMLMediaElement | null

enum SIGNAL_TYPE {
  OFFER = "offer",
  ANSWER = "answer",
  CANDIDATE = "candidate",
}

interface SendPeerMessageType {
  sendUserId: string,
  receiveUserId: string,
  signalType: SIGNAL_TYPE,
  signalData: RTCIceCandidate | RTCSessionDescriptionInit
}

interface ReturnObj {
  mumberList: Ref<NewUser[]>,
  allMemberList: Ref<NewUser[]>,
  localStream?: Ref<MediaStreamType | null>
  initVideo: () => void,
  listenerMeetingMessage: () => void,
  screenId: Ref<string>
}

export function usePublicMethod(props: any, video: Ref<HTMLMediaElement | null>): ReturnObj {
  const meetingStore = useMeetingStore()
  const mumberList = ref<NewUser[]>([])
  const allMemberList = ref< NewUser[]>([])
  const localStream = ref<MediaStreamType>(null)
  const peerConnectionMap = ref(new Map<string, RTCPeerConnection>())
  const screamStream = ref<MediaStreamType>(null)
  const cameraStream = ref<MediaStreamType>(null)
  const screenId = ref<string>('')

  onMounted(() => {
    // initVideo()
    listenerMeetingMessage()
    Bus.on("stopCamera", switchCameraStatus)
    Bus.on("openCamera", switchCameraStatus)
    Bus.on("shareSelectScreen", shareSelectScreenHandler)
  })

  onUnmounted(() => {
    removeAllWsListener()
    Bus.off("stopCamera")
    Bus.off("openCamera")
    Bus.off("shareSelectScreen")
  })

  async function getSetting(): Promise<SettingFormData> {
    const settingData = await window.electron.ipcRenderer.invoke("setting-get")
    return settingData
  }

  // 开启或者关闭摄像头
  async function switchCameraStatus(status: boolean): Promise<void> {
    if (status) {
      console.log("开启摄像头")
      // 1. 重新获取摄像头流（重要！）
      Bus.emit("cameraOpend")
      const cameraStream = await openCamera() as MediaStream;
      const sysSetting = await getSetting()   // 获取配置文件
      if (!sysSetting.openVideo) {
        props.baseInfo.cameraEnable = cameraStream
        props.baseInfo.cameraOpen = true
      }

      const newVideoTrack = cameraStream.getVideoTracks()[0];
      
      // 2. 更新本地流
      if (localStream.value) {
        // 移除旧的视频轨道
        const oldVideoTracks = localStream.value.getVideoTracks();
        oldVideoTracks.forEach(track => {
          localStream.value!.removeTrack(track);
          track.stop(); // 停止旧轨道释放资源
        });
        
        // 添加新的视频轨道
        localStream.value.addTrack(newVideoTrack);
      }
      
      // 3. 更新所有 PeerConnection
      mumberList.value.forEach(mumber => {
        const peerConnection = peerConnectionMap.value.get(mumber.userId);
        if (peerConnection) {
          const senders = peerConnection.getSenders();
          const videoSender = senders.find(sender => (sender.track && sender.track.kind === 'video'));
          
          if (videoSender) {
            // 替换为新的视频轨道
            videoSender.replaceTrack(newVideoTrack);
            console.log(`已为 ${mumber.userId} 更新视频轨道`);
          } else {
            // 如果没有视频发送器，添加新的
            peerConnection.addTrack(newVideoTrack, localStream.value!);
          }
        }
      });
      if (video.value) {
        video.value.srcObject = localStream.value;
      }

      await sendCameraStatusMessage(true)

      ElMessage({
        message: '摄像头已开启！',
        type: 'success'
      })

    } else {
      console.log("关闭摄像头")
      if (localStream.value) {
        localStream.value.getVideoTracks().forEach(track => track.enabled = false)
      }
      await sendCameraStatusMessage(false)

      ElMessage({
        message: '摄像头已关闭！',
        type: 'success'
      })
    }
  }

  //  开启或者关闭屏幕共享
  async function shareSelectScreenHandler(screen): Promise<void> {
    // 共享屏幕的优先级要高于摄像头
    // 当有摄像头，并且在开启状态的下，开启屏幕共享，那么会先关闭摄像头，然后进行屏幕共享
    // 当没有摄像头的时候，开启屏幕共享，会直接开启屏幕共享
    // 当关闭共享屏幕，原先是有摄像头的话，则再次打开摄像头
    // 如果原先没有摄像头，关闭屏幕共享，则恢复原始状态
    await sendCameraStatusMessage((props.baseInfo.cameraEnable && props.baseInfo.cameraOpen) || (isEmpty(screen?.id) || isEmpty(props.screenId)))
    if ((props.screenId || screen?.id) && !screamStream.value) { // 开启屏幕共享
      screenId.value = screen.id
      screamStream.value = await initLocalScreenStream(screen.id)
      localStream.value = screamStream.value // 更新本地流
      if (props.baseInfo.cameraOpen) {
        Bus.emit("screenOpend")
      }
    } else if (!screen?.id && (props.baseInfo.cameraEnable && props.baseInfo.cameraOpen)) { // 关闭屏幕共享将本地流，切换为摄像头流
      localStream.value = cameraStream.value
      screenId.value = ""
      screamStream.value = null
    } else if (!(props.baseInfo.cameraEnable && props.baseInfo.cameraOpen) || (isEmpty(screen?.id) || isEmpty(props.screenId))) {
      screenId.value = ""
      screamStream.value = null
    }
    if (video.value) {
      video.value.srcObject = localStream.value
    }
    // 替换会议中其他成员的流
    const videoTrack: MediaStreamTrack | null = localStream.value?.getVideoTracks()[0] || null
    mumberList.value.length && mumberList.value.forEach(mumber => {
      if (peerConnectionMap.value.has(mumber.userId)) {
        const peerConnection = peerConnectionMap.value.get(mumber.userId)
        peerConnection?.getSenders().forEach(sender => {
          if (sender.track && sender.track.kind === 'video') {
            if (videoTrack) {
              sender.replaceTrack(videoTrack)
            } else {
              sender.track.enabled = false
            }
          }
        })
      }
    })
  }

  function sendCameraStatusMessage(openVideo: boolean): Promise<void> {
   return sendOpenVideoChangeMessage({ openVideo }).then((res: any) => {
    if (res && res.code === 200) {
      console.log("发送消息成功")
    } else {
      console.log("调用接口失败！！！")
    }
   })
  }

  // 监听会议消息（websocket）
  function listenerMeetingMessage(): void {
    window.electron.ipcRenderer.on("ws-meeting-message", (e, data: WsDataType) => {
      switch(data.messageType) {
        case 1:
          listenNewUserJoin(data.messageContent as MessageContent)
          break
        case 2: // 建立peerConnection，发送offer
          onPeerConnection({...data, messageContent: data.messageContent as MessageContentType2})
          break
        case 3:
          onUserLeave(data.messageContent as string)
          break
        case 11: // 用户改变摄像头状态
          changeCameraStatus({...data, messageContent: data.messageContent as boolean})
          break
      }
    })
  }

  // 进入会议室状态，当有新成员加入的时候，会触发该方法
  function listenNewUserJoin(data: MessageContent): void {
    const newMember: NewUser = data.newMember
    if (data.meetingMemberList && data.meetingMemberList.length > 0) {
      allMemberList.value = data.meetingMemberList.sort((a, b) => a.joinTime - b.joinTime)
      mumberList.value = allMemberList.value.filter(item => item.userId !== props.userInfo.userId)
      console.log(" mumberList.value",  mumberList.value)
      meetingStore.setMemberList(mumberList.value)
      meetingStore.setAllMemberList(allMemberList.value)
    }
    if (newMember.userId !== props.userInfo.userId) {
      ElMessage({
        message: `用户 ${newMember.nickName} 加入会议`,
        type: 'primary'
      })
      createPeerConnection(newMember) // 已经在会议中的人与新成员建立peer连接
      return
    }
    // 新成员入会，需要与在会议中的成员建立peer连接
    mumberList.value.forEach(member => {
      const peerConnection: RTCPeerConnection | null = createPeerConnection(member)
      sendOffer(peerConnection, props.userInfo.userId, member.userId)
    })
  }

  // 当peer建立的时候 新成员需要向会议中的所有成员建立连接
  /**
   * 
   * @param sendUserId 新成员 
   * @param receiveUserId 会议中的成员
   */

  // 添加全局状态管理
  async function onPeerConnection({sendUserId, receiveUserId, messageContent}: WsDataType): Promise<void> {
    const content = messageContent as MessageContentType2
    const signalData = content.signalData ? JSON.parse(content.signalData) : {}
    const signalType: SIGNAL_TYPE = content.signalType
    const peerConnection: RTCPeerConnection = peerConnectionMap.value.get(sendUserId as string) as RTCPeerConnection
    //!! WebRTC 的连接建立过程是异步的，必须按照正确的顺序执行：设置远程描述 -> 创建应答 -> 设置本地描述。
    //!! 记住所有 create* 方法都是异步的，返回 Promise
    switch(signalType) {
      case SIGNAL_TYPE.OFFER: {
        try {
          await peerConnection?.setRemoteDescription(signalData)
          const answer: RTCSessionDescriptionInit = await peerConnection?.createAnswer()!
          await peerConnection?.setLocalDescription(answer)
          sendPeerMessage({
            sendUserId: receiveUserId!,
            receiveUserId: sendUserId!,
            signalType: SIGNAL_TYPE.ANSWER,
            signalData: answer
          })
          console.log('Offer处理成功');
        } catch(error){
          console.error('Offer处理失败', error);
        }
        break
      }
      case SIGNAL_TYPE.ANSWER: {
        // 关键：检查是否在正确的状态下设置Answer
        if (peerConnection?.signalingState !== 'have-local-offer') {
          console.error(`不能在 ${peerConnection?.signalingState} 状态下设置Answer`);
          // 可选：诊断当前状态
          console.log('当前状态详情:', {
            signalingState: peerConnection?.signalingState,
            localDescription: peerConnection?.localDescription?.type,
            remoteDescription: peerConnection?.remoteDescription?.type
          });
          return;
        }
        try {
          await peerConnection?.setRemoteDescription(signalData)
          console.log("Answer处理成功")
        } catch(error) {
          console.log('Answer处理失败', error)
        }
        break
      }
      case SIGNAL_TYPE.CANDIDATE: {
        if(!peerConnection?.remoteDescription) {
          return
        }
        try {
          // 即使没有remoteDescription也尝试添加ICE候选
          // 浏览器会缓存并在合适的时机使用
          await peerConnection.addIceCandidate(signalData)
        } catch (error) {
          console.log('ICE候选处理失败', error)
        }
        break
      }
    }
  }

  // 监听会议中是否有人员离开
  function onUserLeave(messageContent): void {
    const content = JSON.parse(messageContent)
    const { exitUserId, nickName, meetingMemberList } = content
    if (exitUserId === props.userInfo.userId) {
      ElMessage.success("你已退出会议！")
      return
    }
    mumberList.value = mumberList.value.filter(mumber => mumber.userId !== exitUserId)
    meetingStore.setMemberList(mumberList.value)
    meetingStore.setAllMemberList(meetingMemberList)
    if (peerConnectionMap.value.has(exitUserId)) {
      peerConnectionMap.value.delete(exitUserId)
    }
    ElMessage({
      message: `用户 ${nickName} 离开会议！`,
      type: 'warning'
    })
  }

  function changeCameraStatus({sendUserId, messageContent}: WsDataType): void {
    mumberList.value.find(mumber => {
      mumber.userId === sendUserId && (mumber.openVideo = messageContent as boolean)
    })
  }

  async function sendOffer(PC: RTCPeerConnection, sendUserId: string, receiveUserId: string): Promise<void> {
    //!! peerConnection.createOffer() 是 WebRTC 中用于创建连接提议（Offer）的核心方法，它启动了 WebRTC 的信令协商过程。
    //!! createOffer() 的主要作用是生成一个 SDP（Session Description Protocol）提议，描述本地端希望建立的连接配置，包括支持的编解码器、传输协议、媒体能力等。
    //!! offerToReceiveAudio: true,    // 即使本地没有音频轨道，也期望接收音频
    //!! offerToReceiveVideo: true,    // 即使本地没有视频轨道，也期望接收视频
    //!! iceRestart: false,            // 是否触发ICE重启
    //!! voiceActivityDetection: true  // 是否启用语音活动检测
    const offer: RTCSessionDescriptionInit = await PC?.createOffer({
      iceRestart: true,
    }) as RTCSessionDescriptionInit
    //设置本地描述
    await PC?.setLocalDescription(offer)
    sendPeerMessage({
      sendUserId,
      receiveUserId,
      signalType: SIGNAL_TYPE.OFFER,
      signalData: offer
    }) // 发送offer到远端
  }

  // 当有新用户进入，会触发webRTC的peer连接
  function createPeerConnection(member: NewUser): RTCPeerConnection {
    if (peerConnectionMap.value.has(member.userId)) {
      return peerConnectionMap.value.get(member.userId)!
    }
    const peerConnectionConfig: RTCConfiguration = {
      iceServers: [
         // 免费的公共 STUN 服务器
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
          ]
        },
        //!! 你自己的或购买的 TURN 服务器（确保通话成功率）
        // {
        //   urls: "turn:your-turn.company.com:3478",
        //   username: "your_username",
        //   credential: "your_password_or_secret"
        // },
        //!! 如果支持 TURN over TLS (更安全)
        // {
        //   urls: "turns:your-turn.company.com:5349",
        //   username: "your_username",
        //   credential: "your_password_or_secret"
        // }
      ],
      iceTransportPolicy: "all", // 默认，尝试直连，失败再用 TURN
      // bundlePolicy: "max-bundle", // 控制媒体流复用 "max-bundle" (推荐)，"balanced" (默认)
    }
    let peerConnection: RTCPeerConnection
    try {
      peerConnection = new RTCPeerConnection(peerConnectionConfig)
      peerConnectionMap.value.set(member.userId, peerConnection)
      console.log("建立peerConnection成功")
    } catch(error) {
      throw new Error(`建立peerConnection失败：${error}`)
    }
    
    // peerConnection 中的 icecandidate 事件是 WebRTC 连接建立过程中最关键的事件之一。它的作用是通知应用程序发现了一个新的 ICE 候选地址，需要将这个候选地址发送给远端对等方。
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) { // 发现有新的候选地址，需要发送给远端
        console.log("发现新的候选地址", event.candidate)
        sendPeerMessage({
          sendUserId: props.userInfo.userId,
          receiveUserId: member.userId,
          signalType: SIGNAL_TYPE.CANDIDATE,
          signalData: event.candidate,
        })
      } else {
        console.log("ICE 候选收集完成")
      }
    }

    // ICE 状态监控
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.iceConnectionState
      if (state === "connected") {
        console.log("peerConnection 连接成功")
      }
      if (state === "disconnected") {
        console.log("peerConnection 连接断开")
      }
      if (state === "failed") {
        console.log("peerConnection 连接失败")
      }
    }

    // 3. ICE 连接状态变化 
    peerConnection.oniceconnectionstatechange = () => {
      console.log("iceConnectionState 变化:", peerConnection.iceConnectionState)
      
      switch(peerConnection.iceConnectionState) {
        case "connected":
          console.log("ICE 连接成功")
          break
        case "disconnected":
          console.log("ICE 连接断开")
          break
        case "failed":
          console.log("ICE 连接失败")
          break
        case "completed":
          console.log("ICE 连接完成")
          break
      }
    }

    // track 事件用于接收和处理从远端传输过来的音频、视频轨道，让你能够将远程媒体流显示在本地页面上。
    peerConnection.ontrack = (event) => {
      console.log("收到远端视频流", event.streams[0])
      const remoteVideo: VideoRef = document.getElementById(`member_${member.userId}`) as HTMLMediaElement
      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0]
      }
    }

    // peerConnection.addTrack() 是 WebRTC 中用于向连接添加本地媒体轨道的方法。它负责将本地的音频、视频轨道添加到对等连接中，以便传输给远端。
    //!! 基本语法 const rtpSender = peerConnection.addTrack(track, stream...);
    //!! 参数	      类型	               必需	     描述
    //!! track	   MediaStreamTrack   	✅	      要添加的媒体轨道（音频或视频）
    //!! stream	   MediaStream	        ❌	      轨道所属的媒体流（一个或多个）
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => {
        peerConnection?.addTrack(track, localStream.value!)
      })
    }

    return peerConnection
  }

  //!! 通过WebSocket、Socket.io等发送信令
  function sendPeerMessage({sendUserId, receiveUserId, signalType, signalData}: SendPeerMessageType) {
    window.electron.ipcRenderer.invoke("send-peer-connection", {
      sendUserId,
      receiveUserId,
      signalType,
      signalData: JSON.stringify(signalData)
    }) // 通过websocket发送消息，发送之后 listenerMeetingMessage 方法就会收到websocket消息
  }

  async function initVideo(): Promise<void> {
    const stream: MediaStreamType = await initStream(props.baseInfo.micEnable, props.baseInfo.cameraEnable, props.baseInfo.micOpen, props.baseInfo.cameraOpen, props.screenId)
    if (!stream) return
    if (!video.value) return
    cameraStream.value = stream
    localStream.value = stream // 保存本地流
    video.value!.srcObject = stream // 播放本地流
  }

  function removeAllWsListener(): void {
    window.electron.ipcRenderer.removeAllListeners("ws-meeting-message")
  }

  return {
    mumberList,
    allMemberList,
    initVideo,
    listenerMeetingMessage,
    screenId
  }

}







