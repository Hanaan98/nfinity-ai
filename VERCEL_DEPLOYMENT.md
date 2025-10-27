# Vercel Deployment Guide

This guide will help you deploy your Nfinity Chat Dashboard to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Your backend API deployed and accessible (e.g., on Railway, Render, Heroku, etc.)
3. Git repository for your project

## Step 1: Prepare Your Backend

Make sure your backend is deployed and note the URL. For example:

- `https://your-backend-api.railway.app`
- `https://your-backend-api.onrender.com`
- `https://your-backend-api.herokuapp.com`

Ensure your backend has CORS configured to allow requests from your Vercel domain.

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure the project:

   - **Framework Preset**: Vite
   - **Root Directory**: `./` (or leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Add Environment Variable:

   - Click "Environment Variables"
   - Add: `VITE_API_URL` = `https://your-backend-api.com`
   - Make sure it's available for Production, Preview, and Development

5. Click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from your project directory)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - What's your project's name? nfinity-chat-dashboard
# - In which directory is your code located? ./
# - Want to override settings? No

# Add environment variable
vercel env add VITE_API_URL
# Enter your backend URL when prompted
# Select: Production, Preview, Development

# Deploy to production
vercel --prod
```

## Step 3: Configure Environment Variables

In your Vercel dashboard:

1. Go to your project
2. Click "Settings" → "Environment Variables"
3. Add the following:

| Name           | Value                          | Environment                      |
| -------------- | ------------------------------ | -------------------------------- |
| `VITE_API_URL` | `https://your-backend-api.com` | Production, Preview, Development |

**Important:** Don't include trailing slashes in the URL.

## Step 4: Configure Backend CORS

Update your backend to allow requests from your Vercel domain:

```javascript
// Example for Express.js
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Local development
      "https://your-app.vercel.app", // Production
      "https://your-app-*.vercel.app", // Preview deployments
    ],
    credentials: true,
  })
);
```

## Step 5: Test Your Deployment

1. Visit your Vercel deployment URL
2. Test the following:
   - Login functionality
   - Tickets page (should load from your backend)
   - Dashboard analytics
   - Notifications
   - Chat functionality

## Environment Variables Reference

### Required

- `VITE_API_URL` - Your backend API base URL (e.g., `https://api.example.com`)

### Local Development

Create a `.env.local` file:

```
VITE_API_URL=http://localhost:3000
```

### Production

Set in Vercel dashboard:

```
VITE_API_URL=https://your-backend-api.com
```

## Troubleshooting

### Issue: API calls failing with CORS errors

**Solution:** Ensure your backend CORS settings allow your Vercel domain.

### Issue: Environment variables not working

**Solution:**

- Make sure you prefixed them with `VITE_`
- Redeploy after adding environment variables
- Check they're set for the correct environment

### Issue: 404 errors on page refresh

**Solution:** This is already handled by the `vercel.json` rewrites configuration.

### Issue: Build fails

**Solution:**

- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Test the build locally: `npm run build`

## Custom Domain

To add a custom domain:

1. Go to your project in Vercel
2. Click "Settings" → "Domains"
3. Add your domain
4. Follow the DNS configuration instructions
5. Update your backend CORS to include your custom domain

## Continuous Deployment

Vercel automatically deploys:

- **Production**: When you push to your `main` or `master` branch
- **Preview**: When you push to any other branch or open a PR

## Monitoring

- View deployment logs in Vercel dashboard
- Monitor API calls in your browser's Network tab
- Check Vercel Analytics for performance insights

## Support

- Vercel Documentation: https://vercel.com/docs
- Vite Documentation: https://vitejs.dev/guide/

---

## Quick Deployment Checklist

- [ ] Backend deployed and URL obtained
- [ ] CORS configured on backend
- [ ] Vercel account created
- [ ] Repository pushed to Git
- [ ] Project imported to Vercel
- [ ] `VITE_API_URL` environment variable set
- [ ] Deployment successful
- [ ] Login tested
- [ ] Tickets page tested
- [ ] Dashboard tested
- [ ] Notifications tested

Your app should now be live at: `https://your-project.vercel.app`
