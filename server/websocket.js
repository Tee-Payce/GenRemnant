const WebSocket = require('ws');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });
    
    this.clients = new Set();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection from:', req.socket.remoteAddress);
      this.clients.add(ws);

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send welcome message
      this.sendToClient(ws, 'connected', { message: 'Connected to GenR App' });
    });
  }

  handleMessage(ws, data) {
    console.log('Received WebSocket message:', data);
    
    switch (data.type) {
      case 'ping':
        this.sendToClient(ws, 'pong', { timestamp: Date.now() });
        break;
      case 'subscribe':
        // Handle subscription to specific post updates
        ws.postId = data.payload.postId;
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  sendToClient(ws, type, payload) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    }
  }

  broadcast(type, payload) {
    const message = JSON.stringify({ type, payload });
    this.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  broadcastToPost(postId, type, payload) {
    const message = JSON.stringify({ type, payload });
    this.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN && (!ws.postId || ws.postId === postId)) {
        ws.send(message);
      }
    });
  }

  notifyReactionUpdate(postId, reaction) {
    this.broadcastToPost(postId, 'reaction_update', {
      postId,
      reaction,
      timestamp: Date.now()
    });
  }

  notifyCommentUpdate(postId, comment) {
    this.broadcastToPost(postId, 'comment_update', {
      postId,
      comment,
      timestamp: Date.now()
    });
  }

  getClientCount() {
    return this.clients.size;
  }
}

module.exports = WebSocketServer;