# Google OAuth Setup Guide

This guide will help you configure Google OAuth as the primary authentication method for Postlin.

## Overview

Postlin uses Google OAuth for user authentication. After signing in with Google, users can optionally connect their LinkedIn account and must provide their own Gemini API key to use AI features.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Postlin" (or your preferred name)
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, ensure your project is selected
2. Go to "APIs & Services" → "Library"
3. Search for "Google+ API"
4. Click "Enable" (this allows OAuth to access basic profile information)

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (or "Internal" if using Google Workspace)
3. Click "Create"

### Fill in the consent screen information:

**App information:**
- App name: `Postlin`
- User support email: Your email address
- App logo: (Optional) Upload your app logo

**App domain:**
- Application home page: `https://your-domain.com` (or `http://localhost:3000` for development)
- Application privacy policy: `https://your-domain.com/privacy`
- Application terms of service: `https://your-domain.com/terms`

**Authorized domains:**
- Add your production domain (e.g., `your-domain.com`)
- For local development, authorized domains are not required

**Developer contact information:**
- Enter your email address

4. Click "Save and Continue"

### Scopes:

1. Click "Add or Remove Scopes"
2. Add the following scopes:
   - `openid`
   - `profile`
   - `email`
3. Click "Update" → "Save and Continue"

### Test users (for development):

1. Add test user emails that can access the app during development
2. Click "Save and Continue"

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application" as the application type

### Configure the OAuth client:

**Name:** `Postlin Web Client`

**Authorized JavaScript origins:**
- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

**Authorized redirect URIs:**
- Development: `http://localhost:3000/api/auth/callback/google`
- Production: `https://your-domain.com/api/auth/callback/google`

4. Click "Create"
5. Copy the **Client ID** and **Client Secret**

## Step 5: Configure Your Application

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Google OAuth credentials:
   ```env
   GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
   ```

3. Generate NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

4. Generate ENCRYPTION_KEY (for storing user API keys):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/login`

3. Click "Continue with Google"

4. Sign in with your Google account

5. You should be redirected to the onboarding flow

## Production Deployment

### Vercel / Netlify / Other hosting:

1. Add environment variables in your hosting dashboard:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET`
   - `ENCRYPTION_KEY`
   - `DATABASE_URL`

2. Update OAuth client redirect URIs in Google Cloud Console:
   - Add: `https://your-domain.com/api/auth/callback/google`

3. Update authorized JavaScript origins:
   - Add: `https://your-domain.com`

## Troubleshooting

### Error: redirect_uri_mismatch

**Solution:** Ensure the redirect URI in your Google Cloud Console exactly matches:
- Development: `http://localhost:3000/api/auth/callback/google`
- Production: `https://your-domain.com/api/auth/callback/google`

### Error: access_denied

**Possible causes:**
1. OAuth consent screen is not published (for external users)
2. User email is not in test users list (during testing phase)
3. Required scopes are not configured

### Error: invalid_client

**Solution:** Double-check your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`

## Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use different OAuth clients** for development and production
3. **Rotate secrets regularly** in production
4. **Enable 2FA** on your Google Cloud account
5. **Monitor OAuth logs** in Google Cloud Console

## Support

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [Postlin GitHub Issues](https://github.com/mfaeezshabbir/postlin/issues)
