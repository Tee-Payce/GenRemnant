# GenRemnant Application - Complete Documentation

## 📋 Overview

GenRemnant is a role-based community platform for sharing and discussing sermons and daily motivations. The application features three user roles with different permissions and access levels.

---

## 👥 USER ROLES & PERMISSIONS

### 1️⃣ **Regular User**

**Permissions:**
- ✅ View published sermons and daily motivations
- ✅ Read posts on the landing page
- ✅ Comment on sermons and daily motivations
- ✅ React to posts (like, heart, amen, inspire)
- ✅ Search sermons, daily motivations, and comments
- ✅ Register and sign in
- ✅ Request upgrade to Contributing User

**Restrictions:**
- ❌ Cannot publish posts
- ❌ Cannot access admin features
- ❌ Cannot approve content

---

### 2️⃣ **Contributing User**

**Permissions:**
- ✅ All Regular User permissions
- ✅ Create daily motivations
- ✅ Create sermons
- ✅ Submit posts for admin approval
- ✅ View submission status (Pending, Approved, Rejected)
- ✅ View rejection feedback
- ✅ Edit own pending drafts
- ✅ Delete own drafts

**Restrictions:**
- ❌ Cannot publish directly (requires admin approval)
- ❌ Cannot manage users
- ❌ Cannot approve other content

---

### 3️⃣ **Admin User**

**Permissions:**
- ✅ All Regular and Contributing User permissions
- ✅ **User Management:**
  - View all users
  - Approve or reject contributor requests
  - Change user roles
  - Suspend or remove users
- ✅ **Content Management:**
  - Review pending posts
  - Approve posts for publication
  - Reject posts with feedback
  - Edit any post
  - Delete any post
  - Moderate comments and reactions
- ✅ Full access to admin dashboard

**Restrictions:**
- None (full system access)

---

## 🧭 APPLICATION PAGES

### 🏠 **1. Landing Page (Public / User View)**

**Purpose:** Reading, interaction, and authentication

**Features:**
- 📄 Display latest sermons and daily motivations (newest first)
- 📜 Infinite scroll or pagination
- 📰 Post details:
  - Title
  - Content
  - Author
  - Publication date
  - Reactions section
  - Comments section
- 🔍 Search bar (posts + comments)
- 🔘 Call-to-action buttons (Sign In, Sign Up)

**For Logged-in Users:**
- 💬 Comment input field
- 👍 Reaction buttons
- 📝 "Request to be a Contributor" option (for regular users)

---

### ✍️ **2. Create Post Page (Contributor & Admin)**

**Purpose:** Content creation and submission

**Access:** Contributing users and admins only

**Features:**
- 📝 Post creation form:
  - Post type selector (Daily Motivation / Sermon)
  - Title field
  - Rich text content editor
  - Optional summary/highlight
  - Submit button
- 📊 Status indicator for submitted posts
- ✏️ Edit pending drafts
- 🗑️ Delete drafts before approval
- 📋 View submission history with status

---

### 🛠️ **3. Admin Dashboard**

**Purpose:** Full system control and moderation

**Access:** Admins only

**Sections:**

#### **Overview Tab**
- 📊 System statistics:
  - Total users breakdown (regular, contributor, admin)
  - Published posts count
  - Pending posts count
  - System status

#### **User Management Tab**
- 👥 User list with details
- 🔄 Change user roles
- 🚫 Suspend user accounts
- ✅ Approve contributor requests
- ❌ Reject contributor requests with feedback

#### **Post Moderation Tab**
- ⏳ View all pending posts
- ✅ Approve posts for publication
- ❌ Reject posts with feedback
- ✏️ Edit post content
- 🗑️ Delete inappropriate posts

#### **Comment Moderation Tab**
- 💬 View reported comments
- 🗑️ Delete inappropriate comments
- 🎯 Manage reactions if necessary

---

## 🏗️ PROJECT STRUCTURE

```
GenRemnant/
├── src/                      # Frontend (React)
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── AuthModal.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── LandingPage.jsx      # Public feed
│   │   ├── CreatePostPage.jsx   # Post creation
│   │   ├── AdminDashboard.jsx   # Admin controls
│   │   └── ...
│   ├── styles/
│   │   ├── LandingPage.css
│   │   ├── CreatePostPage.css
│   │   ├── AdminDashboard.css
│   │   └── Header.css
│   ├── utils/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── postsApi.js
│   │   └── ...
│   ├── App.js                   # Main app component
│   └── index.js
│
├── server/                    # Backend (Node.js/Express)
│   ├── config/
│   │   ├── database.js        # SQLite setup
│   │   └── env.js             # Environment variables
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   └── Reaction.js
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── PostController.js
│   │   ├── InteractionController.js
│   │   └── AdminController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   ├── interactionRoutes.js
│   │   └── adminRoutes.js
│   └── index.js               # Server entry point
│
├── .env.example               # Environment variables template
├── package.json               # Frontend dependencies
└── README.md                  # This file
```

---

## 🗄️ DATABASE SCHEMA

### **users** table
```sql
- id (PRIMARY KEY)
- email (UNIQUE)
- displayName
- passwordHash
- role (regular, contributor, admin)
- status (active, suspended, inactive)
- contributorRequestStatus (pending, approved, rejected)
- rejectionFeedback
- createdAt
- updatedAt
```

### **posts** table
```sql
- id (PRIMARY KEY)
- authorId (FOREIGN KEY → users)
- type (sermon, daily_motivation)
- title
- content
- summary
- status (pending, approved, rejected, published)
- rejectionFeedback
- createdAt
- updatedAt
- publishedAt
```

