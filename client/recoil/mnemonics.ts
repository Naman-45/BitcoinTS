import { atom } from "recoil";

export const mnemonicsRC = atom<string[]>({
    key: 'mn',
    default: []
})