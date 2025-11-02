# Deployment Checklist

This document outlines the steps required to deploy the new multi-authentication system with user-specific Gemini API keys.

## Pre-Deployment

### 1. Database Migration

Run Prisma migration to add new fields to the User model:

```bash
npx prisma db push
```

This adds:
- `googleId` (String, unique)
- `linkedInConnected` (Boolean)
- `geminiApiKey` (String, encrypted)
- `geminiKeyAddedAt` (DateTime)

### 2. Environment Variables

Add the following new environment variables:

```env
# Google OAuth (Required)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Encryption Key for Gemini API keys (Required)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY="your-64-character-hex-encryption-key"

# LinkedIn OAuth (Optional - only if enabling LinkedIn posting)
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# Existing variables (ensure these are still set)
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-nextauth-secret"
DATABASE_URL="mongodb://..."
REDIS_URL="redis://..."
```

### 3. Google Cloud Console Setup

Follow the [Google OAuth Setup Guide](./GOOGLE_OAUTH_SETUP.md) to:

1. Create a Google Cloud project (if not exists)
2. Enable Google+ API
3. Configure OAuth consent screen
4. Create OAuth credentials

**Important redirect URIs:**
- Development: `http://localhost:3000/api/auth/callback/google`
- Production: `https://your-domain.com/api/auth/callback/google`

**Authorized JavaScript origins:**
- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

### 4. Generate Encryption Key

Generate a secure 32-byte (64-character hex) encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

⚠️ **IMPORTANT**: 
- Store this key securely
- Never commit it to version control
- Losing this key means all stored Gemini API keys become unrecoverable
- Rotating this key requires all users to re-add their Gemini keys

## Deployment Steps

### Step 1: Deploy Code

1. Merge the PR to your main branch
2. Deploy to your hosting platform (Vercel, Netlify, etc.)

### Step 2: Set Environment Variables

In your hosting dashboard, add all required environment variables listed above.

### Step 3: Run Database Migration

```bash
npx prisma db push
```

Or if using a migration service:
```bash
npx prisma migrate deploy
```

### Step 4: Verify OAuth Configuration

Test the authentication flow:
1. Visit `/login`
2. Click "Continue with Google"
3. Complete Google sign-in
4. Should redirect to `/onboarding`

### Step 5: Smoke Test

Complete a full user flow:
1. ✅ Sign in with Google
2. ✅ Skip or connect LinkedIn
3. ✅ Add a Gemini API key
4. ✅ Create a draft with AI
5. ✅ Create a manual draft
6. ✅ Manage Gemini key in settings

## Post-Deployment

### User Communication

Inform existing users about changes:

**Email template:**
```
Subject: Important: Postlin Authentication Update

Hi [User],

We've upgraded Postlin with exciting new features!

What's New:
- Sign in securely with Google
- Use your own Gemini API key for AI features
- LinkedIn connection is now optional

Action Required:
1. Sign in again with Google: [link]
2. Add your Gemini API key (free from Google AI Studio)
3. Reconnect LinkedIn if you want to auto-post

Your data is safe and all your posts are preserved.

Questions? Contact us at [support email]

Best,
The Postlin Team
```

### Monitor

Watch for:
- Google OAuth errors in logs
- Gemini API key validation failures
- User feedback on the new flow
- Database encryption key security

### Rollback Plan

If issues arise:

1. **Authentication Issues:**
   - Verify Google OAuth credentials
   - Check redirect URIs match exactly
   - Ensure NEXTAUTH_SECRET is set

2. **Encryption Issues:**
   - Verify ENCRYPTION_KEY is exactly 64 hex characters
   - Check error logs for specific encryption errors

3. **Database Issues:**
   - Verify migration completed successfully
   - Check MongoDB connection

## Testing in Production

### Test User Account

Create a test account to verify:

1. **Google Sign-In:**
   - [ ] Can sign in with Google
   - [ ] Profile info populated correctly
   - [ ] Session persists across refreshes

2. **LinkedIn Connection:**
   - [ ] Can skip LinkedIn
   - [ ] Can connect LinkedIn
   - [ ] Can disconnect LinkedIn
   - [ ] LinkedIn status shows in settings

3. **Gemini API Key:**
   - [ ] Can add API key in onboarding
   - [ ] Can add API key in settings
   - [ ] Invalid key shows error
   - [ ] Can update existing key
   - [ ] Can remove key
   - [ ] AI features locked without key

4. **AI Generation:**
   - [ ] AI generation works with valid key
   - [ ] Shows helpful error without key
   - [ ] Content generated successfully
   - [ ] Images generated (if applicable)

5. **Manual Posts:**
   - [ ] Can create posts without AI
   - [ ] Can create posts without LinkedIn
   - [ ] Copy/paste functionality works

## Security Checklist

- [ ] ENCRYPTION_KEY is set and secure (64 hex chars)
- [ ] ENCRYPTION_KEY is not in version control
- [ ] ENCRYPTION_KEY is backed up securely
- [ ] Google OAuth redirect URIs use HTTPS in production
- [ ] No API keys in logs or error messages
- [ ] Session security configured (secure cookies, HTTPS only)
- [ ] Rate limiting configured for API endpoints
- [ ] Database access restricted

## Troubleshooting

### "redirect_uri_mismatch" Error

**Solution:** Ensure redirect URI in Google Cloud Console exactly matches:
```
https://your-domain.com/api/auth/callback/google
```

### "Invalid Gemini API key" Error

**Causes:**
- Key copied incorrectly (extra spaces)
- Key from wrong project
- API not enabled in Google Cloud

**Solution:** Generate new key from [Google AI Studio](https://aistudio.google.com/apikey)

### Encryption Errors

**Causes:**
- ENCRYPTION_KEY not set
- ENCRYPTION_KEY wrong length
- ENCRYPTION_KEY not hex

**Solution:** Generate new 64-char hex key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Session Issues

**Causes:**
- NEXTAUTH_SECRET not set
- NEXTAUTH_URL incorrect
- Cookie settings wrong

**Solution:** Verify environment variables and NextAuth configuration

## Support Resources

- [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)
- [Gemini API Key Setup](./GEMINI_API_KEY_SETUP.md)
- [LinkedIn OAuth Setup](./LINKEDIN_OAUTH_SETUP.md)
- [Project README](../README.md)

## Success Metrics

Track these metrics post-deployment:
- User sign-in success rate
- Google OAuth error rate
- Gemini key addition rate
- AI generation success rate
- User feedback/support tickets

## Rollback Procedure

If critical issues occur:

1. Revert to previous deployment
2. Restore old environment variables
3. Run `npx prisma db push` with old schema
4. Communicate with users about temporary reversion

⚠️ **Note:** Reverting after users have added Gemini keys means they'll need to re-add them after redeployment.
