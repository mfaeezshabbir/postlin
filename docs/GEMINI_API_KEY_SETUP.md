# Gemini API Key Setup Guide

## Overview

Postlin uses Google's Gemini AI for generating LinkedIn post content and images. Each user provides their own Gemini API key, which is stored encrypted in the database and used exclusively for that user's AI generation requests.

## Why User-Specific API Keys?

1. **Cost Control**: Users manage their own API usage and costs
2. **Quota Management**: Each user has their own rate limits
3. **Security**: No shared API key means better isolation
4. **Flexibility**: Users can use different Gemini models based on their API tier

## For End Users

### How to Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)

2. Sign in with your Google account

3. Click "Get API Key" or "Create API Key"

4. Select or create a Google Cloud project

5. Copy the generated API key (starts with `AIzaSy...`)

6. In Postlin:
   - Complete Google sign-in
   - During onboarding, paste your API key when prompted
   - Or add it later in Settings → AI Configuration

### API Key Security

- Your API key is **encrypted** before storage using AES-256-GCM encryption
- It is **never shared** with other users or exposed in logs
- Only you can use your API key for AI generation
- You can remove or update your key at any time in settings

### Managing Your API Key

**To view if you have a key:**
- Go to Settings → AI Configuration
- You'll see when your key was added

**To update your key:**
1. Go to Settings → AI Configuration
2. Click "Update Gemini API Key"
3. Enter your new key
4. Click "Save"

**To remove your key:**
1. Go to Settings → AI Configuration
2. Click "Remove Gemini API Key"
3. Confirm removal
4. Note: AI generation features will be disabled until you add a new key

### Cost and Usage

- Gemini API has a generous **free tier**
- Check your usage at [Google AI Studio](https://aistudio.google.com)
- Rate limits: 
  - Free tier: 15 RPM (requests per minute)
  - Pay-as-you-go: Higher limits available

### What Happens Without a Gemini Key?

- You can still sign in and use Postlin
- Manual post creation is always available
- AI generation features will show a prompt to add your key
- LinkedIn posting (if connected) works independently

## For Developers

### Architecture

The application uses a user-specific API key architecture:

1. **Storage**: Keys are encrypted with AES-256-GCM and stored in MongoDB
2. **Encryption Key**: A server-side `ENCRYPTION_KEY` environment variable encrypts all user keys
3. **Usage**: When a user requests AI generation, their key is decrypted on-the-fly and used for that request only

### Key Components

#### Encryption Module (`lib/encryption.ts`)
```typescript
import { encrypt, decrypt } from '@/lib/encryption';

// Encrypt a user's API key before storage
const encryptedKey = encrypt(userApiKey);

// Decrypt when needed for API calls
const decryptedKey = decrypt(encryptedKey);
```

#### API Endpoints

**POST `/api/user/gemini-key`**
- Validates the API key by making a test request
- Encrypts and stores the key
- Returns success confirmation

**DELETE `/api/user/gemini-key`**
- Removes the user's encrypted API key
- User must add a new key to use AI features

**GET `/api/user/profile`**
- Returns `hasGeminiKey` boolean flag
- Frontend uses this to show/hide AI features

#### AI Generation (`/api/ai/generate`)
```typescript
// Get user's encrypted key
const userGeminiKey = await getUserGeminiKey(session.user.email);

if (!userGeminiKey) {
  return NextResponse.json(
    { error: 'Gemini API key not configured' },
    { status: 403 }
  );
}

// Use user's key for this request
const genAI = new GoogleGenerativeAI(userGeminiKey);
```

### Environment Variables

Required server-side variable:

```env
# 64-character hex string (32 bytes)
ENCRYPTION_KEY="your-64-char-hex-key-here"
```

Generate it with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Schema

```prisma
model User {
  // ... other fields
  geminiApiKey     String?   // Encrypted API key
  geminiKeyAddedAt DateTime? // When key was added
}
```

### Security Considerations

1. **Encryption at Rest**: All API keys are encrypted before storage
2. **Encryption in Transit**: HTTPS protects keys during transmission
3. **No Logging**: API keys are never logged
4. **Validation**: Keys are validated before storage
5. **Isolation**: Each request uses only the requesting user's key

### Testing

Test the encryption utilities:

```bash
npm test -- encryption.test.ts
```

### Migration

If migrating from a global API key setup:

1. Update environment variables (remove global `GEMINI_API_KEY`)
2. Add `ENCRYPTION_KEY`
3. Run Prisma migrations
4. Prompt users to add their API keys during next sign-in

## Troubleshooting

### "Invalid Gemini API key" Error

**Causes:**
- Key was copied incorrectly (extra spaces, missing characters)
- Key is from wrong Google Cloud project
- API is not enabled in Google Cloud

**Solution:**
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Generate a new key
3. Ensure no extra spaces when copying
4. Try again in Postlin

### "Gemini API key not configured" Error

**Solution:**
- Complete the onboarding flow
- Or go to Settings → AI Configuration → Add API key

### "API quota exceeded" Error

**Causes:**
- You've hit the free tier limit (15 requests/minute)
- Daily quota is exceeded

**Solution:**
- Wait a few minutes and try again
- Check usage at [Google AI Studio](https://aistudio.google.com)
- Consider upgrading to pay-as-you-go for higher limits

### Key Won't Save

**Possible causes:**
1. Validation failed (invalid key)
2. Database connection issue
3. Encryption key not set (`ENCRYPTION_KEY` env var)

**Check logs for:**
```
Error saving Gemini API key: [detailed error]
```

## Best Practices

### For Users

1. **Keep your key secure** - treat it like a password
2. **Don't share your key** with others
3. **Monitor your usage** in Google AI Studio
4. **Regenerate periodically** for security

### For Developers

1. **Never log API keys** (encrypted or decrypted)
2. **Validate on save** - test the key before storing
3. **Handle missing keys gracefully** - show helpful UI prompts
4. **Rotate encryption key** in production periodically
5. **Backup encryption key** securely - losing it means all keys are unrecoverable

## Resources

- [Google AI Studio](https://aistudio.google.com/apikey)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [Rate Limits](https://ai.google.dev/docs/rate_limits)
