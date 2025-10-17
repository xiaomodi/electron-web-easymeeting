import { ref, onUnmounted } from 'vue'

const hasAudioInput = ref<boolean>(false)
let audioStream = ref<MediaStream | null>(null)
const volume = ref<number>(13)
const animation = ref<number | null>(null)

onUnmounted(() => {
  cancelAnimationFrame(animation.value!)
})


async function initMicrophone() {
  const devices: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();
  const audioinput: MediaDeviceInfo = devices.find(item => item.kind === 'audioinput')!
  hasAudioInput.value = !!audioinput.deviceId
  if (hasAudioInput.value) {
    openMicrophone()
  }
}

async function openMicrophone() {
  try {
    audioStream.value = await navigator.mediaDevices.getUserMedia({audio: true})
    hasAudioInput.value = true
    watchMircophone(audioStream.value)
  }catch(err){
    console.log("error", err)
  }

}

function closeMicrophone(): void {
  hasAudioInput.value = false
  const audioTracks: MediaStreamTrack[] = audioStream.value?.getAudioTracks() as MediaStreamTrack[]
  audioTracks.forEach(track => track.stop())
  cancelAnimationFrame(animation.value!)
}

function watchMircophone(audioStream: MediaStream) {
  const audioContext: AudioContext = new window.AudioContext()
  // 将麦克风的声音输入这个对象
  const mediaStreamSource: MediaStreamAudioSourceNode = audioContext.createMediaStreamSource(audioStream)
  // 创建分析节点
  const analyser: AnalyserNode = audioContext.createAnalyser()
  // 连接节点
  mediaStreamSource.connect(analyser)
  analyser.fftSize = 1024
  const bufferLength: number = analyser.frequencyBinCount
  // 获取音量数据
  const dataArray: any = new Uint8Array(bufferLength)

  function set(): void {
    analyser.getByteFrequencyData(dataArray);
    let value: number = 0;
    for(let i = 0; i < bufferLength; i++) {
      value += dataArray[i]
    }
    // 计算平均音量
    value = value / bufferLength
    volume.value = value > 100 ? 100 : value
    volume.value = 13 * (1- volume.value * 0.01)
    console.log("volume.value", volume.value)
    animation.value = requestAnimationFrame(set)
  }
  set()
}


export {
  initMicrophone,
  volume,
  closeMicrophone
}