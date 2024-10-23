import { createClient } from 'redis'
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
dotenv.config();

const wss = new WebSocketServer({ port: 3002 });

const publisher = createClient({
  url: `redis://localhost:${process.env.REDIS_PUBSUB_PORT}`
});
const txSubscriber = publisher.duplicate();

(async () => {
    try {
      await publisher.connect();
      await txSubscriber.connect();
    } catch (error) {
      console.error('Error connecting to Redis:', error);
    }
})();

wss.on('connection', async function connection(ws) {

  ws.on('error', console.error);
  ws.on('message', async function message(data : string) {
    const Data = JSON.parse(data);
    if(Data.type === 'NEW_TRANSACTION'){
        txSubscriber.subscribe(JSON.stringify(Data.payload.id), (res) => {
            wss.clients.forEach((client) => {
                if(client.readyState === WebSocket.OPEN){
                  console.log(JSON.parse(res))
                    client.send(JSON.parse(res))
                }       
            })
            txSubscriber.unsubscribe(JSON.stringify(Data.payload.from));
        })
        publisher.publish('NEW_TRANSACTION', JSON.stringify(Data));
    }
  });

});


process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await publisher.quit();
    await txSubscriber.quit();
    process.exit(0);
});