# 🚀 Quick Start Guide - Enhanced Media Upload

## ⚡ 3-Minute Setup

### Step 1: Install (30 seconds)
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner sharp
```

### Step 2: Configure R2 (2 minutes)
Add to `.env.local`:
```bash
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=postlin-media
```

### Step 3: Update Database (30 seconds)
```bash
npx prisma generate && npx prisma db push
npm run dev
```

**Done!** Open http://localhost:3000 and test the new media upload features.

---

## 📋 Feature Checklist

- ✅ **AI Image (Auto)**: Click "AI Generate Image" → "Generate for Me"
- ✅ **AI Image (Manual)**: Click "AI Generate Image" → "Give Me a Prompt" → Use external tool
- ✅ **Image Upload**: Drag & drop or click to browse
- ✅ **Video Upload**: Select video file (<200MB)
- ✅ **Preview**: See uploaded media with type badges
- ✅ **Remove**: Clear or replace any media

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module '@aws-sdk/client-s3'" | Run: `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner` |
| "R2 upload failed: No credentials" | Check `.env.local` has all 4 R2 variables |
| "Video upload not configured" | Install dependencies first (see above) |
| Dialog not full width | Already fixed! (98vw width) |
| Images not in R2 dashboard | Verify bucket name matches `R2_BUCKET_NAME` |

---

## 📂 Where to Get R2 Credentials

1. Go to: https://dash.cloudflare.com/
2. Navigate: **R2** → **Overview**
3. Create bucket: **`postlin-media`**
4. Generate API token: **Read & Write** permissions
5. Copy: Account ID, Access Key ID, Secret Access Key

**Detailed Guide**: See `docs/R2_STORAGE_SETUP.md`

---

## ✅ How to Verify Everything Works

### Browser Console:
```
✅ Image uploaded to R2: 2.5 MB
```

### Cloudflare Dashboard:
Check **R2** → **postlin-media** → Files appear in:
```
images/user-123/2024/01/1234567890-abc123.jpg
videos/user-123/2024/01/1234567891-def456.mp4
```

### Database:
```bash
npx prisma studio
# → Open Media table → See entries with fileUrl, fileSize
```

---

## 🎯 What You Get

- **10GB Free Storage** (Cloudflare R2)
- **Zero Egress Fees** (unlike S3)
- **User Control** over AI image generation
- **Video Support** up to 200MB
- **Automatic Image Optimization** (Sharp)
- **Graceful Fallback** if R2 unavailable
- **Database Tracking** of all uploads

---

## 📚 Full Documentation

- **Next Steps**: `docs/NEXT_STEPS.md` (detailed setup)
- **R2 Setup**: `docs/R2_STORAGE_SETUP.md` (configuration guide)
- **Testing**: `docs/TESTING_MEDIA_UPLOAD.md` (test scenarios)
- **Summary**: `docs/IMPLEMENTATION_SUMMARY.md` (technical details)

---

## 🎉 Success!

Once setup is complete:
1. Open DraftModal
2. See new full-width professional UI
3. Click "AI Generate Image" → Two options appear
4. Upload images or videos with drag & drop
5. Files automatically save to Cloudflare R2
6. Metadata tracked in MongoDB

**Time to Complete**: ~3 minutes  
**Cost**: Free (10GB R2 tier)  
**Status**: Production-ready

---

**Questions?** Check `docs/NEXT_STEPS.md` → "Common Issues & Fixes"
