# 🚀 Next Steps: Complete R2 Media Upload Setup

## ✅ What's Already Done

- ✅ **Complete UI Redesign**: Modern DraftModal with split layouts
- ✅ **Media Components**: MediaUpload, AIImageOptionsDialog, ImagePromptDialog
- ✅ **Database Schema**: Media model, MediaType enum, ImageGenerationType enum
- ✅ **R2 Integration Code**: Complete upload/delete/signed URL functionality
- ✅ **API Routes**: Enhanced image & video upload with R2 + fallback
- ✅ **Documentation**: R2_STORAGE_SETUP.md, TESTING_MEDIA_UPLOAD.md
- ✅ **Graceful Fallback**: App works even without R2 configuration

---

## 🔧 What You Need to Do Now

### **Step 1: Install Dependencies** (2 minutes)

```bash
cd /home/mfaeezshabbir/pp/postli

# Install AWS SDK for R2 (Cloudflare uses S3-compatible API)
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Install Sharp for image optimization (optional but recommended)
npm install sharp

# Verify installation
npm list @aws-sdk/client-s3
```

**Expected Output:**
```
postlin@1.0.0 /home/mfaeezshabbir/pp/postli
├── @aws-sdk/client-s3@3.x.x
└── @aws-sdk/s3-request-presigner@3.x.x
```

---

### **Step 2: Configure Cloudflare R2** (10 minutes)

#### 2.1 Create R2 Account & Bucket
Follow the detailed guide in **`docs/R2_STORAGE_SETUP.md`**, sections:
- "2. Create R2 Bucket"
- "3. Generate API Token"

**Quick Summary:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → R2
2. Create bucket named: `postlin-media`
3. Generate API token with "Read & Write" permissions
4. Copy your Account ID, Access Key ID, and Secret Access Key

#### 2.2 Update Environment Variables
Add these to your `.env.local`:

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=postlin-media
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev  # Optional: from bucket settings → Public URL
```

**Where to find these:**
- `R2_ACCOUNT_ID`: Cloudflare dashboard → R2 → Overview (top right)
- `R2_ACCESS_KEY_ID` & `R2_SECRET_ACCESS_KEY`: Generated when creating API token
- `R2_BUCKET_NAME`: The bucket you created (e.g., `postlin-media`)
- `R2_PUBLIC_URL`: Bucket settings → Public Access → Custom Domain or R2.dev subdomain

---

### **Step 3: Update Prisma Database** (2 minutes)

```bash
# Generate Prisma client with new Media model
npx prisma generate

# Push schema changes to MongoDB
npx prisma db push

# Verify Media model exists
npx prisma studio
# → Open http://localhost:5555 and check for "Media" table
```

**Expected Output:**
```
✔ Generated Prisma Client to ./app/generated/prisma

Your database is now in sync with your Prisma schema.
```

---

### **Step 4: Test the Implementation** (15 minutes)

#### 4.1 Start Development Server
```bash
npm run dev
```

#### 4.2 Test Each Feature
Follow the test plan in **`docs/TESTING_MEDIA_UPLOAD.md`**:

1. **AI Image Generation (Automatic)**
   - Open DraftModal → Media section
   - Click "AI Generate Image" → "Generate for Me"
   - Verify image appears with "AI Generated" badge

2. **AI Image Generation (Manual Prompt)**
   - Click "AI Generate Image" → "Give Me a Prompt"
   - Verify prompt dialog opens with 6 tool links
   - Test copy button and external tool links

3. **Manual Image Upload**
   - Drag & drop an image or click to browse
   - Verify preview appears with "User Uploaded" badge
   - Check browser console for upload success

4. **Video Upload**
   - Select a video file (<200MB)
   - Verify video preview with play controls
   - Check console for R2 upload confirmation

5. **Verify R2 Storage**
   - Go to Cloudflare Dashboard → R2 → `postlin-media`
   - Check for uploaded files in folder structure:
     ```
     images/
       user-123/
         2024/
           01/
             1234567890-abc123.jpg
     videos/
       user-123/
         2024/
           01/
             1234567891-def456.mp4
     ```

6. **Verify Database**
   ```bash
   npx prisma studio
   # → Open Media table
   # → Check for entries with fileUrl, fileSize, mediaType
   ```

---

### **Step 5: Verify Fallback Behavior** (5 minutes)

Test that the app still works without R2:

1. **Temporarily Remove R2 Config**
   ```bash
   # In .env.local, comment out R2 variables:
   # R2_ACCOUNT_ID=...
   # R2_ACCESS_KEY_ID=...
   # etc.
   ```

2. **Restart Dev Server**
   ```bash
   npm run dev
   ```

3. **Test Image Upload**
   - Upload an image through DraftModal
   - Should fall back to existing upload strategy
   - Console should show: "⚠️ R2 not configured, using fallback strategy"

4. **Restore R2 Config**
   - Uncomment R2 variables in `.env.local`
   - Restart server

---

## 📊 How to Check If Everything Works

### ✅ Success Checklist

- [ ] Dependencies installed without errors
- [ ] `.env.local` has all 4 R2 variables
- [ ] `npx prisma generate` succeeds
- [ ] `npx prisma db push` succeeds
- [ ] Dev server starts without errors
- [ ] DraftModal opens with new media UI
- [ ] AI image generation (both modes) works
- [ ] Manual image upload shows preview
- [ ] Video upload works and shows preview
- [ ] Cloudflare R2 dashboard shows uploaded files
- [ ] Prisma Studio shows Media table entries
- [ ] Fallback works when R2 is disabled
- [ ] No console errors during normal operation

### 🚨 Common Issues & Fixes

**Issue: "Cannot find module '@aws-sdk/client-s3'"**
- **Fix**: Run `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
- **Verify**: `npm list @aws-sdk/client-s3` shows installed version

