# Backend Server Setup and Start Guide

## Prerequisites

Make sure you have:
- Node.js installed (v16 or higher)
- npm installed
- You're in the `pro_portfolio/server` directory

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
The `.env` file is already created with default values. If you need to customize:

```
PORT=5000
FRONTEND_URLS=http://localhost:3000,http://localhost:3001
JWT_SECRET=dev_secret_key_change_in_production
ADMIN_EMAIL=tkpat3@gmail.com
```

### 3. Start the Server

**Development mode (with auto-reload on file changes):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## Database

- **Type**: SQLite
- **Location**: `server/genr-app.db` (auto-created on first run)
- **Models**: User, Post, Comment, Reaction

The database will automatically create tables on first run.

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (requires token)
- `POST /auth/logout` - Logout

### Posts
- `GET /api/posts` - Get all published posts
- `GET /api/posts/:postId` - Get specific post
- `POST /api/posts` - Create post (admin only)
- `PUT /api/posts/:postId` - Update post (admin only)
- `DELETE /api/posts/:postId` - Delete post (admin only)

### Comments
- `GET /api/comments/post/:postId` - Get comments for a post
- `POST /api/comments` - Create comment (requires auth)
- `PUT /api/comments/:commentId` - Update comment
- `DELETE /api/comments/:commentId` - Delete comment

### Reactions
- `GET /api/reactions/post/:postId` - Get reactions for a post
- `GET /api/reactions/user/:postId` - Get user's reaction on post (requires auth)
- `POST /api/reactions` - Add/update reaction (one per user per post)
- `DELETE /api/reactions/:postId` - Remove user's reaction

### Admin
- `GET /api/admin/stats` - Get dashboard stats (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/comments` - Get all comments (admin only)
- `GET /api/admin/reactions` - Get all reactions (admin only)
- `DELETE /api/admin/users/:userId` - Delete user (admin only)
- `DELETE /api/admin/comments/:commentId` - Delete comment (admin only)

## Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Register User
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "displayName": "Test User",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, change it in `.env`:
```
PORT=5001
```

### CORS Errors
Make sure `FRONTEND_URLS` in `.env` includes your frontend URL:
```
FRONTEND_URLS=http://localhost:3000,http://localhost:3001
```

### Database Errors
Delete `genr-app.db` to reset the database, then restart the server to recreate it.

### Module Not Found Errors
Make sure you've run `npm install` and all files are in the correct locations.

## Production Deployment

Before deploying to production:

1. Change `JWT_SECRET` to a strong random string
2. Update `ADMIN_EMAIL` with your admin email
3. Update `FRONTEND_URLS` with your production domain
4. Set `NODE_ENV=production`
5. Use a proper database backup solution for SQLite
