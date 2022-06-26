import 'dotenv/config';
import WebSocket, { createWebSocketStream, WebSocketServer } from 'ws';

import { httpServer } from './http_server';
import { socketHandler } from './WebsocketServer';

const PORT = process.env.PORT || 3000;
const WEBSOCKET_PORT = parseInt(process.env.WEBSOCKET_PORT || '8080');

httpServer.listen(PORT, () => {
  console.log(`Start static http server on the ${PORT} port!`);
});

const wss = new WebSocketServer({ port: WEBSOCKET_PORT });

const sockets: WebSocket[] = [];

wss.on('connection', (ws) => {
  sockets.push(ws);
  const wsStream = createWebSocketStream(ws, { encoding: 'utf8', decodeStrings: false });

  wsStream.on('data', socketHandler(wsStream));
});

process.on('SIGINT', () => {
  sockets.forEach((ws) => ws.close());
  process.exit();
});
