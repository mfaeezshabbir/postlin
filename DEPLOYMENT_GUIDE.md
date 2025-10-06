# Postli Deployment Guide

Complete guide for deploying the LinkedIn Post Scheduling Application to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Deployment Options](#deployment-options)
5. [Production Checklist](#production-checklist)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Services
- **Node.js**: v20.x or higher
- **MongoDB Atlas**: Database hosting
- **Redis**: For session management and job queue (optional but recommended)
- **LinkedIn Developer Account**: For OAuth authentication
- **Image Storage**: Cloudinary, AWS S3, or similar service
- **AI Service**: Google Gemini API key

### Development Tools
- Git
- npm or yarn
- MongoDB Compass (optional, for database management)

---

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/mfaeezshabbir/postli.git
cd postli
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Database Configuration
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority"

# NextAuth Configuration
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-a-long-random-secret-string-here"

# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# Google Gemini AI Configuration
GOOGLE_API_KEY="your-google-gemini-api-key"

# Redis Configuration (Optional but recommended for production)
REDIS_URL="redis://default:password@your-redis-host:6379"
REDIS_HOST="your-redis-host"
REDIS_PORT="6379"
REDIS_PASSWORD="your-redis-password"

# Image Upload Configuration
# Option 1: Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Option 2: AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"

# Email Service Configuration (for notifications)
RESEND_API_KEY="your-resend-api-key"

# Node Environment
NODE_ENV="production"
```

### 3. Generate Secrets

Generate secure random strings for sensitive variables:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Database Setup

### 1. MongoDB Atlas Setup

1. **Create a MongoDB Atlas Account**
   - Visit [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up or log in
   - Create a new cluster (Free tier is available)

2. **Configure Network Access**
   - Go to "Network Access" in Atlas
   - Add your deployment server's IP address
   - For Vercel/cloud deployments, use `0.0.0.0/0` (allow access from anywhere)
   - **Security Note**: In production, restrict to specific IPs if possible

3. **Create Database User**
   - Go to "Database Access"
   - Create a new database user with strong credentials
   - Grant "Read and write to any database" permissions

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with your database name (e.g., `postli`)

### 2. Initialize Database Schema

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Optional: View database in Prisma Studio
npx prisma studio
```

---

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

#### A. Prepare for Vercel

1. **Update `package.json` scripts** (already configured):
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint"
  }
}
```

2. **Create `vercel.json`** (optional, for advanced configuration):
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

#### B. Deploy to Vercel

1. **Via Vercel Dashboard**:
   - Visit [https://vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Configure environment variables (copy from `.env`)
   - Click "Deploy"

2. **Via Vercel CLI**:
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

3. **Configure Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env` file
   - Ensure `NEXTAUTH_URL` matches your Vercel domain

4. **Important Vercel Considerations**:
   - The scheduled post worker runs as part of the Next.js server
   - Vercel's serverless functions have a 10-second timeout on Hobby plan
   - For long-running scheduled tasks, consider using Vercel Cron or an external worker
   - Add a `vercel.json` with cron configuration if needed:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-scheduled",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

### Option 2: Docker Deployment

#### A. Create Dockerfile

Create `Dockerfile` in the project root:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/app/generated ./app/generated

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### B. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - LINKEDIN_CLIENT_ID=${LINKEDIN_CLIENT_ID}
      - LINKEDIN_CLIENT_SECRET=${LINKEDIN_CLIENT_SECRET}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    restart: unless-stopped
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

#### C. Deploy with Docker

```bash
# Build the image
docker build -t postli:latest .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

### Option 3: Traditional VPS (DigitalOcean, AWS EC2, etc.)

#### A. Server Setup

1. **SSH into your server**:
```bash
ssh user@your-server-ip
```

2. **Install Node.js**:
```bash
# Using Node Version Manager (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Or using apt (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PM2 (Process Manager)**:
```bash
npm install -g pm2
```

4. **Install and Configure Nginx**:
```bash
sudo apt update
sudo apt install nginx
```

#### B. Deploy Application

1. **Clone and setup**:
```bash
cd /var/www
git clone https://github.com/mfaeezshabbir/postli.git
cd postli
npm install
```

2. **Create `.env` file**:
```bash
nano .env
# Paste your environment variables
```

3. **Build application**:
```bash
npx prisma generate
npm run build
```

4. **Start with PM2**:
```bash
# Create ecosystem file
pm2 init

# Edit ecosystem.config.js
nano ecosystem.config.js
```

Add the following configuration:

```javascript
module.exports = {
  apps: [{
    name: 'postli',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/postli',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

Start the application:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### C. Configure Nginx

1. **Create Nginx configuration**:
```bash
sudo nano /etc/nginx/sites-available/postli
```

Add the following:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

2. **Enable the site**:
```bash
sudo ln -s /etc/nginx/sites-available/postli /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

3. **Setup SSL with Let's Encrypt**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Production Checklist

### Security
- [ ] All environment variables are properly secured
- [ ] `NEXTAUTH_SECRET` is a strong random string
- [ ] Database credentials are secure and unique
- [ ] MongoDB network access is restricted
- [ ] SSL/TLS certificates are installed and valid
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled on API routes
- [ ] Input validation is in place

### LinkedIn OAuth
- [ ] LinkedIn App is in production mode
- [ ] Redirect URLs are correctly configured
- [ ] OAuth scopes include `w_member_social`, `r_basicprofile`, `r_emailaddress`
- [ ] App is verified with LinkedIn

### Database
- [ ] Database connection pool is optimized
- [ ] Indexes are created for frequently queried fields
- [ ] Backup strategy is in place
- [ ] Database monitoring is enabled

