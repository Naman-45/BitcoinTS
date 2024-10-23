
export enum Status {
    spent = 'spent',
    unspent = 'unspent'
  }
  
  export class UTXO {
    public id: string;
    public amount: number;
    public owner: string;
    public status: Status;
  
    constructor(id: string, amount: number, owner: string) {
      this.id = id;
      this.amount = amount;
      this.owner = owner;
      this.status = Status.unspent; // Default status is 'unspent'
    }
  
    // Method to reverse the status
    public changeStatus(): void {
      this.status = this.status === Status.unspent ? Status.spent : Status.unspent;
    }
  }