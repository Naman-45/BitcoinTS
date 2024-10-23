import { WebSocketServer } from 'ws';
import { createClient } from 'redis';

declare module 'ws' {
  interface WebSocketServer {
    blockSubscriber?: ReturnType<typeof createClient>;
    transactionSubscriber?: ReturnType<typeof createClient>;
  }
}