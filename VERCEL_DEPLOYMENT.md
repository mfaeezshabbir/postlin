# Quick Deployment Guide - Vercel + MongoDB Atlas (Free Tier)

**Deploy Postli to production in under 15 minutes - completely free!**

**🎯 What You Get**:
- ✅ Free hosting on Vercel
- ✅ Free MongoDB database (512MB)
- ✅ Images stored in MongoDB (no external storage needed)
- ✅ AI-powered content generation
- ✅ Automatic HTTPS
- ✅ LinkedIn OAuth integration

---

## Overview

This guide will help you deploy your LinkedIn post scheduling application using:
- ✅ **Vercel** (Free hosting for Next.js)
- ✅ **MongoDB Atlas** (Free cloud database - 512MB storage)
- ✅ **Base64 Image Storage** (No external storage needed - images stored in MongoDB)
- ✅ **No Redis needed** (simplified deployment)

---

## Prerequisites

- GitHub account (for Vercel integration)
- MongoDB Atlas account (free)
- LinkedIn Developer account (for OAuth)
- Google Gemini API key (for AI features and image generation)

---

## Step 1: Prepare Your Code

### 1.1 Ensure Git Repository is Ready

```bash
# Make sure you're in the project directory
cd /home/mfaeezshabbir/pp/postli

# Check git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Prepare for production deployment"

# Push to GitHub
git push origin scheduling
```

### 1.2 Create `.env.example` File