**Issue: "R2 upload failed: No credentials"**
- **Fix**: Check `.env.local` has correct R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY
- **Verify**: Values are not empty and don't have extra spaces

**Issue: "Video upload not configured"**
- **Fix**: This is expected if dependencies aren't installed yet
- **Verify**: Complete Step 1 above

**Issue: "Prisma Client Validation Error"**
- **Fix**: Run `npx prisma generate && npx prisma db push`
- **Verify**: Check `app/generated/prisma` folder exists

**Issue: "Dialog still not full width"**
- **Already Fixed**: DraftModal now uses `!max-w-[98vw] !w-[98vw]`
- **Verify**: Inspect element → should show `width: 98vw`

**Issue: Images not appearing in R2 dashboard**
- **Fix**: 
  1. Check bucket name matches `R2_BUCKET_NAME` in `.env.local`
  2. Verify API token has "Read & Write" permissions
  3. Check browser console for detailed error messages
- **Debug**: Add `console.log(process.env.R2_BUCKET_NAME)` in `lib/r2.ts`

---

## 🎯 Quick Start Command Chain

Copy-paste this entire block to complete setup in one go:

```bash
cd /home/mfaeezshabbir/pp/postli

# Install dependencies
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner sharp

# Update Prisma
npx prisma generate && npx prisma db push

# Start dev server
npm run dev
```

Then:
1. Configure `.env.local` with R2 credentials (see Step 2.2 above)
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Test in browser: http://localhost:3000

---

## 📚 Reference Documentation

- **R2 Setup Guide**: `docs/R2_STORAGE_SETUP.md`
- **Testing Guide**: `docs/TESTING_MEDIA_UPLOAD.md`
- **TODO List**: `docs/MEDIA_UPLOAD_TODO.md`
- **Cloudflare R2 Docs**: https://developers.cloudflare.com/r2/
- **AWS SDK S3 Client**: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/

---

## 🎉 What Happens After Setup

Once everything is configured:

1. **Automatic R2 Upload**: All images & videos → Cloudflare R2 (10GB free)
2. **Database Tracking**: Media model stores URLs, metadata, user linkage
3. **Graceful Fallback**: If R2 fails, uses existing upload methods
4. **Optimized Images**: Sharp automatically resizes/compresses images
5. **Signed URLs**: Temporary access URLs for private files (1-hour expiry)
6. **Cost Efficiency**: Zero egress fees with Cloudflare R2

---

## 🚀 Production Deployment Notes

Before deploying to production:

1. **Environment Variables**: Add R2 credentials to Vercel/production env
2. **CORS Configuration**: Configure R2 bucket CORS for your domain
3. **Custom Domain**: Set up custom domain for R2 (e.g., `cdn.postlin.com`)
4. **Monitoring**: Set up alerts for R2 usage/errors
5. **Backup Strategy**: Consider S3 cross-region replication
6. **Rate Limiting**: Add upload rate limits in API routes
7. **File Scanning**: Integrate virus/malware scanning for user uploads

See `docs/R2_STORAGE_SETUP.md` Section 7 for detailed production setup.

---

## 💬 Need Help?

If you encounter issues:

1. Check console logs in browser (F12 → Console)
2. Check server logs in terminal where `npm run dev` is running
3. Verify environment variables: `console.log(process.env.R2_ACCOUNT_ID)` in API route
4. Review error messages against "Common Issues" section above
5. Check Cloudflare R2 dashboard for upload attempts
6. Run Prisma Studio to inspect database state

---

## 🎯 Summary

**Current Status**: ✅ All code complete, ready for dependencies + configuration

**Time to Complete**: ~30 minutes total
- Dependencies: 2 min
- R2 Setup: 10 min
- Prisma Migration: 2 min
- Testing: 15 min

**What You Get**:
- Professional UI with modern media upload
- User-controlled AI image generation (2 modes)
- Video upload support
- Cloud storage with R2 (zero egress fees)
- Graceful fallback for reliability
- Database tracking of all uploads

**Next Action**: Run the commands in **Step 1** above! 🚀
