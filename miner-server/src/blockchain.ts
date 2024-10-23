import { WebSocket } from "ws";
import { Transaction } from "./types/toMiner";
import { Block } from "./block";
import { ethers } from "ethers";
import { Status, UTXO } from "./utxo";
import bitcoin from "bitcoinjs-lib";
import secp256k1 from "@bitcoinerlab/secp256k1";
import { ECPairFactory } from "ecpair";

const ECPair = ECPairFactory(secp256k1);

export class Blockchain {
  private static instance: Blockchain;
  chain: Block[];
  pendingTransaction: Transaction["payload"][] = [];
  difficulty!: number;
  utxoSet: Map<string, UTXO> = new Map();
  private readonly blockTime = 10 * 60 * 1000; // 10 minutes in milliseconds
  private readonly difficultyAdjustmentInterval = 10; // Adjust difficulty every 10 blocks
  private readonly blockReward = 6.25;

  private constructor() {
    this.chain = [this.firstBlockCreation()];
    this.difficulty = 4;
    this.testUTXO();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new Blockchain();
      return this.instance;
    }
    return this.instance;
  }

  firstBlockCreation() {
    const genesisBlock = new Block(0, [], "0", this.difficulty);
    const coinbaseTx = this.createCoinbaseTransaction(
      "GenesisAddress",
      this.blockReward,
    );
    genesisBlock.transactions.push(coinbaseTx);
    return genesisBlock;
  }

  createCoinbaseTransaction(
    minerAddress: string,
    reward: number,
  ): Transaction["payload"] {
    return {
      id: this.utxoId(),
      from: "0",
      message: "",
      to: minerAddress,
      amount: reward,
      UTXO: [],
      signature: "",
    };
  }

  testUTXO() {
    const utxo1 = new UTXO("bjceo9b43zils4pjvgrhx", 5, "");
    const utxo2 = new UTXO("crc9kiunp8ednw34q1fq3o", 3, "");
    const utxo3 = new UTXO("qt02qa834kl9au3c81j4cm", 4, "");

    this.utxoSet.set("bjceo9b43zils4pjvgrhx", utxo1);
    this.utxoSet.set("crc9kiunp8ednw34q1fq3o", utxo2);
    this.utxoSet.set("qt02qa834kl9au3c81j4cm", utxo3);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(block: Block) {
    this.chain.push(block);
  }

  addTransaction(transaction: Transaction["payload"]) {
    const res = this.validateTransaction(transaction);
    if (res.valid) {
      this.pendingTransaction.push(transaction);
    }
  }

  validateTransaction(transaction: Transaction["payload"]) {
    const { message, signature, from, to, amount, UTXO, id } = transaction;

    if (from === "0") {
      return { valid: true, message: "Coinbase transaction" };
    }
    const tx = { from, to, UTXO, amount, id };
    // Decode the base64 message and signature
    const decodedMessage = Buffer.from(message, "base64");
    const decodedSignature = Buffer.from(signature, "base64");

    // Hash the message
    const messageHash = bitcoin.crypto.hash256(decodedMessage);

    // Verify the signature
    const publicKey = ECPair.fromPublicKey(Buffer.from(from, "hex")).publicKey;
    const isValid = ECPair.fromPublicKey(publicKey).verify(
      messageHash,
      decodedSignature,
    );
    if (!isValid) {
      return {
        valid: false,
        message: "Transaction has been tampered, invalid transaction",
      };
    }

    let inputAmount = 0;

    for (const ux of UTXO) {
      const storedUTXO = this.utxoSet.get(ux.id);
      if (!storedUTXO) {
        return { valid: false, message: "UTXO does not exist in the UTXO set" };
      }
      if (storedUTXO.amount !== ux.amount || storedUTXO.owner !== from) {
        return { valid: false, message: "UTXO details do not match" };
      }
      if (storedUTXO.status !== Status.unspent) {
        return {
          valid: false,
          message: "Double-spending attempted, transaction failed",
        };
      }
      inputAmount += storedUTXO.amount;
    }

    if (inputAmount < amount) {
      return { valid: false, message: "Insufficient funds" };
    } else {
      return { valid: true, message: "Valid Transaction" };
    }
  }

  validateBlock(block: Block) {
    if (
      !(this.chain[this.chain.length - 1].currentHash === block.previousHash)
    ) {
      return false;
    }
    if (block.currentHash !== block.calculateHash()) {
      return false;
    }
    block.transactions.forEach((tx) => {
      const res = this.validateTransaction(tx);
      if (!res.valid) {
        return false;
      }
    });
    return true;
  }

  adjustDifficulty() {
    const latestBlock = this.getLatestBlock();
    const prevAdjustmentBlock =
      this.chain[this.chain.length - this.difficultyAdjustmentInterval];
    const timeExpected = this.blockTime * this.difficultyAdjustmentInterval;
    const timeTaken = latestBlock.timeStamp - prevAdjustmentBlock.timeStamp;

    if (timeTaken < timeExpected / 2) {
      this.difficulty++;
    } else if (timeTaken > timeExpected * 2) {
      this.difficulty--;
    }

    console.log(`Difficulty adjusted to: ${this.difficulty}`);
  }

  utxoId() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  sendAcknowledgementTx(fills?: UTXO[], txId?: string) {
    const socket = new WebSocket(process.env.MINER_SOCKET_URL ?? "");

    socket.on("open", () => {
      console.log(
        "Connection established, sending transactions acknowledgements",
      );
    });

    socket.on("close", () => {
      console.log("Connection to ws-miner lost, Reconnecting...");
      setTimeout(() => {
        this.sendAcknowledgementTx();
      }, 5000);
    });

    socket.on("error", () => {
      console.log("Error while connecting to ws-miner");
    });

    const acknowledgement = {
      type: "txAcknowledgements",
      payload: { fills, txId },
    };

    socket.send(JSON.stringify(acknowledgement));
  }

  executeTransactions(transactions: Transaction["payload"][]) {
    transactions.forEach((tx) => {
      const totalAmount = tx.amount;
      let executedAmount = 0;
      if (tx.from === "0") {
        const MINER_ADDRESS = process.env.MINER_ADDRESS ?? "";
        const coinbaseUTXO = new UTXO(this.utxoId(), tx.amount, MINER_ADDRESS);
        this.utxoSet.set(coinbaseUTXO.id, coinbaseUTXO);
      }
      const fills: UTXO[] = [];
      tx.UTXO.forEach((ux) => {
        const fill = Math.min(ux.amount, tx.amount - executedAmount);
        executedAmount += fill;
        ux.amount -= fill;
        if (executedAmount !== totalAmount) {
          ux.changeStatus();
          const outUTXO = new UTXO(this.utxoId(), fill, tx.to);
          fills.push(outUTXO);
          this.utxoSet.set(outUTXO.id, outUTXO);
        }
        if (executedAmount == totalAmount && ux.amount !== 0) {
          ux.changeStatus();
          const outUTXO = new UTXO(this.utxoId(), totalAmount, tx.to);
          const change = new UTXO(
            this.utxoId(),
            ux.amount - totalAmount,
            tx.from,
          );
          fills.push(outUTXO, change);
          this.utxoSet.set(outUTXO.id, outUTXO);
          this.utxoSet.set(change.id, change);
        }
        if (executedAmount == totalAmount && ux.amount == 0) {
          ux.changeStatus();
          const outUTXO = new UTXO(this.utxoId(), totalAmount, tx.to);
          fills.push(outUTXO);
          this.utxoSet.set(outUTXO.id, outUTXO);
        }
        this.utxoSet.delete(ux.id);
      });
      this.sendAcknowledgementTx(fills, tx.from);
    });
  }

  mineBlock(minerAddress: string) {
    const coinbaseTx = this.createCoinbaseTransaction(
      minerAddress,
      this.blockReward,
    );
    const transactions = [coinbaseTx, ...this.pendingTransaction];

    const newBlock = new Block(
      this.chain.length,
      transactions,
      this.getLatestBlock().currentHash,
      this.difficulty,
    );

    return newBlock;
  }
}
