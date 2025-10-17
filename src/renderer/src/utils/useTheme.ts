(async function() {
  try {
    console.log("获取配置文件中！")
    const settingData = await window.electron.ipcRenderer.invoke("setting-get")
    document.documentElement.setAttribute("theme", settingData.themeValue)
  } catch(error) {
    console.log("获取配置文件失败！", error)
  }
})()
