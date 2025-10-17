import { ref, nextTick } from 'vue'

type MediaStreamType = MediaStream | null
const stream = ref<MediaStreamType>(null)
// 获取摄像头
export const openCamera = async (): Promise<MediaStreamType> => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
  } catch(error) {
    console.log("获取摄像头失败", error)
  }
  return stream.value
}

export const stopCamera = (): Promise<null | string> => {
  return new Promise((resolve, reject) => {
    if (stream.value) {
      stream.value.getTracks().forEach(track => {
        track.stop()
      })
      stream.value = null
      resolve("success")
    } else {
      reject("摄像头关闭失败")
    }
  })
}


// 创建一个空的视频轨道
export const createEmptyVideoTrack = (): MediaStreamTrack => {
  const canvas: HTMLCanvasElement = document.createElement("canvas")
  canvas.width = 1;
  canvas.height = 1;
  const context: CanvasRenderingContext2D | null = canvas.getContext("2d")
  if (context) {
    context.fillStyle = "black"
    context.fillRect(0, 0, canvas.width, canvas.height)
  }
  // canvas.captureStream() 是一个强大的 API，它可以将 Canvas 的内容捕获为实时的 MediaStream（媒体流）。
  const stream = canvas.captureStream()
  return stream.getVideoTracks()[0]
}

// 创建一个空的声音轨道
export const createEmptyAudioTrack = (): MediaStreamTrack => {
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  const destination = oscillator.connect(audioContext.createMediaStreamDestination())
  oscillator.start()
  const track = (destination as any).stream.getAudioTracks()[0]
  track.enabled = false
  return track
}

let cameraStream: MediaStreamType = null // 获取的摄像头流
let screamStream: MediaStreamType = null // 获取的屏幕流(共享屏幕的流)


// 变量定义
// let cameraStream: MediaStreamType = null // 获取的摄像头流
// let screamStream: MediaStreamType = null // 获取的屏幕流(共享屏幕的流)
// let localStream: MediaStreamType = null // 本地流(最终页面上看到的流)

// 初始化视频流，在页面初始化的时候调用
/**
 * @param micEnable 是否开启麦克风
 * @param cameraEnable 是否开启摄像头
 * @param screenId 共享屏幕的id
 * @param micOpen 麦克风是否打开
 * @param cameraOpen 摄像头是否打开
 * @returns localStream 本地流
 */
export const initStream = (micEnable: MediaDeviceInfo, cameraEnable: MediaStream, micOpen: boolean, cameraOpen: boolean, screenId: string): Promise<MediaStreamType> => {
  return new Promise((resolve, reject) => {
    nextTick(async () => {
      let localStream: MediaStreamType = new MediaStream() // 本地流(最终页面上看到的流)
      if (!micEnable) {
        // 如果麦克风没有开启，那么创建一个空的音频轨道
        const micTrack: MediaStreamTrack = createEmptyAudioTrack()
        localStream.addTrack(micTrack)
      }
      if (micEnable || cameraEnable) {
        const isMicEnable: boolean = micEnable ? true : false
        const isCameraEnable: boolean = cameraEnable ? true : false
        const stream = await initLocalCameraStream(isMicEnable, isCameraEnable)
        if (stream) {
          stream.getTracks().forEach(track => { // getTracks()方法能同时返回音频轨道或声轨
            track.enabled = false
            localStream.addTrack(track)
          })
        }
      }
      // 如果是共享屏幕的场景
      if (screenId) {
        const stream  = await initLocalScreenStream(screenId)
        if (stream) {
          localStream?.addTrack(stream.getVideoTracks()[0])
        }
      }
      // 如果没有摄像头并且也不是共享屏幕的情况
      if (!cameraEnable && !screenId) {
        // 创建一个空的视频轨道
        const cameraTrack: MediaStreamTrack = createEmptyVideoTrack()
        cameraTrack.enabled = false
        localStream!.addTrack(cameraTrack)
      }
      // 如果是共享屏幕的场景
      if (screenId) {
        const videoTracks: MediaStreamTrack[] = localStream.getVideoTracks()
        if (videoTracks.length) {
          // 如果是共享屏幕的场景，需要将本地的摄像头流删除，只保留音频流
          localStream.removeTrack(videoTracks[0])
          videoTracks[0].stop()
        }
        // 这时候需要创建本地共享屏幕的流
        const stream = await initLocalScreenStream(screenId)
        if (stream) {
          // 只需要获取视频流即可，音频流不需要
          localStream?.addTrack(stream.getVideoTracks()[0])
        }
      }
      // 不是共享屏幕，但是摄像头或者麦克风有一个有
      if (!screenId && (micEnable || cameraEnable)) {
        localStream.getTracks().forEach(track => {
          if (track.kind === 'audio') {
            track.enabled = micOpen
          }
          if (track.kind === 'video') {
            track.enabled = cameraOpen
          }
        })
      }
    // 如果即没有共享屏幕也没有摄像头，则需要创建空的视频轨道
      if (!screenId && !cameraEnable) {
        const videoTrack = createEmptyVideoTrack()
        videoTrack.enabled = false
        localStream.addTrack(videoTrack)
      }
      resolve(localStream)
    })
  })
}

// 初始化本地的摄像头流
const initLocalCameraStream = (audio: boolean, video: boolean): Promise<MediaStreamType> => {
  return new Promise(async (resolve, reject) => {
    if (!audio && !video) { // 如果麦克风和摄像头都没有开启，那么直接返回
      cameraStream = null
      resolve(null)
      return
    }
    let stream: MediaStreamType = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({video, audio})
    } catch(error) {
      console.log("获取摄像头失败", error)
      reject(error)
    }
    cameraStream = stream
    resolve(stream)
  })
}

const initLocalScreenStream = (screenId: string): Promise<MediaStreamType> => {
  return new Promise(async (resolve, reject) => {
    try {
      const stream: MediaStreamType = await navigator.mediaDevices.getUserMedia({
        audio: false, // 共享屏幕的时候不需要音频,应为本地流之前已经获取
        video: {
          width: {ideal: 1920, min: 1024},
          height: {ideal: 1080, min: 768},
          frameRate: {ideal: 25, min: 10},
          displaySurface: "window",
          deviceId: screenId
        }
      })
      screamStream = stream
      resolve(stream)
    }catch(error) {
      console.log("获取屏幕共享失败", error)
      reject(null)
    }
  })
}
