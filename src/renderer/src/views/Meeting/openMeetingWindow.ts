/**
 * 
 * @param addType // 0 不共享屏幕 1 共享屏幕
 * @param screenId  // 屏幕共享id
 */
export const openMeetingWindow = (addType: string = "0", screenId: string = ""): void => {
   window.electron.ipcRenderer.invoke("open-quick-meeting-window", {
    title: "快速会议",
    windowId: 'meeting',
    path: "/meetingwindow",
    data: {
      addType,
      screenId
    },
    width: 1310,
    height: 800,
    maximizable: true
  })
}