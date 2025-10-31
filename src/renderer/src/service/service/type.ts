export interface LoginFormData {
  email: string,
  nickName?: string,
  password: string,
  rePassword?: string,
  checkCode: string,
  checkCodeKey: string,
}

export interface SearchContact {
  userId: string
}

export interface SearchContactData{
  userId: string,
  nickName: string,
  [key: string]: any
}

export interface ContactApply {
  receiveUserId: string
}

export interface ApplyList{
  applyId: number,
  applyUserId: string,
  receiveUserId: string,
  lastApplyTime: number,
  status: number,
  nickName: string,
  statusName: string
}

export interface DealWithApplyParams {
  applyUserId: string,
  status: number
}

export interface ContactsListData{
  userId: string,
  contactId: string,
  status: number,
  lastUpdateTime: string,
  nickName: string,
  onlineType: number
}

export interface JoinMeetingFormData {
  meetingNo: string,
  nickName: string,
  joinType: "0" | "1",
  joinPassword?: string,
  screenId?: string
}

export interface UpdateUserInfo {
  userId: string,
  avatar: string,
  nickName: string,
  sex: number | string
}

export interface GetAvatar {
  userId: string,
  token: string
}