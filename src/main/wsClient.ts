// ws链接放在主进程中，防止由于放在渲染进程中会出现多次的断开连接

import WebSocket from 'ws';
import { windowManage, getWindow } from './windowProxy'

let ws: WebSocket | null = null
const MAXRETRIES: number = 5 // 最大重试次数
let retryCount: number = 0 // 当前重试次数
const retryInterval: number = 2000 // 重试间隔时间
const HEARTBEAT_INTERVAL: number = 5000 // 心跳间隔时间
let heartbeatTimer: NodeJS.Timeout | null = null // 心跳定时器
let wsUrl: string | null = null
let needReconnect: boolean = false // 是否需要重连

// 初始化
const initWs = (_wsurl: string) => {
  wsUrl = _wsurl
  needReconnect = true // 需要重连
  connectws()
}

/**
 * 检查是否启用WebSocket连接的函数
 * 通过读取环境变量VITE_WS_CHECK的值来判断
 * @returns {boolean} 如果VITE_WS_CHECK环境变量值为'true'则返回true，否则返回false
 */
const wsCheck = (): boolean => {
  return import.meta.env.VITE_WS_CHECK === 'true'
}

// 连接ws
const connectws = (): void => {
  // 如果ws存在 并且readyState（ws状态）已经处于连接状态（OPEN）或者readyState的状态为正在连接（CONNECTING）状态，则不进行连接
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    console.log("已经连接上")
    return
  }

  console.log(`尝试连接...（重试次数：${retryCount}/${MAXRETRIES}），连接地址-wsUrl：${wsUrl}`)
  ws = new WebSocket(wsUrl)
  // 连接成功
  ws.onopen = () => {
    // 如果尝试次数大于0，并且校验连接
    if (retryCount > 0 && wsCheck()) {
      // 拿到窗口
      const mainWindow = getWindow('main')
      mainWindow.webContents.send('ws-reconnect-success', true) // 告诉渲染端，重连成功
    }
    retryCount = 0
    console.log("websocket连接成功")
    // 连接成功，开始发送心跳
    startHeartbeat()
  }

  // 消息接受
  ws.onmessage = (event) => {
    console.log("ws.onmessage", event)
    const data = JSON.parse(event.data)
    const mainWindow = getWindow('main')
    switch(data.messageType) {
      case 8: //好友申请
        mainWindow.webContents.send("ws-friend-apply", data)
        break
      case 12: // 处理好友申请
        mainWindow.webContents.send("ws-friend-apply-handle", data)
        break
    }
  }

  // 出现错误情况
  ws.onerror = () => {
    ws.close() // 关闭连接
    console.log("websocket连接出现错误")
  }

  // 连接关闭
  ws.onclose = () => {
    cleanHeartBeatTimers() // 清除心跳定时器
    handleReconnect() // 处理重连
  }
}

const handleReconnect = (): void => {
  if (!needReconnect) return  // 如果不需要重连，则直接返回
  if (retryCount >= MAXRETRIES) {
    console.error("已经到达最大重试次数，停止重试")
    retryCount = 0
    if (wsCheck()) {
      logout()  // 退出登录
    }
    return
  }
  retryCount++
  const delay: number = retryInterval * Math.pow(1.5, retryCount -1) // 计算重试间隔时间(延迟策略：重试间隔时间 * 当前尝试次数的1.5次方)
  console.log(`连接断开，等待${delay}ms后进行重连`)
  if (wsCheck()) {
    const mainWindow = getWindow('main')
    mainWindow.webContents.send('ws-reconnect-fail', true) // 告诉渲染端，重连失败
  }
  // 等待deley时间后，重新连接
  setTimeout(() => {
    connectws()
  }, delay)
}

// 开启心跳定时器
const startHeartbeat = (): void => {
  heartbeatTimer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) { // 保证websocket处于连接状态
      ws.send("ping")
    }
  }, HEARTBEAT_INTERVAL)
}

// 清除心跳定时器
const cleanHeartBeatTimers = (): void => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

const logout = (closeWS: boolean = true): void => {
  const login_width = 375
  const login_height = 670
  const mainWindow = getWindow('main')
  mainWindow.setResizable(true)
  mainWindow.setMinimumSize(login_width, login_height)
  mainWindow.setSize(login_width, login_height)
  mainWindow.setResizable(false)

  if (closeWS) {
    needReconnect = false
    ws.close()

    // 关闭所有窗口
    const window = windowManage
    for (let win in window) {
      if (win !== 'main') {
        window[win].close()
      }
    }
    mainWindow.webContents.send("ws-logout")
  }
} // 退出登录

const sendWsdata = (data): void => {
  if (!ws) {
    return
  }
  ws.send(data)
}

export {
  initWs,
  logout,
  sendWsdata
}