import { NativeImage } from "electron"

export interface UserInfo {
  userId: string,
  nickName: string,
  sex: number | string | null,
  token: string,
  meetingNo: string,
  admin: boolean
}

export interface LoginSuccessType {
  userInfo: UserInfo,
  wsUrl: string
}

export type SourceType = "screen" | "window"
export type ThumnailSizeOption = {
  width?: number,
  height?: number
}
export interface GetScreenSource {
  types: SourceType[],
  thumnailSize?: ThumnailSizeOption,
  fetchWindowIcons?: boolean
}

export interface SourceList {
  name: string,
  id: string,
  thumbnail: NativeImage,
  display_id: string,
  appIcon: NativeImage | null
}

export interface MapList {
  id: string,
  name: string,
  thumbnail: string,
  display_id: string
}

export interface StartRecordParams {
  displayId: string,
  mic?: string,
  screenIndex: number
}

export interface SettingFormData {
  openVideo: boolean,
  openMicrophone: boolean,
  themeValue: string,
  filePath: string
}