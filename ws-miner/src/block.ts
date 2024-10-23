import crypto from 'crypto';
import { Transaction } from './types/toMiner';

export class Block {
  public id: number;
  public nonce: number = 0;
  public currentHash: string;
  public timeStamp = Date.now();

  constructor(
    public Id: number,
    public transactions: Transaction['payload'][],
    public previousHash: string,
    public difficulty: number,
    public Hash?: string
  ) {
    this.id = Id;
    this.currentHash = Hash ?? this.calculateHash();
  }

  calculateHash(): string {
    return crypto.createHash('sha256')
      .update(this.id + this.previousHash + this.timeStamp + JSON.stringify(this.transactions) + this.nonce + this.difficulty)
      .digest('hex');
  }

}