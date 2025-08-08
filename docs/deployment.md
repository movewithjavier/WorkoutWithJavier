# Deployment Guide - WorkoutsWithJavier

## Split Architecture Deployment

### Backend: Railway
**Why Railway:** Perfect for Express servers with persistent database connections

### Frontend: Vercel  
**Why Vercel:** Optimized for static React apps with global CDN

## Railway Backend Deployment

### 1. Environment Variables (Required)
Set these in Railway dashboard:

```bash
DATABASE_URL=postgresql://neondb_owner:npg_G5iNg7WVjxZp@ep-broad-tree-a13u854v-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=5001
SESSION_SECRET=your-secure-random-string-here
NODE_ENV=production
FRONTEND_URL=https://workoutswithjavier.vercel.app
```

### 2. Railway Deployment Steps
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

Or connect via GitHub:
1. Go to railway.app
2. Connect GitHub repo
3. Deploy from `clean-slate` branch
4. Set environment variables

### 3. Vercel Frontend Deployment

**Environment Variables:**
```bash
VITE_API_BASE_URL=https://your-app.railway.app
NODE_ENV=production
```

**Deploy:**
```bash
# Build static files
npm run build:client

# Deploy to Vercel
vercel --prod
```

### 4. Post-Deployment Testing

**Test URLs:**
- Frontend: `https://workoutswithjavier.vercel.app`
- Backend API: `https://your-app.railway.app/api/clients`
- Client Workout: `https://workoutswithjavier.vercel.app/workout/[token]`

**Test Flow:**
1. Dashboard loads with clients (cross-origin API calls)
2. Client detail page shows templates
3. Create new workout template
4. Start workout session
5. Record sets and complete workout
6. Verify historical data

### 5. Benefits of This Architecture
- **Railway:** Persistent Express server, better for database connections
- **Vercel:** Fast static site delivery, global CDN
- **Scalability:** Backend and frontend scale independently
- **Performance:** Optimized for each service type