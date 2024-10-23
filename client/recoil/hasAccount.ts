import { atom } from 'recoil';

export const accountInfo = atom<boolean>({
  key: 'accountInfo',
  default: typeof window !== 'undefined' 
    ? localStorage.getItem('hasAccount') !== null
      ? JSON.parse(localStorage.getItem('hasAccount')!)
      : false
    : false,
});