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

type WsType = WebSocket & { isAlive?: boolean };

wss.on('connection', (ws: WsType) => {
  function heartbeat() {
    ws.isAlive = true;
  }
  sockets.push(ws);
  const wsStream = createWebSocketStream(ws, { encoding: 'utf8', decodeStrings: false });

  wsStream.on('data', socketHandler(wsStream));
  ws.on('pong', heartbeat);
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws: WsType) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});

process.on('SIGINT', () => {
  sockets.forEach((ws) => ws.close());
  process.exit();
});

process.on('exit', () => {
  sockets.forEach((ws) => ws.close());
});
