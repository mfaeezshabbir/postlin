# 🚀 Postli - Quick Start Guide

## Prerequisites
- ✅ MongoDB running (replica set on port 27017)
- ✅ Redis running (port 6379)
- ✅ Node.js 18+ installed
- ✅ LinkedIn OAuth app configured
- ⚠️ **Need**: Google Gemini API key

---

## 🎯 Getting Started in 5 Minutes

### Step 1: Get Gemini API Key (Required for AI features)

1. Visit: **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the API key

### Step 2: Add to Environment Variables

Open `.env.local` and add:

```env
GEMINI_API_KEY="your_api_key_here"
```

### Step 3: Start the Development Server

```bash
npm run dev
```

### Step 4: Test the Application

1. **Open**: http://localhost:3000
2. **Click**: "Sign In" (top right)
3. **Login**: With your LinkedIn account
4. **Redirects**: To `/dashboard/drafts`

---

## ✨ Try These Features

### 1. Create an AI-Generated Draft

1. Click **"New Draft"** button
2. Select **"AI Generated"** (blue card)
3. Enter a prompt:
   ```
   Tips for improving productivity in remote teams
   ```
4. Select:
   - **Tone**: Professional
   - **Length**: Medium
5. Click **"Generate Content"**
6. Wait 3-5 seconds for AI
7. Review generated content
8. Edit if needed
9. Click **"Save Draft"**
10. ✅ Draft appears in your list!

### 2. Create a Manual Draft

1. Click **"New Draft"** button
2. Select **"Write Manually"**
3. Type your content:
   ```
   Just shipped a major feature! 🚀 
   
   After months of hard work, we've launched our new AI-powered content assistant. 
   
   What features do you prioritize when building products?
   ```
4. Click **"Save Draft"**
5. ✅ Draft saved!

### 3. Delete a Draft

1. Click **three-dot menu** (⋮) on any draft
2. Click **"Delete"**
3. Confirm in the dialog
4. ✅ Draft removed!

---

## 📊 What You'll See

### Drafts Page (`/dashboard/drafts`)

```
┌──────────────────────────────────────────────────────┐
│  Drafts                            [New Draft]       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [Total: 5]  [AI Generated: 3]  [Manual: 2]         │
│                                                      │
│  Your Drafts                                         │
│  ┌────────────────────────────────────────────┐     │
│  │ [Draft] Created Oct 4, 2025                │     │
│  │                                             │     │
│  │ Tips for improving productivity...          │     │
│  │ 187 words                              [⋮] │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │ [Draft] Created Oct 3, 2025                │     │
│  │                                             │     │
│  │ Just shipped a major feature! 🚀...        │     │
│  │ 42 words                               [⋮] │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### New Draft Modal

#### Choose Mode:
```
┌────────────────────────────────────────┐
│      Create New Draft                  │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────┐      ┌──────────┐      │
│  │   ✨     │      │   📝     │      │
│  │ AI Gen   │      │  Manual  │      │
│  │ [Rec'd]  │      │          │      │
│  └──────────┘      └──────────┘      │
│                                        │
└────────────────────────────────────────┘
```

#### AI Generation:
```
┌────────────────────────────────────────┐
│   AI Content Generation                │
├────────────────────────────────────────┤
│                                        │
│ What do you want to write about?       │
│ ┌────────────────────────────────┐    │
│ │ Tips for improving team...     │    │
│ │                                │    │
│ └────────────────────────────────┘    │
│                                        │
│ Tone: [Professional ▼]                 │
│ Length: [Medium ▼]                     │
│                                        │
│              [Generate Content]        │
└────────────────────────────────────────┘
```

---

## 🎨 Dashboard Navigation

### Sidebar Menu:
- 📝 **Drafts** - Manage your drafts (Active)
- ⏰ **Scheduled** - View scheduled posts
- 📜 **History** - Published posts with analytics
- ⚙️ **Settings** - User preferences

### Topbar:
- **Welcome message** with your name
- **New Draft** button (quick access)
- **User avatar** with dropdown:
  - Profile
  - Settings
  - Sign out

---

## 🧪 Quick Test Scenarios

### Scenario 1: First Time User
```bash
1. Login with LinkedIn
2. See empty state: "No drafts yet"
3. Click "Create Your First Draft"
4. Try AI generation with a simple prompt
5. Save and see it appear in the list
```

### Scenario 2: AI Content Creator
```bash
1. Create 3 AI-generated drafts with different tones:
   - Professional: "Leadership tips"
   - Casual: "Coffee break thoughts"
   - Enthusiastic: "Product launch announcement"
2. Compare the AI-generated content
3. Edit one to match your style
4. Delete one you don't like
```

### Scenario 3: Manual Writer
```bash
1. Create a manual draft
2. Write a short update (50 words)
3. Create another with a longer story (200 words)
4. See word counts displayed
5. Practice deleting and recreating
```

---

## 🔍 Verify Everything Works

### ✅ Checklist:

- [ ] MongoDB is running: `docker ps` shows `postli-mongo`
- [ ] Redis is running: `docker ps` shows `postli-redis`
- [ ] Dev server started: `npm run dev` running on port 3000
- [ ] Can access: http://localhost:3000
- [ ] Can login with LinkedIn
- [ ] Redirects to `/dashboard/drafts` after login
- [ ] Can open "New Draft" modal
- [ ] AI generation works (check GEMINI_API_KEY)
- [ ] Can save drafts
- [ ] Drafts appear in list
- [ ] Stats update correctly
- [ ] Can delete drafts
- [ ] Empty state shows when no drafts

---

## 🐛 Common Issues

### "AI generation failed"
**Cause**: Missing or invalid GEMINI_API_KEY
**Fix**: 
1. Check `.env.local` has the key
2. Verify key is valid at https://makersuite.google.com
3. Restart dev server: `Ctrl+C` then `npm run dev`

### "Unauthorized" error
**Cause**: Not logged in or session expired
**Fix**: 
1. Click "Sign In" button
2. Login with LinkedIn
3. Try again

### Drafts not loading
**Cause**: MongoDB not running or connection issue
**Fix**:
1. Check MongoDB: `docker ps`
2. Start if needed: `docker compose up -d mongo`
3. Verify DATABASE_URL in `.env.local`

### Modal not closing
**Cause**: JavaScript error in browser
**Fix**:
1. Open browser console (F12)
2. Check for errors
3. Refresh page
4. Try again

---

## 📱 Mobile Testing

The dashboard is fully responsive. Test on mobile:

1. Open Chrome DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or "Pixel 5"
4. Test these features:
   - Sidebar becomes hamburger menu
   - New Draft modal is scrollable
   - Stats cards stack vertically
   - Draft cards are touch-friendly

---

## 🎯 Next: Add Your First Real Draft!

Try creating a real LinkedIn post draft:

```
Prompt: "Share my experience migrating a React app to Next.js 15 with benefits and challenges"

Tone: Informative
Length: Medium
```

This will generate professional LinkedIn content ready to edit and publish!

---

## 🎉 You're All Set!

Your Postli dashboard is ready to use. Create drafts, generate AI content, and get ready for the next phase: **scheduling and publishing to LinkedIn!**

**Happy drafting!** ✍️

---

## 🆘 Need Help?

Check these docs:
- `DASHBOARD_README.md` - Dashboard features
- `DRAFT_SYSTEM_README.md` - Draft management details
- `IMPLEMENTATION_SUMMARY.md` - Complete overview
- `.env.example` - Environment variables

**Problems?** Check the browser console (F12) and server logs for error messages.
