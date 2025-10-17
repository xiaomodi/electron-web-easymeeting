import os from "node:os"
import path from "node:path"
import fs from "node:fs"

let localFolder: string = os.homedir()  // 获取用户目录
const cumpType: string = os.type() // 获取操作系统类型

switch (cumpType) {
  case 'Windows_NT':
    localFolder = `${localFolder.replaceAll("\\", "/")}/.easymeeting`
    break;
  case 'Darwin':
    localFolder = `${localFolder}/.easymeeting`
    break;
  case 'Linux':
    localFolder = `${localFolder}/.easymeeting`
    break;
}

if (!fs.existsSync(localFolder)) {
  try {
    fs.mkdirSync(localFolder)
  } catch(err) {
    console.log("创建文件失败！", err)
  }
}

interface SettingFormData {
  openVideo: boolean,
  openMicrophone: boolean,
  themeValue: string,
  filePath: string
}

export function saveSetting(params: SettingFormData): void {
  const configFile = localFolder + "/config.json"
  try {
    fs.writeFileSync(configFile, JSON.stringify(params), "utf8")
  }catch(err) {
    console.log("写入文件失败！", err)
  }
}

export function getSetting(): SettingFormData {
  const configFile = localFolder + "/config.json"
  if (!fs.existsSync(configFile)) {
    return {
      openVideo: true,
      openMicrophone: true,
      themeValue: "light",
      filePath: localFolder
    }
  }
  const data = fs.readFileSync(configFile, "utf8")
  return JSON.parse(data)
}








