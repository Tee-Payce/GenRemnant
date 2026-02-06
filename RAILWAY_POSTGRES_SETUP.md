# Railway PostgreSQL Setup Guide

## Step 1: Create Railway Project

1. Go to https://railway.app and login
2. Click "New Project"
3. Select "Provision PostgreSQL" 
4. This creates a project with a PostgreSQL database

## Step 2: Add Your Application

1. In the same project, click "Add Service"
2. Select "GitHub Repo" 
3. Connect your GenRemnant repository
4. Select the `server` folder as the root directory (or configure build path)

## Step 3: Configure Environment Variables

In Railway dashboard, go to your server service → Variables tab and add:

```env
NODE_ENV=production
PORT=$PORT
CORS_ORIGIN=https://genremnant.netlify.app
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Important**: Railway automatically provides `${{Postgres.DATABASE_URL}}` when you have PostgreSQL service in the same project.

## Step 4: Configure Build Settings

In Railway dashboard, go to your server service → Settings:

**Build Command**: `npm install`
**Start Command**: `npm start`

## Step 5: Update Server Configuration

Your server is already configured for PostgreSQL! The key files are:
- ✅ `config/database-pg.js` - PostgreSQL connection
- ✅ `setupPostgreSQL.js` - Database initialization script
- ✅ All models updated for PostgreSQL syntax

## Step 6: Deploy and Initialize Database

1. **Deploy**: Push your code to GitHub (Railway auto-deploys)

2. **Initialize Database**: After first deployment, run the setup script:
   - Go to Railway dashboard → your service → Deployments
   - Click on latest deployment → "View Logs"
   - Or manually trigger: Add this to your `package.json` scripts:

```json
{
  "scripts": {
    "postinstall": "node setupPostgreSQL.js"
  }
}
```

## Step 7: Verify Deployment

1. **Check Railway logs** for any errors
2. **Test endpoints**:
   - `https://your-railway-url.railway.app/health`
   - `https://your-railway-url.railway.app/debug-users`

## Step 8: Update Frontend Configuration

Update your frontend's API URL to point to Railway:

In `src/utils/apiUrl.js`:
```javascript
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-railway-url.railway.app'
  : 'http://localhost:5000';
```

## Railway PostgreSQL Benefits

- ✅ **Persistent Data**: Unlike SQLite, data persists across deployments
- ✅ **Scalable**: PostgreSQL handles concurrent connections better
- ✅ **Backups**: Railway provides automatic backups
- ✅ **Performance**: Better performance for production workloads

## Troubleshooting

### Connection Issues
- Verify `DATABASE_URL` is set correctly in Railway variables
- Check that PostgreSQL service is running in same project

### Build Failures
- Ensure `pg` package is in dependencies (✅ already added)
- Check Railway build logs for specific errors

### Database Not Initialized
- Manually run setup: `npm run setup-postgresql`
- Check if `setupPostgreSQL.js` ran successfully in logs

## Cost Considerations

- **PostgreSQL**: $5/month for hobby plan
- **Server hosting**: Free tier available
- **Total**: ~$5/month for production-ready setup

## Migration from Local PostgreSQL

Your current `.env` has:
```env
DATABASE_URL=postgresql://genremnant_admin:password1!@localhost:5433/genremnant_db
```

Railway will replace this with:
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

This automatically connects to Railway's managed PostgreSQL instance.