import { Block } from "../block";
import { UTXO } from "../utxo";

export interface Transaction {
  type: "NEW_TRANSACTION" | "COINBASE_TRANSACTION";
  payload: {
    id: string;
    message: string;
    from: string;
    to: string;
    amount: number;
    UTXO: UTXO[];
    signature: string;
  };
}

export interface OLD_BLOCKS {
  type: "OLD_BLOCKS";
  payload: Block[];
}
