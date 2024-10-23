import { Block } from "../block"

export interface Transaction {
    type: 'NEW_TRANSACTION',
    payload: {
        id: string,
        from: string,
        to: string,
        amount: number,
        UTXO: any,
        signature: string
    }
}

export interface OLD_BLOCKS {
    type: 'OLD_BLOCKS',
    payload: Block[]
}