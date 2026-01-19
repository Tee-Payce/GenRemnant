import { wsClient } from './websocket';

class RealtimeUpdates {
  constructor() {
    this.isPolling = false;
    this.pollingInterval = null;
    this.subscribers = new Map();
    this.lastUpdateTimes = new Map();
  }

  init() {
    // Try WebSocket first
    wsClient.connect();
    
    // Fallback to polling if WebSocket fails
    wsClient.on('fallback', () => {
      this.startPolling();
    });

    wsClient.on('error', () => {
      this.startPolling();
    });

    // Handle real-time updates
    wsClient.on('reaction_update', (data) => {
      this.notifySubscribers('reactions', data);
    });

    wsClient.on('comment_update', (data) => {
      this.notifySubscribers('comments', data);
    });

    wsClient.on('post_update', (data) => {
      this.notifySubscribers('posts', data);
    });
  }

  startPolling() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    console.log('Starting polling fallback for real-time updates');
    
    this.pollingInterval = setInterval(() => {
      this.pollForUpdates();
    }, 5000); // Poll every 5 seconds
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.isPolling = false;
    }
  }

  async pollForUpdates() {
    // Poll for reaction updates
    if (this.subscribers.has('reactions')) {
      try {
        const response = await fetch('http://localhost:5000/api/reactions/updates', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const updates = await response.json();
          updates.forEach(update => {
            this.notifySubscribers('reactions', update);
          });
        }
      } catch (error) {
        console.error('Polling error for reactions:', error);
      }
    }
  }

  subscribe(type, postId, callback) {
    const key = `${type}_${postId}`;
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }
    this.subscribers.get(key).push(callback);
  }

  unsubscribe(type, postId, callback) {
    const key = `${type}_${postId}`;
    if (this.subscribers.has(key)) {
      const callbacks = this.subscribers.get(key);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifySubscribers(type, data) {
    const key = `${type}_${data.postId}`;
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).forEach(callback => callback(data));
    }
  }

  sendUpdate(type, data) {
    wsClient.send(type, data);
  }

  cleanup() {
    this.stopPolling();
    wsClient.disconnect();
    this.subscribers.clear();
  }
}

export const realtimeUpdates = new RealtimeUpdates();