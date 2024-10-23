import dotenv from 'dotenv';
import { WebSocket }from 'ws'
dotenv.config();


export class WebSocketClient {
    private static instance : WebSocketClient;
    private ws! : WebSocket;

    private constructor(){
        this.connect();
    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new WebSocketClient();
            return this.instance;
        }
        return this.instance;
    }


    private connect(){
        this.ws = new WebSocket(process.env.SOCKET_URL ?? '');

        this.ws.on('open', () => {
            console.log('Connection to WS-USER established successfully');
        })

        this.ws.on('close', () => {
            console.log('Connection to ws-user lostm, Reconnecting...');
            setTimeout(() => { this.connect()}, 5000);
        })

        this.ws.on('error', () => {
            console.log('Error connecting to ws-user');
        })
    }

    public sendAndAwait(transaction: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const messageHandler = (acknowledgement: string) => {
                try {
                    const res = JSON.parse(acknowledgement);
                    if(res['payload'].txId === transaction.id){
                    resolve(res['payload']); }
                } catch (error) {
                    reject('Error parsing acknowledgement: ' + error);
                } finally {
                    // Remove the listener after receiving the message
                    this.ws.off('message', messageHandler);
                }
            };
    
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(transaction));
                this.ws.on('message', messageHandler);
            } else {
                reject('WebSocket is not open. Message not sent.');
            }
        });
    }

}


