# Cloudflare R2 Storage Setup Guide

## Why Cloudflare R2?

- ✅ **S3-Compatible API** - Works with existing S3 libraries
- ✅ **Zero Egress Fees** - No charges for bandwidth out
- ✅ **10 GB Free Storage** - Forever free tier
- ✅ **Fast CDN** - Cloudflare's global network
- ✅ **Cost-Effective** - Much cheaper than AWS S3
- ✅ **No Request Fees** for first 1M requests

## Pricing (as of 2025)

| Feature | Free Tier | Beyond Free Tier |
|---------|-----------|------------------|
| Storage | 10 GB | $0.015/GB/month |
| Class A Operations | 1M/month | $4.50/million |
| Class B Operations | 10M/month | $0.36/million |
| Egress | Unlimited | **$0** (FREE!) |

**Comparison with AWS S3:**
- S3 Egress: $0.09/GB
- R2 Egress: **FREE**
- For 100GB egress: S3 = $9, R2 = $0 💰

## Step 1: Create Cloudflare Account

1. Go to [cloudflare.com](https://cloudflare.com)
2. Sign up for a free account
3. Verify your email

## Step 2: Create R2 Bucket

1. In Cloudflare Dashboard, go to **R2 Object Storage**
2. Click **"Create bucket"**
3. Enter bucket name: `postlin-media` (must be globally unique)
4. Choose location: **Automatic** (Cloudflare optimizes)
5. Click **"Create bucket"**

## Step 3: Create API Token

1. In your R2 bucket, go to **Settings** tab
2. Scroll to **R2 API Tokens**
3. Click **"Create API token"**
4. Configure:
   - **Token name**: `postlin-upload-token`
   - **Permissions**: 
     - ✅ Object Read & Write
   - **Bucket restrictions**: Choose `postlin-media`
   - **TTL**: No expiry (or set custom)
5. Click **"Create API Token"**
6. **IMPORTANT**: Copy these values immediately (shown only once):
   - Access Key ID
   - Secret Access Key
   - Endpoint URL (looks like: `https://<account-id>.r2.cloudflarestorage.com`)

## Step 4: Configure Public Access (Optional)

For images that need to be public:

1. Go to bucket **Settings**
2. Under **Public Access**, click **"Connect Domain"**
3. Options:
   - **Use Cloudflare Domain**: Get a free `r2.dev` subdomain
   - **Custom Domain**: Use your own domain

For this project, we'll use **signed URLs** for security, so public access is optional.

## Step 5: Add Environment Variables

Add to your `.env.local`:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=postlin-media
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://your-bucket.r2.dev  # Optional: if you enabled public access
```

To find your Account ID:
1. Go to Cloudflare Dashboard
2. Look at URL: `https://dash.cloudflare.com/<ACCOUNT_ID>/`
3. Or go to R2 Overview page, it's displayed there

## Step 6: Install Dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner sharp
```

**What each does:**
- `@aws-sdk/client-s3` - S3-compatible client for R2
- `@aws-sdk/s3-request-presigner` - Generate signed URLs
- `sharp` - Image optimization (resize, compress)

## Step 7: Create R2 Client

Create `/lib/r2.ts`:

```typescript
import { S3Client } from '@aws-sdk/client-s3';

if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
  throw new Error('Missing R2 environment variables. Check your .env.local file.');
}

export const r2Client = new S3Client({
  region: 'auto', // R2 uses 'auto' for region
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;
```

## Step 8: Test Connection

Create a test script `scripts/test-r2.ts`:

```typescript
import { r2Client, R2_BUCKET_NAME } from '../lib/r2';
import { PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

async function testR2() {
  try {
    // Test upload
    const testKey = 'test/hello.txt';
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: testKey,
        Body: 'Hello from Postlin!',
        ContentType: 'text/plain',
      })
    );
    console.log('✅ Upload successful!');

    // Test list
    const list = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        MaxKeys: 5,
      })
    );
    console.log('✅ List successful!');
    console.log('Files:', list.Contents?.map(obj => obj.Key));

  } catch (error) {
    console.error('❌ R2 Test failed:', error);
  }
}

testR2();
```

Run test:
```bash
npx tsx scripts/test-r2.ts
```

## Security Best Practices

### 1. Use Signed URLs for Temporary Access

Generate URLs that expire:

```typescript
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

