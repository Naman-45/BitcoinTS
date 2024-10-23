import { Transaction } from "./toMiner"

export interface Blocktype {
    type: 'NEW_BLOCK',
    payload: {
    id: number
    nonce: number,
    transactions: Transaction['payload'][],
    difficulty: number,
    timeStamp: number,
    previousHash: string,
    currentHash: string
    }
}

