// electron 主进程的 store 类似于pinia

import Store from 'electron-store'

const store = new Store();
let userId: string | null = null;

const initUserId = (_userId: string) => {
  userId = _userId;
}

const setData = (key: string, value: any): void => {
  store.set(`${userId}.${key}`, value);
}

const getData = (key: string): any => {
  return store.get(`${userId}.${key}`)
}

const getUserId = (): string => {
  if (userId) {
    return userId;
  }
  throw new Error('User ID not initialized');
}

export default {
  initUserId,
  setData,
  getData,
  getUserId,
}