const signedUrl = await getSignedUrl(
  r2Client,
  new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
  }),
  { expiresIn: 3600 } // 1 hour
);
```

### 2. Validate File Types

```typescript
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
  throw new Error('Invalid file type');
}
```

### 3. Scan for Malware (Optional)

Consider using:
- Cloudflare Gateway (built-in malware scanning)
- ClamAV integration
- Third-party scanning services

### 4. Rate Limiting

Implement upload rate limiting per user:

```typescript
// Example with Redis
const uploadCount = await redis.incr(`uploads:${userId}:${today}`);
if (uploadCount > 50) {
  throw new Error('Daily upload limit reached');
}
await redis.expire(`uploads:${userId}:${today}`, 86400);
```

## File Organization Structure

Organize files by type and user:

```
postlin-media/
├── images/
│   ├── user_123/
│   │   ├── 2025/10/
│   │   │   ├── abc123.jpg
│   │   │   └── def456.png
│   └── user_456/
├── videos/
│   ├── user_123/
│   │   └── 2025/10/
│   │       └── xyz789.mp4
└── temp/
    └── (files that auto-expire)
```

## File Naming Strategy

Use this pattern:
```
{type}/{userId}/{year}/{month}/{timestamp}-{random}.{ext}
```

Example:
```typescript
const fileName = `images/${userId}/${year}/${month}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
```

## Cleanup Strategy

### 1. Set Object Lifecycle Rules

In R2 Dashboard:
1. Go to bucket **Settings**
2. **Lifecycle Rules** → **Add Rule**
3. Example: Delete objects in `temp/` after 7 days

### 2. Scheduled Cleanup Job

Create a cron job to delete unused media:

```typescript
// Clean up media older than 30 days with no post reference
async function cleanupOrphanedMedia() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const orphanedMedia = await prisma.media.findMany({
    where: {
      uploadedAt: { lt: thirtyDaysAgo },
      // No post references this media
      posts: { none: {} }
    }
  });

  for (const media of orphanedMedia) {
    // Delete from R2
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: getKeyFromUrl(media.fileUrl),
      })
    );
    
    // Delete from database
    await prisma.media.delete({ where: { id: media.id } });
  }
}
```

## Monitoring

### 1. Cloudflare Dashboard

Monitor in R2 Overview:
- Storage used
- Request count
- Operation costs
- Bandwidth usage

### 2. Application Logging

Log all uploads:

```typescript
console.log({
  event: 'media_uploaded',
  userId,
  fileName,
  fileSize,
  duration: Date.now() - startTime,
});
```

### 3. Error Tracking

Use Sentry or similar:

```typescript
try {
  await uploadToR2(file);
} catch (error) {
  Sentry.captureException(error, {
    tags: { operation: 'r2_upload' },
    extra: { fileName, fileSize },
  });
  throw error;
}
```

## Troubleshooting

### "Access Denied" Error

**Problem**: R2 returns 403 Forbidden

**Solutions**:
1. Check API token has correct permissions
2. Verify bucket name is correct
3. Check Access Key ID and Secret
4. Ensure endpoint URL includes account ID

### "Invalid Region" Error

**Problem**: AWS SDK expects region

**Solution**: Use `region: 'auto'` for R2

### Slow Uploads

**Problem**: Large files taking too long

**Solutions**:
1. Implement chunked uploads for files > 50MB
2. Use multipart upload
3. Compress images before upload
4. Show progress bar to user

### CORS Issues

**Problem**: Browser blocks upload from frontend

**Solution**: Configure CORS in R2:

```json
[
  {
    "AllowedOrigins": ["https://your-domain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

## Cost Optimization Tips

1. **Compress images** with Sharp before upload
2. **Use WebP format** for images (smaller size)
3. **Delete temporary files** after 24 hours
4. **Implement deduplication** (check hash before upload)
5. **Set object lifecycle rules** for auto-cleanup
6. **Use appropriate video codecs** (H.264 for compatibility)

## Next Steps

1. ✅ Complete this setup
2. ✅ Test with sample upload
3. ✅ Implement image upload API
4. ✅ Implement video upload API
5. ✅ Add progress tracking
6. ✅ Test end-to-end flow

## Resources

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)

---

**Ready to implement?** Proceed to the implementation files! 🚀
