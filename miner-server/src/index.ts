/*                   
1) Block class :- 
    
   properties  
    - current hash
    - previous hash
    - nonce
    - transcations array
   methods
    - calculate hash
    
    
2) Blockchain :-

properties
    - chain : Block[]
    - pendingTransaction : Transaction[]
    - difficult : number (dynamic, to keep the average mining time 10 mins)

methods
    - addBlock
    - validateBlock
    -         

*/ 

import dotenv from 'dotenv'
import WebSocket from "ws";
import { Blockchain } from './blockchain';
import { Blocktype } from './types/fromMiner';
import { Block } from './block';
import { OLD_BLOCKS, Transaction } from './types/toMiner';

dotenv.config();

const blockchain = Blockchain.getInstance();
let shouldStopMining = false;
let socket: WebSocket | null = null;

function connection() {
    socket = new WebSocket(process.env.MINER_SOCKET_URL ?? '');

    socket.on('open', () => {
        console.log('Connected to ws-miner successfully');
        // Start mining when connection is established
        mineBlocksContinuously();
    });

    socket.on('close', () => {
        console.log('Connection to ws-miner lost, Reconnecting...')
        setTimeout(() => { connection(); }, 5000);
    });

    socket.on('error', (error) => {
        console.log('Error while connecting to ws-miner:', error);
    });

    socket.on('message', (message: string) => {
        const data: (Blocktype | Transaction | OLD_BLOCKS) = JSON.parse(message);
        if (data.type === 'OLD_BLOCKS') {
            blockchain.chain.push(...data.payload);
        }
        if (data.type === 'NEW_BLOCK') {
            const { transactions, previousHash, difficulty, currentHash } = data.payload;
            const block = new Block(blockchain.chain.length, transactions, previousHash, difficulty, currentHash);
            if (blockchain.validateBlock(block)) {
                blockchain.addBlock(block);
                blockchain.pendingTransaction = blockchain.pendingTransaction.filter((tran) => 
                    !transactions.some(t => t.id === tran.id)
                );
                shouldStopMining = true; // Stop current mining to start on new block
            }
        }
        if (data.type === 'NEW_TRANSACTION') {
            blockchain.addTransaction(data.payload);
        }
    });
}

connection();

async function mineBlocksContinuously() {
    while (true) {
        const minerAddress = process.env.MINER_ADDRESS ?? '';
        const newBlock = blockchain.mineBlock(minerAddress);
        
        shouldStopMining = false;

        while (!newBlock.currentHash.startsWith('0'.repeat(blockchain.difficulty)) && !shouldStopMining) {
            newBlock.nonce++;
            newBlock.calculateHash();
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        if (!shouldStopMining) {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'NEW_BLOCK', block: newBlock }));
                blockchain.addBlock(newBlock);
                console.log('Block mined and sent to WS-Miner server');
            } else {
                console.log('Socket not ready, block not sent');
            }
        } else {
            console.log('Mining operation stopped, starting new block');
        }

        // Small delay before starting to mine the next block
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}