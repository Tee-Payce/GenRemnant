require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocketServer = require('./websocket');

// Import database config
const { connectDB } = require('./config/database');

// Import models (this ensures they're loaded)
const User = require('./models/User');
const Comment = require('./models/Comment');
const Reaction = require('./models/Reaction');
const Post = require('./models/Post');

// Import routes
const authRoutes = require('./routes/auth');
const commentsRoutes = require('./routes/comments');
const reactionsRoutes = require('./routes/reactions');
const adminRoutes = require('./routes/admin');
const postsRoutes = require('./routes/posts');

const app = express();

// Connect to SQLite database
connectDB();

// Parse allowed origins from env variable
const allowedOrigins = (process.env.FRONTEND_URLS || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map(url => url.trim());

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/reactions', reactionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wsServer = new WebSocketServer(server);

// Make WebSocket server available to routes
app.set('wsServer', wsServer);

server.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`📱 Frontend URLs: ${allowedOrigins.join(', ')}`);
  console.log(`🗄️  Database: SQLite (genr-app.db)`);
  console.log(`🔌 WebSocket server running on ws://localhost:${PORT}/ws\n`);
});
