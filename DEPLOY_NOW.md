# 🚀 Quick Vercel Deployment

Your app is ready to deploy to Vercel! Follow these steps:

## Prerequisites

- ✅ Backend API deployed (e.g., Railway, Render, Heroku)
- ✅ Backend URL (e.g., `https://your-api.railway.app`)
- ✅ Vercel account (free at https://vercel.com)

## Deploy in 2 Minutes

### 1. Push to GitHub (if not already)

```bash
git init
git add .
git commit -m "Ready for Vercel deployment"
git branch -M main
git remote add origin https://github.com/yourusername/yourrepo.git
git push -u origin main
```

### 2. Deploy on Vercel

**Via Dashboard:**

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add environment variable:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-url.com` (NO trailing slash)
4. Click "Deploy"

**Via CLI:**

```bash
npm i -g vercel
vercel login
vercel

# Add environment variable
vercel env add VITE_API_URL
# Enter your backend URL

# Deploy to production
vercel --prod
```

### 3. Update Backend CORS

In your backend, allow your Vercel domain:

```javascript
// Example for Express.js
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-app.vercel.app",
      "https://your-app-*.vercel.app", // For preview deployments
    ],
    credentials: true,
  })
);
```

### 4. Test Your App

Visit `https://your-project.vercel.app` and test:

- ✅ Login
- ✅ Tickets page
- ✅ Dashboard
- ✅ Notifications

## Environment Variables

### Local (.env.local)

```env
VITE_API_URL=http://localhost:3000
```

### Production (Vercel Dashboard)

```env
VITE_API_URL=https://your-backend-api.com
```

## Files Created for Deployment

- ✅ `vercel.json` - Vercel configuration
- ✅ `.env.example` - Environment variables template
- ✅ `.env.local` - Local development config
- ✅ Updated all API calls to use environment variables

## What Changed?

All hardcoded `http://localhost:3000` URLs have been replaced with:

```javascript
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
```

This allows your app to work locally AND in production.

## Troubleshooting

**CORS Errors?**

- Update backend CORS to allow your Vercel domain

**Environment variable not working?**

- Must start with `VITE_` prefix
- Redeploy after adding variables

**404 on refresh?**

- Already handled by `vercel.json` rewrites

## Need Help?

See `VERCEL_DEPLOYMENT.md` for detailed instructions.

---

**Ready to deploy? Go to https://vercel.com/new and import your repo!** 🎉