### Performance
- [ ] Image optimization is configured
- [ ] Static assets are cached
- [ ] Database queries are optimized
- [ ] Redis caching is enabled (if using)
- [ ] CDN is configured for static assets

### Monitoring
- [ ] Error tracking is set up (Sentry, LogRocket, etc.)
- [ ] Application logging is configured
- [ ] Uptime monitoring is active
- [ ] Performance monitoring is enabled
- [ ] Database monitoring is configured

### Scheduled Tasks
- [ ] Worker process is running and monitored
- [ ] Scheduled posts are being processed correctly
- [ ] Error handling for failed posts is working
- [ ] Logs are being captured for scheduled tasks

---

## Monitoring & Maintenance

### Application Monitoring

1. **Set up Sentry** (Error Tracking):
```bash
npm install @sentry/nextjs
```

Configure in `sentry.client.config.js`:
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

2. **PM2 Monitoring** (VPS deployments):
```bash
pm2 monit
pm2 logs postli
pm2 status
```

3. **Vercel Analytics** (Vercel deployments):
   - Enable in Vercel Dashboard → Analytics
   - Monitor performance, traffic, and errors

### Database Monitoring

1. **MongoDB Atlas Monitoring**:
   - Access Atlas dashboard
   - View real-time metrics
   - Set up alerts for high CPU/memory usage
   - Monitor slow queries

2. **Database Optimization**:
```bash
# Create indexes for better performance
npx prisma db push
```

### Backup Strategy

1. **MongoDB Atlas Automated Backups**:
   - Enable continuous backup in Atlas
   - Configure backup schedule
   - Test restore procedure

2. **Manual Backup**:
```bash
# Export database
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/postli"

# Import database
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/postli" dump/
```

### Log Management

1. **Application Logs**:
```bash
# PM2 logs
pm2 logs postli --lines 100

# Vercel logs
vercel logs
```

2. **Structured Logging**:
   - Use Winston or Pino for structured logs
   - Send logs to centralized service (Datadog, CloudWatch)

---

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Problem**: Build fails with Prisma errors
```
Solution:
- Run `npx prisma generate` before building
- Ensure DATABASE_URL is set correctly
- Check Prisma schema syntax
```

#### 2. LinkedIn OAuth Issues

**Problem**: OAuth redirect fails or returns errors
```
Solution:
- Verify redirect URL matches LinkedIn app settings exactly
- Check NEXTAUTH_URL is set correctly
- Ensure LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET are correct
- LinkedIn app must be in production mode for public use
```

#### 3. Scheduled Posts Not Publishing

**Problem**: Posts remain in SCHEDULED status
```
Solution:
- Check worker process is running: `pm2 status` or check Vercel logs
- Verify user has valid LinkedIn accessToken in database
- Check LinkedIn API rate limits
- Review worker logs for errors
- Ensure scheduledAt time is in the past
```

#### 4. Image Upload Failures

**Problem**: Images fail to upload
```
Solution:
- Verify image storage credentials (Cloudinary/S3)
- Check file size limits
- Ensure proper CORS configuration
- Verify network connectivity to storage service
```

#### 5. Database Connection Issues

**Problem**: Cannot connect to MongoDB
```
Solution:
- Verify DATABASE_URL format
- Check MongoDB Atlas network access whitelist
- Ensure database user has correct permissions
- Test connection with MongoDB Compass
```

#### 6. High Memory Usage

**Problem**: Application consuming too much memory
```
Solution:
- Monitor with `pm2 monit`
- Configure max memory restart: `pm2 start app.js --max-memory-restart 1G`
- Check for memory leaks in worker process
- Optimize database queries
- Enable Redis caching
```

### Debug Mode

Enable debug logging:

```bash
# .env.local or .env
DEBUG=* # Enable all debug logs
DEBUG=postli:* # Enable app-specific logs
NODE_ENV=development # More verbose logging
```

### Health Check Endpoint

Create `/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}
```

Access at: `https://your-domain.com/api/health`

---

## Post-Deployment

### 1. Test Core Features

- [ ] User registration and login
- [ ] LinkedIn OAuth connection
- [ ] Create and save draft posts
- [ ] Schedule posts for future publication
- [ ] Manual publish to LinkedIn
- [ ] Image upload functionality
- [ ] AI content generation
- [ ] View published post history

### 2. Performance Testing

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 https://your-domain.com/

# Or use k6
k6 run load-test.js
```

### 3. Security Audit

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### 4. Monitor for 24-48 Hours

- Check error rates
- Monitor response times
- Review scheduled post success rate
- Check database performance
- Monitor memory and CPU usage

---

## Scaling Considerations

### Horizontal Scaling

1. **Vercel**: Automatically scales
2. **VPS**: Use load balancer (Nginx, HAProxy)
3. **Docker**: Use Kubernetes or Docker Swarm

### Database Scaling

1. **Read Replicas**: For read-heavy workloads
2. **Sharding**: For very large datasets
3. **Connection Pooling**: Use Prisma's built-in pooling

### Worker Scaling

For high-volume scheduled posts:
1. Separate worker process from web server
2. Use BullMQ with Redis for job queue
3. Scale workers horizontally
4. Implement retry logic with exponential backoff

---

## Support & Resources

- **Documentation**: Check project README.md
- **Issues**: Report on GitHub repository
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Vercel Docs**: https://vercel.com/docs
- **LinkedIn API**: https://docs.microsoft.com/en-us/linkedin/

---

## Version History

- v0.1.0 - Initial deployment guide
- Last Updated: October 6, 2025

---

**Important**: Always test deployments in a staging environment before deploying to production. Keep backups of your database and configuration files.