### **comments** table
```sql
- id (PRIMARY KEY)
- postId (FOREIGN KEY → posts)
- userId (FOREIGN KEY → users)
- content
- createdAt
- updatedAt
```

### **reactions** table
```sql
- id (PRIMARY KEY)
- postId (FOREIGN KEY → posts)
- userId (FOREIGN KEY → users)
- reactionType (like, heart, amen, inspire)
- createdAt
- UNIQUE(postId, userId, reactionType)
```

### **contributor_requests** table
```sql
- id (PRIMARY KEY)
- userId (UNIQUE, FOREIGN KEY → users)
- status (pending, approved, rejected)
- requestedAt
- reviewedAt
- reviewedBy (FOREIGN KEY → users)
- feedback
```

---

## 🚀 GETTING STARTED

### **Frontend Setup**

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm start
```

The app will open at `http://localhost:3000`

### **Backend Setup**

1. **Navigate to server directory:**
```bash
cd server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```bash
# Copy from .env.example in root
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

4. **Start server:**
```bash
npm run dev  # Development with nodemon
# or
npm start   # Production
```

The API will run at `http://localhost:5000`

---

## 📡 API ENDPOINTS

### **Authentication** (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user (requires token)
- `POST /auth/logout` - User logout

### **Posts** (`/api/posts`)
- `GET /api/posts/published` - Get all published posts
- `GET /api/posts/:id` - Get specific post
- `GET /api/posts/my-posts` - Get user's posts (auth required)
- `POST /api/posts` - Create new post (contributor/admin only)
- `PUT /api/posts/:id` - Update post (author or admin only)
- `DELETE /api/posts/:id` - Delete post (author or admin only)
- `GET /api/posts/search?q=query` - Search posts

### **Interactions** (`/api/interactions`)
- `GET /api/interactions/comments/:postId` - Get post comments
- `POST /api/interactions/comments` - Add comment (auth required)
- `DELETE /api/interactions/comments/:id` - Delete comment
- `GET /api/interactions/reactions/:postId` - Get post reactions
- `POST /api/interactions/reactions` - Add reaction (auth required)
- `DELETE /api/interactions/reactions` - Remove reaction

### **Admin** (`/api/admin`) - Admin only
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users/change-role` - Change user role
- `POST /api/admin/users/suspend` - Suspend user
- `POST /api/admin/users/approve-contributor` - Approve contributor request
- `POST /api/admin/posts/pending` - Get pending posts
- `POST /api/admin/posts/approve` - Approve post
- `POST /api/admin/posts/reject` - Reject post with feedback
- `GET /api/admin/statistics` - Get system statistics

---

## 🔐 AUTHENTICATION

The application uses **Simple Token-based Authentication**.

### **How it works:**
1. User registers or logs in
2. Server returns user ID as token
3. Token stored in localStorage on client
4. Token sent in Authorization header: `Bearer <user-id>`
5. Middleware verifies token by looking up user ID in database

### **Token Structure:**
The token is simply the user's UUID ID. When making authenticated requests, include:
```
Authorization: Bearer <user-id>
```

---

## 🛡️ SECURITY FEATURES

- ✅ Password hashing with bcryptjs
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ User status checks (active/suspended)
- ✅ CORS protection
- ✅ Input validation
- ✅ Error handling

---

## 📦 DEPENDENCIES

### **Frontend:**
- React 19
- Framer Motion (animations)
- Lucide React (icons)
- Tailwind CSS (styling)
- Firebase (optional)

### **Backend:**
- Express (web framework)
- SQLite3 (database)
- bcryptjs (password hashing)
- CORS (cross-origin requests)
- UUID (unique IDs)
- dotenv (environment variables)

---

## 🧪 TESTING THE APPLICATION

### **Test User Accounts:**

**Regular User:**
```
Email: user@test.com
Password: password123
Role: regular
```

**Contributor:**
```
Email: contributor@test.com
Password: password123
Role: contributor
```

**Admin:**
```
Email: admin@test.com
Password: password123
Role: admin
```

### **Test Scenarios:**

1. **Regular User Flow:**
   - Sign up / Sign in
   - View posts
   - Comment on posts
   - React to posts
   - Request to become contributor

2. **Contributor Flow:**
   - Create a sermon/daily motivation
   - Submit for approval
   - View submission status
   - Edit pending post

3. **Admin Flow:**
   - Access admin dashboard
   - Review pending posts
   - Approve/reject with feedback
   - Manage users
   - View system statistics

---

## 🐛 TROUBLESHOOTING

### **CORS Errors:**
- Ensure backend is running on port 5000
- Check CORS_ORIGIN in .env file

### **Database Issues:**
- Delete `genremnant.db` to reset database
- Tables will be recreated on server start

### **Authentication Issues:**
- Clear localStorage: `localStorage.clear()`
- Check JWT_SECRET is consistent
Ensure token is valid user ID
### **Port Already in Use:**
```bash
# Kill process on port 5000 (Linux/Mac):
lsof -ti:5000 | xargs kill -9

# Kill process on port 5000 (Windows):
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 📝 ENVIRONMENT VARIABLES

Create a `.env` file in the server directory:

```env
# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 📚 ADDITIONAL RESOURCES

- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [JWT Guide](https://jwt.io)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Framer Motion](https://www.framer.com/motion)

---

## 📄 LICENSE

This project is proprietary and confidential.

---

## 💡 SUPPORT

For issues or questions, please contact the development team.

**Version:** 1.0.0  
**Last Updated:** January 20, 2026
