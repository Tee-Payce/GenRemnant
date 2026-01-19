# GenR App Backend Server

This is the Node.js backend server for the GenR App portfolio application with Gmail OAuth authentication.

## Features

- **Gmail OAuth Authentication**: Sign in with Google accounts
- **Admin Management**: Restrict admin access to tkpat3@gmail.com
- **Comments System**: Users can comment on posts (requires authentication)
- **Reactions System**: One reaction per user per post with multiple reaction types
- **MongoDB Integration**: Persistent data storage

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the server directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/genr-app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=tkpat3@gmail.com
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback`
   - `http://localhost:3000` (your frontend)
6. Copy the Client ID and Client Secret to your `.env` file

### 4. MongoDB Setup

Ensure MongoDB is running:

```bash
# If using local MongoDB
mongod
```

Or use MongoDB Atlas cloud service and update `MONGODB_URI` accordingly.

### 5. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication

- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/me` - Get current user (requires token)
- `POST /auth/logout` - Logout

### Comments

- `GET /api/comments/post/:postId` - Get all comments for a post
- `POST /api/comments` - Create a comment (requires authentication)
- `PUT /api/comments/:commentId` - Update a comment (own comments only)
- `DELETE /api/comments/:commentId` - Delete a comment (own comments or admin)

### Reactions

- `GET /api/reactions/post/:postId` - Get all reactions for a post
- `GET /api/reactions/user/:postId` - Get user's reaction on a post (requires authentication)
- `POST /api/reactions` - Add/update a reaction (one per user per post)
- `DELETE /api/reactions/:postId` - Remove a reaction

### Admin Routes (tkpat3@gmail.com only)

- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/comments` - Get all comments
- `GET /api/admin/reactions` - Get all reactions
- `DELETE /api/admin/users/:userId` - Delete a user
- `DELETE /api/admin/comments/:commentId` - Delete a comment
- `DELETE /api/admin/reactions/:reactionId` - Delete a reaction

## Authentication Flow

1. User clicks "Sign in with Google"
2. App redirects to `/auth/google`
3. User authenticates with Google
4. Google redirects back to `/auth/google/callback`
5. Server creates user in database (if new) or updates existing user
6. Server generates JWT token and redirects to frontend with token
7. Frontend stores token and uses it for API requests

## Data Models

### User
- `googleId` - Google account ID
- `email` - Email address
- `displayName` - User's display name
- `profileImage` - Profile picture URL
- `isAdmin` - Admin flag (true if email matches ADMIN_EMAIL)
- `lastLogin` - Last login timestamp

### Comment
- `postId` - ID of the post being commented on
- `userId` - Reference to User
- `userEmail` - Email of commenter
- `userName` - Name of commenter
- `userAvatar` - Profile image of commenter
- `text` - Comment text

### Reaction
- `postId` - ID of the post
- `userId` - Reference to User
- `userEmail` - Email of reactor
- `reactionType` - Type of reaction (like, love, haha, wow, sad, angry)
- Unique constraint: One reaction per user per post

## Troubleshooting

- **MongoDB Connection Error**: Ensure MongoDB is running and MONGODB_URI is correct
- **OAuth Error**: Verify GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and callback URL are correct
- **CORS Error**: Check that FRONTEND_URL is correct in `.env`
- **Token Errors**: Ensure JWT_SECRET is set and consistent
