import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { onWindowControl, onLoginSuccess, onGetScreenSource, onStartRecord, onStopRecord, onOpenFile, onSaveSetting, onGetSetting, onChangeFilePath, onLogout, onOpenWindow, onThemeChange } from './ipc'
import { setWindow } from './windowProxy'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // https://www.electronjs.org/zh/docs/latest/api/base-window#new-basewindowoptions
    // 所有的配置参数可在该网页中查找
    width: 375,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    resizable: false, // 窗口大小是否可变
    maximizable: false, // 窗口是否可以最大化
    title: "腾讯会议",
    // titleBarStyle: 'hidden',
    frame: false, // 是否显示窗口边框
    transparent: false, // 窗口是否透明
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  setWindow("main", mainWindow) // 设置窗口管理

  mainWindow.webContents.openDevTools()

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on("blur", () => {
    // console.log("窗口已经失焦")
    mainWindow.webContents.send("window-blur")
  })

  mainWindow.on("focus", () => {
    // console.log("窗口已经聚焦")
    mainWindow.webContents.send("window-focus")
  })

  mainWindow.on("enter-full-screen", () => {
    mainWindow.webContents.send("window-fullscreen", true)
  })

  mainWindow.on("leave-full-screen", () => {
    mainWindow.webContents.send("window-fullscreen", false)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

onWindowControl()

onLoginSuccess()

onGetScreenSource()

onStartRecord()

onStopRecord()

onOpenFile()

onSaveSetting()

onGetSetting()

onChangeFilePath()

onLogout()

onOpenWindow()

onThemeChange()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
