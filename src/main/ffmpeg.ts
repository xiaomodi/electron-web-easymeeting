// 首先需要将ffmpeg这个软件打包到项目中（即从ffmpeg官网下载的exe执行文件）
// 将执行文件放到根目录。并命名ffmpeg
// 将ffmpeg的可执行文件引入

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawn, ChildProcess } from 'child_process'  // 引入流式执行命令 spaawn就是调命令执行
import { app, screen, WebContents, Display } from 'electron'


const NODE_ENV: string = process.env.NODE_ENV!;
const ffmpegPath: string = "/ffmpeg/ffmpeg"
let ffmpegProcess: ChildProcess | null = null // ffmpeg进程
let currentTime: number = 0 // 录制时间
let sender: WebContents | null = null // 给主进程发送消息

// 获取ffmpeg文件的路径
const getFFmpegPath = (): string => {
  // 如果是开发环境
  if (["DEV", "QAS"].includes(NODE_ENV)) {
    return path.join(__dirname, ffmpegPath)
  }
  // 如果是生产环境
  return path.join(app.getAppPath(), ffmpegPath)
}
/**
 * 
 * @param _sender 发送消息的进程
 * @param displayId 屏幕display_id
 * @param mic 是否开启麦克风
 * @param screenIndex 屏幕索引
 */
export const startRecording = (_sender: WebContents, displayId: string, mic: string | undefined, screenIndex: number): void => {
  sender = _sender
  currentTime = 0
  const filePath: string = `/Users/xiaomodi/Desktop/前端/electron/video/${new Date().getTime()}_temp.mp4`
  const { bounds, workArea } = getScreenInfo(displayId) // 获取屏幕信息
  console.log(bounds, workArea)
  const ffmpeg: string = getFFmpegPath() // 获取ffmpeg的路径
  const cumpType: string = os.type() // 获取操作系统类型
  // - Windows: 'Windows_NT'
  // - macOS: 'Darwin'
  // - Linux: 'Linux'
  const macos = [
    '-f', 'avfoundation', // 指定输入格式 macos
  ]
  const windows = [
    '-f', 'gdigrab', // 指定输入格式 windows
  ]
  const linux = [
    '-f', 'x11grab', // 指定输入格式 linux
  ]
  let args: string[] = [
    '-capture_cursor', '1', // 是否显示鼠标
    '-capture_mouse_clicks', '1', // 是否显示鼠标点击
    '-framerate', '30', // 帧率
    '-video_size', `${workArea.width}x${workArea.height}`, // 视频大小
    '-i', `${screenIndex}:0`, // 指定输入设备
    '-vf', `crop=${workArea.width}:${workArea.height}:${bounds.x}:${bounds.y}`,  // 使用 crop 滤镜代替 offset_x/offset_y,并且该参数一定要在输入设备参数的后面
  ]
  switch (cumpType) {
    case 'Windows_NT':
      args = [...windows, ...args]
      break;
    case 'Darwin':
      args = [...macos, ...args]
      break;
    case 'Linux':
      args = [...linux, ...args]
      break;
  }

  if (mic) {
    const micOption = [
      '-f', 'dshow', // 指定输出音频
      '-i', `audio=${mic}`, // 指定输入设备
    ]
    args = [...args, ...micOption]
  }

  const otherArgs = [
    '-c:v', 'libx264', // 视频编码
    '-preset', 'ultrafast', // 编码速度
    '-crf', '18', // 压缩质量
    '-c:a', 'aac', // 音频编码
    '-b:a', '192k', // 音频比特率
    '-g', '60', // 关键帧间隔
    '-x264-params', 'nal-hrd=cbr:force-cfr=1', // 恒定帧率
    '-ar', '44100', // 音频采样率
    '-ac', '2', // 音频通道数
    '-pix_fmt', 'yuv420p', // 视频像素格式
    '-movflags', 'frag_keyframe+empty_moov', // 视频格式
    '-fflags', '+genpts',
    '-max_interleave_delta', '0', // 减少交错延迟
    filePath, // 输出文件路径
  ]
  args = [...args, ...otherArgs]
  // 执行ffmpeg命令、
  ffmpegProcess = spawn(ffmpeg, args, {
    stdio: ['pipe', 'ignore'], //捕获stdout 和 stderr （打印日志）
    detached: true, // 创建独立的进程组
  })
  // 获取录制过程中源源不断的录制信息
  ffmpegProcess.stderr?.on('data', (data) => {
    const output = data.toString() //frame=  355 fps= 28 q=12.0 size=    2048KiB time=00:00:11.80 bitrate=1421.8kbits/s speed=0.936x elapsed=0:00:12.60 
    // console.log(output)
    const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/)
    if (timeMatch && timeMatch[0]) {
      const seconds = parseTime(timeMatch[0])
      if (seconds > currentTime) { // 由于ffmpeg在录制的过程中可能1秒会发送多条日志，所以为了避免重复发送，保证一秒发送一条消息，就需要使用此判断
        sender?.send('record-time', seconds)
        currentTime = seconds
      }
    }
  })

  //  ffmpeg出错的情况
  ffmpegProcess.on("error", err => {
    console.log("ffmpeg出错", err)
    ffmpegProcess = null
  })
  // ffmpeg退出的情况
  ffmpegProcess.on('exit', () => {
    ffmpegProcess = null
    repairVideo(filePath) // ffmpeg在路中中可能出现错误，所以需要修复
  })
}
/**
 * 
 * @param filePath 视频文件路径
 */
function repairVideo(filePath: string) {
  const ffmpeg: string = getFFmpegPath() // 获取ffmpeg执行文件路径
  const args: string[] = [
    '-i', filePath, // 输入文件路径
    filePath.replace("_temp", "")
  ]
  const process = spawn(ffmpeg, args, {
    stdio: ['pipe', 'ignore'], //捕获stdout 和 stderr （打印日志）
    detached: true, // 创建独立的进程组
  })

  process.on("error", err => {
    console.log("修复视频出错- 144行", err)
  })
  process.on('exit', (code) => {
    if (code === 0) {
      try {
        fs.unlinkSync(filePath)
        sender?.send("finish-recording", filePath.replace("_temp", "")) // 告诉渲染进程视频录制完毕，并且发送录制视频的路径
      }catch(error) {
        console.log("文件删除失败-151", error)
      }
    }
  })
}

/**
 * 
 * @param time 录制时间 'time=00:00:11.80'
 * @returns 
 */
function parseTime(time: string): number {
  const timeArr = time.replace("time=", "").split(":")
  let seconds = 0
  if (timeArr.length === 3) {
    seconds = parseInt(timeArr[0]) * 3600 + parseInt(timeArr[1]) * 60 + parseInt(timeArr[2].split(".")[0])
  }
  return seconds
}

/**
 * @param displayId 屏幕display_id
 * @returns 
 */
function getScreenInfo(displayId: string): Display {
  const allDisplay = screen.getAllDisplays()
  return allDisplay.find(item => item.id === +displayId) as Display
}

// 优雅终止信号
// process.kill('SIGTERM');  // 终止信号（允许进程清理）
// process.kill('SIGINT');   // 中断信号 (Ctrl+C)
// process.kill('SIGQUIT');  // 退出信号 (Ctrl+\)

// 强制终止信号
// process.kill('SIGKILL');  // 强制终止（无法被捕获或忽略）
// process.kill('SIGSTOP');  // 停止进程（暂停执行）

export function stopRecording(): void {
  if (ffmpegProcess) {
    ffmpegProcess.kill("SIGINT")
  }
}
