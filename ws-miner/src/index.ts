import { WebSocketServer } from 'ws';
import { createClient } from 'redis';
import { Block } from './block';
import dotenv from 'dotenv';
dotenv.config();

const wss = new WebSocketServer({ port: 8080 });
const blocks : Block[] = []; // Array to hold old blocks

const publisher = createClient({
  url: `redis://localhost:${process.env.REDIS_PUBSUB_PORT}`
});

(async () => {
  try {
    await publisher.connect();
  } catch (error) {
    console.error('Error connecting to Redis:', error);
  }
})();

let blockSubscriber: ReturnType<typeof createClient> | undefined;
let transactionSubscriber: ReturnType<typeof createClient> | undefined;

const initializeSubscribers = async () => {
  if (!blockSubscriber) {
    blockSubscriber = publisher.duplicate();
    transactionSubscriber = publisher.duplicate();

    await blockSubscriber.connect();
    await transactionSubscriber.connect();

    blockSubscriber.subscribe('NEW_BLOCK', (block) => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(block);
        }
      });
    });

    transactionSubscriber.subscribe('NEW_TRANSACTION', (tx) => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(tx); // Send transaction to all clients
        }
      });
    });
  }
};

// Initialize subscribers once when the server starts
initializeSubscribers();

wss.on('connection', async function connection(ws) {
    
  ws.on('error', console.error);
  ws.send(JSON.stringify({
    type: 'OLD_BLOCKS',
    payload: blocks
}));

  ws.on('message', function message(data : string) {
    const Data = JSON.parse(data);
    if(Data.type === 'NEW_BLOCK'){
      blocks.push(Data.payload)
        publisher.publish('NEW_BLOCK', JSON.stringify(Data));
    }
    if(Data.type === 'txAcknowledgements'){
        publisher.publish(JSON.stringify(Data.payload.txId), JSON.stringify(Data))
    }
  });

});


wss.on('close', () => {
  publisher.quit();
}); 