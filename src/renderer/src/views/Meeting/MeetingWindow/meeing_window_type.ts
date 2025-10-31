export interface BaseInfo {
  micEnable: MediaDeviceInfo | null, // 麦克风
  cameraEnable: MediaStream | null, // 摄像头
  micOpen: boolean,
  cameraOpen: boolean,
}

export interface SettingFormData {
  openVideo: boolean,
  openMicrophone: boolean,
  themeValue: string,
  filePath: string
}

export type FooterActiveType = "audio" | "video" | "share" | "invite" | "member" | "chat" | "";
export type ThemeType = 'dark' | 'light';

export enum Layout {
  GRID = 'GRID',
  TOP = 'TOP',
  RIGHT = 'RIGHT'
}
