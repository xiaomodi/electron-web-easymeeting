import { BrowserWindow } from "electron"

export interface WindowManage {
    [key: string]: BrowserWindow
}

export const windowManage: WindowManage = {}

export const getWindow = (name: string): BrowserWindow => {
  return windowManage[name]
}

export const setWindow = (name: string, win: BrowserWindow) => {
  windowManage[name] = win
}

export const removeWindow = (name: string): void => {
  delete windowManage[name]
}