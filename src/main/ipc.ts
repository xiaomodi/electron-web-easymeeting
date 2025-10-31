import { ipcMain, BrowserWindow, IpcMainEvent, IpcMainInvokeEvent, desktopCapturer, NativeImage, shell, dialog } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { getWindow, setWindow, removeWindow, windowManage, type WindowManage } from './windowProxy'
import { initWs, logout, sendWsdata } from './wsClient'
import { startRecording, stopRecording } from './ffmpeg'
import { saveSetting, getSetting } from './setting'
import { join } from 'path'
import { type LoginSuccessType, GetScreenSource, SourceList, MapList, StartRecordParams, SettingFormData, OpenFileParams, OpenQuickMeetingParams, OpenWindowParams, ThemeType } from './main_type'
import icon from '../../resources/icon.png?asset'
import { setData, getData, initUserId } from './store'

// 获取窗口大小
enum WindowType {
  MIN = 'minimize',
  MAX = 'maximize',
  FULL = 'fullscreen',
  CLOSE = 'close'
}

interface WindowControlType {
  type: WindowType,
  forceClose?: boolean
}

interface ExtendedBrowserWindow extends BrowserWindow {
  forceClose?: boolean | null;
}

export const onWindowControl = () => {
  ipcMain.on('window-control', (e: IpcMainEvent, { type, forceClose }: WindowControlType) => {
    const webContents = e.sender
    const win = BrowserWindow.fromWebContents(webContents) as ExtendedBrowserWindow
    switch(type) {
      case 'minimize':
        win?.minimize()
        break
      case 'fullscreen':
        if (win?.isFullScreen()) {
          win?.setFullScreen(false)
          win?.setWindowButtonVisibility(false)
        } else {
          win?.setFullScreen(true)
          win?.setWindowButtonVisibility(true)
        }
        break
      case 'close': {
        if (forceClose) {
          win.forceClose = forceClose
        } else {
          win.forceClose = null
        }
        win?.close()
        break
      }
    }
  })
}

// 登陆成功
export const onLoginSuccess = () => {
  ipcMain.handle("login-success", (e: IpcMainInvokeEvent, {userInfo, wsUrl}: LoginSuccessType) => {
    // 去获取主进程窗口
    const mainWindow = getWindow('main')
    mainWindow.setResizable(true)
    mainWindow.setMinimumSize(720, 480)
    mainWindow.setSize(720, 480)
    initUserId(userInfo.userId) 
    setData('userInfo', userInfo)
    //: 初始化ws
    initWs(`${wsUrl}${userInfo.token}`)
  })
}

// 退出登陆
export const onLogout = () => {
  ipcMain.handle("logout", (e: IpcMainInvokeEvent) => {
    logout()
  })
}

// 获取屏幕源
function fileteSource(sourceList: SourceList[]): SourceList[] {
  return sourceList.filter(item => {
    const size = item.thumbnail.getSize()
    return size.width > 10 && size.height > 10
  })
}

function mapSource(sourceList: SourceList[]): MapList[] {
  return sourceList.map(item => {
    return {
      id: item.id,
      name: item.name,
      thumbnail: item.thumbnail.toDataURL(),
      display_id: item.display_id
    }
  })
}

export const onGetScreenSource = (): void => {
  ipcMain.handle("get-screen-source", async (e: IpcMainInvokeEvent, params: GetScreenSource) => {
    let source: SourceList[] = await desktopCapturer.getSources(params)
    let sourceList: SourceList[] = fileteSource(source)
    let screenSourceList: MapList[] = mapSource(sourceList)
    return screenSourceList
  })
}

// 开始录制
export const onStartRecord = (): void => {
  ipcMain.handle("start_record", (e: IpcMainInvokeEvent, params: StartRecordParams) => {
    const sender = e.sender
    const displayId = params.displayId
    const mic = params.mic
    const screenIndex = params.screenIndex
    startRecording(sender, displayId, mic, screenIndex)
  })
}

// 停止录制
export const onStopRecord = (): void => {
  ipcMain.handle("stop_record", () => {
    stopRecording()
  })
}

// 打开文件
export const onOpenFile = (): void => {
  ipcMain.handle("open_file", (e: IpcMainInvokeEvent, {localFilePath, folder = false}: OpenFileParams) => {
    if (folder) {
      shell.openPath(localFilePath)  // 直接打开视频文件
    } else {
      shell.showItemInFolder(localFilePath) // 打开视频文件所在文件夹
    }
  })
}

