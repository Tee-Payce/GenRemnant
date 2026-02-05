# GenRemnant Frontend - Netlify Deployment Guide

## Method 1: Drag & Drop (Easiest)

### 1. Build the App
```bash
npm run build
```

### 2. Deploy to Netlify
1. Go to https://netlify.com
2. Sign up/login
3. Drag the `build` folder to Netlify dashboard
4. Your site is live!

## Method 2: Git Integration (Recommended)

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect to Netlify
1. Go to https://netlify.com
2. Click "New site from Git"
3. Choose GitHub and select your repo
4. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
5. Click "Deploy site"

### 3. Set Environment Variables
In Netlify dashboard:
1. Go to Site settings → Environment variables
2. Add: `REACT_APP_API_URL` = `https://genremnantserver-production.up.railway.app`

### 4. Custom Domain (Optional)
1. Go to Domain settings
2. Add custom domain
3. Update DNS records as instructed

## Deploy Commands
```bash
# Build locally
npm run build

# Test build locally
npx serve -s build
```

Your React app will be live on Netlify with automatic deployments from Git!