Create a reference file for environment variables (don't commit actual secrets):

```bash
# Create .env.example
cat > .env.example << 'EOF'
# Database
DATABASE_URL="your-mongodb-connection-string"

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# LinkedIn OAuth
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# Google Gemini AI
GEMINI_API_KEY="your-google-gemini-api-key"
GEMINI_IMAGE_API_KEY="your-google-gemini-api-key"  # Can use same key

# Optional: Email notifications
RESEND_API_KEY="your-resend-api-key"
EOF
```

### 1.3 Update `.gitignore`

Ensure sensitive files are not committed:

```bash
# Check .gitignore includes these
cat .gitignore | grep -E "\.env$|\.env\.local"

# If not present, add them
echo -e "\n# Environment files\n.env\n.env.local\n.env*.local" >> .gitignore
```

---

## Step 2: Setup MongoDB Atlas (Free Tier)

### 2.1 Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with your email or Google account
3. Select **Free Shared Cluster** (M0 - 512MB storage)

### 2.2 Create a Cluster

1. **Choose Cloud Provider**: AWS, Google Cloud, or Azure (any is fine)
2. **Select Region**: Choose the closest region to your users
3. **Cluster Name**: `postli-cluster` (or any name you prefer)
4. Click **Create Cluster** (takes 3-5 minutes)

### 2.3 Setup Database Access

1. In MongoDB Atlas, go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. **Authentication Method**: Password
4. **Username**: `postli_user` (or your preferred username)
5. **Password**: Click **Autogenerate Secure Password** (save this!)
6. **Database User Privileges**: Select "Read and write to any database"
7. Click **Add User**

**⚠️ Important**: Save your password securely - you'll need it for the connection string!

### 2.4 Setup Network Access

1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Select **Allow Access from Anywhere** (for Vercel)
4. This will add `0.0.0.0/0` to the whitelist
5. Click **Confirm**

**Note**: This is safe for Vercel deployments as your database credentials remain secret.

### 2.5 Get Connection String

1. Go to **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Select **Connect your application**
4. **Driver**: Node.js
5. **Version**: 4.1 or later
6. **Copy the connection string**

It will look like:
```
mongodb+srv://postli_user:<password>@postli-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 2.6 Format Your Connection String

Replace `<password>` with your actual password and add database name:

```
mongodb+srv://postli_user:YOUR_ACTUAL_PASSWORD@postli-cluster.xxxxx.mongodb.net/postli?retryWrites=true&w=majority
```

**⚠️ Important Changes**:
- Replace `<password>` with your actual password
- Add `/postli` before the `?` (this is your database name)

---

## Step 3: Setup LinkedIn OAuth

### 3.1 Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click **Create app**
3. Fill in:
   - **App name**: Postli
   - **LinkedIn Page**: Select or create a LinkedIn page
   - **App logo**: Upload your logo (optional)
   - **Legal agreement**: Check the box
4. Click **Create app**

### 3.2 Get Client Credentials

1. Go to **Auth** tab
2. Copy **Client ID** (save this)
3. Copy **Client Secret** (save this)

### 3.3 Configure OAuth Settings

1. In **Auth** tab, scroll to **OAuth 2.0 settings**
2. **Redirect URLs**: Add these URLs (you'll update with your Vercel URL later):
   ```
   http://localhost:3000/api/auth/callback/linkedin
   ```

3. **Auth scopes** - Request these permissions:
   - ✅ `r_basicprofile` (View basic profile)
   - ✅ `r_emailaddress` (View email address)
   - ✅ `w_member_social` (Post, comment, and engage with content)

4. Click **Update**

**Note**: You'll add your Vercel production URL here after deployment.

---

## Step 4: Setup Google Gemini API

### 4.1 Get API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Select a project or create new one
5. Copy the API key (save this)

**Free Tier**: 60 requests per minute, generous free quota

**Note**: You'll use the same API key for both text generation and image analysis.

---

## Step 5: Generate Secrets

### 5.1 Generate NEXTAUTH_SECRET

Run one of these commands:

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output (save this) - you'll need it for Vercel.

---

## Step 6: Deploy to Vercel

### 6.1 Push Code to GitHub

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for Vercel deployment"
git push origin scheduling
```

### 6.2 Deploy via Vercel Dashboard

1. Go to [Vercel](https://vercel.com)
2. Click **Sign Up** (use GitHub account)
3. Click **Add New Project**
4. **Import Git Repository**:
   - Find your repository: `mfaeezshabbir/postli`
   - Click **Import**

5. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

6. **Add Environment Variables** (click "Environment Variables"):

   Add these variables one by one:

   ```bash
   # Database
   DATABASE_URL=mongodb+srv://postli_user:YOUR_PASSWORD@postli-cluster.xxxxx.mongodb.net/postli?retryWrites=true&w=majority

   # NextAuth (temporary - we'll update after deployment)
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-generated-secret-from-step-6

   # LinkedIn OAuth
   LINKEDIN_CLIENT_ID=your-linkedin-client-id
   LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

   # Google Gemini AI
   GEMINI_API_KEY=your-google-gemini-api-key
   GEMINI_IMAGE_API_KEY=your-google-gemini-api-key
   ```

   **⚠️ Important**: For each variable:
   - Enter the **Key** (e.g., `DATABASE_URL`)
   - Enter the **Value** (your actual value)
   - Select environment: **Production**, **Preview**, and **Development** (all three)
   - Click **Add**

7. Click **Deploy**

### 7.3 Wait for Deployment

- Vercel will build and deploy your app (takes 2-5 minutes)
- You'll see build logs in real-time
- Once complete, you'll get a deployment URL like: `https://postli-xyz123.vercel.app`

---

## Step 7: Update Configuration with Your Vercel URL

### 7.1 Update NEXTAUTH_URL in Vercel

1. In Vercel Dashboard, go to your project
2. Click **Settings** → **Environment Variables**
3. Find `NEXTAUTH_URL`
4. Click **Edit**
5. Update the value to your actual Vercel URL:
   ```
   https://postli-xyz123.vercel.app
   ```
6. Click **Save**
7. Go to **Deployments** tab
8. Click **⋯** (three dots) on the latest deployment
9. Click **Redeploy**

### 7.2 Update LinkedIn OAuth Redirect URL

1. Go back to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Open your app
3. Go to **Auth** tab
4. Scroll to **OAuth 2.0 settings** → **Redirect URLs**
5. Add your Vercel URL:
   ```
   https://postli-xyz123.vercel.app/api/auth/callback/linkedin
   ```
6. Keep the localhost URL for local development
7. Click **Update**

---

## Step 8: Initialize Database

### 8.1 Run Prisma Commands

Your database schema will be automatically pushed during the first deployment, but you can verify:

1. In Vercel Dashboard, go to **Settings** → **Functions**
2. Or manually push schema:

```bash
# Locally, ensure your DATABASE_URL is set
export DATABASE_URL="your-mongodb-connection-string"

# Generate Prisma Client
npx prisma generate

# Push schema to MongoDB
npx prisma db push
```

### 8.2 Verify Database

1. Go to MongoDB Atlas Dashboard
2. Click **Browse Collections**
3. You should see your `postli` database with collections:
   - `User`
   - `Post`
   - `Preference`
   - `Activity`

### 8.3 Understanding Image Storage

**How Images Work in Your App**:
- ✅ Images are automatically compressed to ~50-80KB
- ✅ Stored as base64 strings in MongoDB (in Post documents)
- ✅ No external storage service needed
- ✅ Target: <100KB per image

**Storage Calculation**:
- Free tier: 512MB total
- ~50KB per image = ~10,000 images
- Plus your data (users, posts, etc.)

**Benefits**:
- Simple deployment (no external services)
- Fast access (same database)
- No additional costs

**Considerations**:
- Monitor MongoDB storage usage in Atlas dashboard
- Upgrade to paid tier if approaching 512MB limit
- Images compressed from original size to ~50-80KB

---

## Step 9: Test Your Deployment

### 9.1 Access Your App

1. Open your Vercel URL in browser: `https://postli-xyz123.vercel.app`
2. You should see your app's homepage

### 9.2 Test Core Features

- ✅ **Homepage loads** correctly
- ✅ **Sign in with LinkedIn** button works
- ✅ Click **Sign in** → redirected to LinkedIn
- ✅ Authorize the app
- ✅ Redirected back to your dashboard
- ✅ Create a draft post
- ✅ Test image upload
- ✅ Schedule a post for near future (2-3 minutes ahead)
- ✅ Wait and verify post publishes to LinkedIn

### 9.3 Check Logs

If something doesn't work:

1. In Vercel Dashboard, go to your project
2. Click **Logs** or **Functions**
3. Check for errors in real-time

---

## Step 10: Configure Custom Domain (Optional)

### 10.1 Add Custom Domain in Vercel

1. In Vercel Dashboard, go to **Settings** → **Domains**
2. Enter your domain: `postli.yourdomain.com`
3. Click **Add**

### 10.2 Update DNS Records

Vercel will show you DNS records to add:

For **subdomain** (e.g., `postli.yourdomain.com`):
```
Type: CNAME
Name: postli
Value: cname.vercel-dns.com
```

For **root domain** (e.g., `yourdomain.com`):
```
Type: A
Name: @
Value: 76.76.21.21
```

### 10.3 Update Environment Variables

After domain is verified:
1. Update `NEXTAUTH_URL` in Vercel settings
2. Update LinkedIn OAuth redirect URL
3. Redeploy

---

## Troubleshooting

### Issue: Build Fails with Prisma Error

**Solution**:
```bash
# Ensure prisma generate runs before build
# This should be automatic, but verify in package.json:
{
  "scripts": {
    "build": "npx prisma generate && next build"
  }
}
```

### Issue: LinkedIn OAuth "Redirect URI Mismatch"

**Solution**:
1. Check NEXTAUTH_URL exactly matches your Vercel URL
2. Ensure LinkedIn redirect URL includes `/api/auth/callback/linkedin`
3. No trailing slash in URLs
4. Protocol must be `https://` (not `http://`)

### Issue: "Cannot connect to database"

**Solution**:
1. Verify DATABASE_URL format is correct
2. Check password doesn't contain special characters (URL encode if needed)
3. Ensure `/postli` database name is included
4. Verify MongoDB Atlas network access allows `0.0.0.0/0`

### Issue: Scheduled Posts Not Publishing

**Solution**:
1. Check Vercel logs for errors
2. Verify user has LinkedIn accessToken in database:
   ```bash
   # Use MongoDB Atlas Data Explorer
   # Check User collection for accessToken field
   ```
3. User must re-login after accessToken field was added to schema
4. Worker runs on Vercel's serverless functions (check function logs)

### Issue: Images Not Uploading

**Solution**:
1. Images are stored as compressed base64 in MongoDB
2. Check file size limits (images compressed to ~50-80KB)
3. Verify MongoDB storage space (free tier: 512MB total)
4. Check browser console for compression errors
5. Maximum image size before compression: ~5MB

### Issue: AI Content Generation Not Working

**Solution**:
1. Verify GEMINI_API_KEY in Vercel environment variables
2. Check Google AI Studio quota (60 requests/minute free tier)
3. Ensure GEMINI_IMAGE_API_KEY is also set (can use same key)
4. Review function logs for specific errors

---

## Environment Variables Checklist

Copy this checklist when setting up environment variables in Vercel:

```bash
✅ DATABASE_URL (MongoDB connection string with password and database name)
✅ NEXTAUTH_URL (Your Vercel URL)
✅ NEXTAUTH_SECRET (Generated random string)
✅ LINKEDIN_CLIENT_ID (From LinkedIn Developer Portal)
✅ LINKEDIN_CLIENT_SECRET (From LinkedIn Developer Portal)
✅ GEMINI_API_KEY (From Google AI Studio)
✅ GEMINI_IMAGE_API_KEY (From Google AI Studio - can use same key)
```

Optional:
```bash
□ RESEND_API_KEY (For email notifications)
```

---

## Post-Deployment

### Monitor Your App

1. **Vercel Dashboard**:
   - Check deployment status
   - Monitor function execution
   - View real-time logs

2. **MongoDB Atlas**:
   - Monitor database metrics
   - Check storage usage (512MB limit on free tier)
   - View slow queries

3. **Set Up Alerts**:
   - Vercel: Configure deployment notifications
   - MongoDB Atlas: Set up alerts for high usage

### Keep Your Secrets Safe

- ✅ Never commit `.env` files to Git
- ✅ Rotate secrets regularly
- ✅ Use Vercel's secret management
- ✅ Enable 2FA on all accounts (GitHub, Vercel, MongoDB, LinkedIn)

---

## Free Tier Limits

### Vercel
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ 10s serverless function timeout (Hobby plan)

### MongoDB Atlas
- ✅ 512MB storage (includes your images as compressed base64)
- ✅ Shared RAM
- ✅ No time limit
- ⚠️ Monitor storage: Each image ~50-80KB

### Google Gemini
- ✅ 60 requests/minute
- ✅ Generous free quota

---

## Upgrading (When You're Ready)

### When to Upgrade?

Consider upgrading when:
- You exceed free tier limits
- Need faster performance
- Want dedicated resources
- Require longer serverless function timeouts

### Upgrade Path

1. **Vercel Pro** ($20/month):
   - Faster builds
   - More bandwidth
   - Team collaboration
   - 60s function timeout

2. **MongoDB Atlas M10** ($0.08/hour):
   - 10GB storage (more space for images)
   - Dedicated resources
   - Automated backups
   - Better performance

---

## Quick Commands Reference

```bash
# Check deployment status
vercel ls

# View logs
vercel logs

# Pull environment variables to local
vercel env pull

# Deploy to production
vercel --prod

# Redeploy latest
vercel redeploy

# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# View database in browser
npx prisma studio
```

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **LinkedIn API**: https://docs.microsoft.com/en-us/linkedin/
- **Prisma Docs**: https://www.prisma.io/docs

---

## Success Checklist

After completing this guide, you should have:

- ✅ App deployed to Vercel
- ✅ Database running on MongoDB Atlas
- ✅ LinkedIn OAuth working
- ✅ Can create and schedule posts
- ✅ Scheduled posts automatically publish to LinkedIn
- ✅ Images upload successfully
- ✅ AI content generation works
- ✅ HTTPS enabled automatically
- ✅ All environment variables configured
- ✅ Can access app from anywhere

---

**🎉 Congratulations!** Your LinkedIn post scheduler is now live!

Share your deployment: `https://your-app.vercel.app`

---

**Need Help?** 
- Check the troubleshooting section above
- Review Vercel deployment logs
- Verify all environment variables are set correctly
- Test locally first: `npm run dev`

**Last Updated**: October 6, 2025