// 监听设置中的内容是否发生变化
export const onSaveSetting = (): void => {
  ipcMain.handle("setting-save", (e: IpcMainInvokeEvent, params: SettingFormData) => {
    saveSetting(params)
  })
}

// 获取配置文件
export const onGetSetting = () => {
  ipcMain.handle("setting-get", (e: IpcMainInvokeEvent) => {
    return getSetting()
  })
}

// 打开文件
export const onChangeFilePath = () => {
  ipcMain.handle("change-file-path", (e: IpcMainInvokeEvent, {localFilePath}) => {
    const option = {
      defaultPath: localFilePath,
      properties: ["openDirectory"] as Array<"openDirectory">
    }
    let result = dialog.showOpenDialogSync(option)
    if(!result) {
      return
    }
    return result[0]
  })
}

// 打开快速会议窗口
export const onOpenWindow = () => {
  ipcMain.handle("open-quick-meeting-window", (e: IpcMainInvokeEvent, params: OpenQuickMeetingParams) => {
    const {title, windowId, path, data, width, height, maximizable} = params
    openWindow({
      windowId,
      title,
      path,
      width,
      height,
      data,
      maximizable
    })
  })
}

// 打开新窗口(公共方法)
const openWindow = ({windowId, title, path, width = 960, height = 720, data, maximizable = false}: OpenWindowParams) => {
  let newWindow: BrowserWindow = getWindow(windowId)
  const paramsArray: string[] = []
  if (data && Object.keys(data).length) {
    path = path.endsWith("?") ? path : `${path}?`
    for(let [key, value] of Object.entries(data)) {
      paramsArray.push(`${key}=${encodeURIComponent(value)}`)
    }
    path = `${path}${paramsArray.join("&")}`
  }
  if (!newWindow) {
    newWindow = new BrowserWindow({
      width,
      height,
      minHeight: height,
      minWidth: width,
      show: false,
      autoHideMenuBar: true,
      frame: false,
      transparent: false,
      maximizable,
      title,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })
    setWindow(windowId, newWindow) // 设置窗口

    newWindow.webContents.openDevTools()

    newWindow.on('ready-to-show', () => {
      newWindow.show()
    })

    newWindow.on("close", (event) => { // 预关闭
      if (!(newWindow as any).forceClose) {
        // TODO
        // event.preventDefault()
        newWindow.webContents.send("window-will-close") // 发送预关闭事件
      }
    })

    newWindow.on("closed", () => { // 已经关闭状态 用户又可能直接通过导航栏关闭窗口所以需要监听并告诉渲染进程
      closeWindow(windowId)
      removeWindow(windowId)
    })

    newWindow.on("blur", () => {
      // console.log("窗口已经失焦")
      newWindow.webContents.send("window-blur")
    })

    newWindow.on("focus", () => {
      // console.log("窗口已经聚焦")
      newWindow.webContents.send("window-focus")
    })

    newWindow.on("enter-full-screen", () => {
      newWindow.webContents.send("window-fullscreen", true)
    })

    newWindow.on("leave-full-screen", () => {
      newWindow.webContents.send("window-fullscreen", false)
    })

    newWindow.on("maximize", () => {
      // console.log("窗口已经聚焦")
      newWindow.webContents.send("new-window-max", true)
    })

    newWindow.on("unmaximize", () => {
      // console.log("窗口已经聚焦")
      newWindow.webContents.send("new-window-unmax", true)
    })
  } else {
    newWindow.show()
    newWindow.setSkipTaskbar(false) // 在任务栏不显示
  }
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    // !! 跳转路由这里需要修改
    newWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/index.htnl#${path}`)
  } else {
    // !! 跳转路由这里需要修改
    newWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: path })
  }
}

const closeWindow = (windowId: string) => {
  const mainWindow = getWindow("main")
  if(mainWindow) {
    mainWindow.webContents.send("close-meeing-window", { windowId })
  }
}

// 监听主题切换
export const onThemeChange = () => {
  ipcMain.handle("theme-changed", (e: IpcMainInvokeEvent, theme: ThemeType) => {
    const windows: WindowManage = windowManage
    for (let [windowId, sender] of Object.entries(windows)) {
      if (windowId !== 'main') {
       (sender as BrowserWindow).webContents.send('mainWindow-theme-changed', theme)
      }
    }
  })
}

export const onSendPeerConnection = () => {
  ipcMain.handle("send-peer-connection", (e: IpcMainInvokeEvent, peerData: any) => {
    peerData.token = getData("userInfo").token
    const peerMessage = JSON.stringify(peerData)
    sendWsdata(peerMessage)
  })
}