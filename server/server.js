const http = require('http');
const WebSocket = require('ws');
const { setupWSConnection } = require('y-websocket/bin/utils');

const port = process.env.PORT || 5555;
const server = http.createServer();

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// Set up the WebSocket connection to handle Yjs document sync
wss.on('connection', (ws, req) => {
  const roomName = new URL(req.url, `http://${req.headers.host}`).pathname;
  console.log(`New connection established for room: ${roomName}`);

  // Add logging for connection close event
  ws.on('close', (code, reason) => {
    console.log(`Connection closed for room: ${roomName}`);
    console.log(`Close code: ${code}, reason: ${reason}`);
  });

  // Add logging for errors on the WebSocket connection
  ws.on('error', (error) => {
    console.error(`WebSocket error in room: ${roomName}`);
    console.error(error);
  });

  // Override `setupWSConnection` to log more details about Yjs updates
  const originalSend = ws.send;
  ws.send = function (...args) {
    console.log(`Sending data to client in room: ${roomName}`);
    console.log('Data:', args[0]);
    originalSend.apply(ws, args);
  };

  ws.on('message', (message) => {
    console.log(`Received message from client in room: ${roomName}`);
    console.log('Message:', message);
  });

  setupWSConnection(ws, req);
});

// Start the HTTP and WebSocket server
server.listen(port, () => {
  console.log(`WebSocket server is running on ws://localhost:${port}`);
});
