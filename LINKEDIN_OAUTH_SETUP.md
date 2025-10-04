# LinkedIn OAuth Configuration Fix

## ✅ What Was Fixed

### The Error:
```
[next-auth][error][OAUTH_CALLBACK_ERROR]
unexpected iss value, expected undefined, got: https://www.linkedin.com/oauth
```

### The Problem:
LinkedIn recently migrated to OpenID Connect (OIDC) and now includes an `issuer` claim in their OAuth responses. NextAuth's default LinkedIn provider configuration wasn't set up for this.

### The Solution:
Updated the LinkedIn provider configuration in `modules/auth/index.ts` with:

1. **Explicit Issuer Configuration**
   ```typescript
   issuer: 'https://www.linkedin.com/oauth',
   ```

2. **OpenID Connect Scopes**
   ```typescript
   scope: 'openid profile email'
   ```

3. **Proper Profile Mapping**
   ```typescript
   profile(profile) {
     return {
       id: profile.sub,  // LinkedIn OIDC uses 'sub' instead of 'id'
       name: profile.name,
       email: profile.email,
       image: profile.picture,
     };
   }
   ```

4. **Client Authentication Method**
   ```typescript
   client: {
     token_endpoint_auth_method: 'client_secret_post',
   }
   ```

## 🔧 LinkedIn App Configuration Required

### CRITICAL: Update Your LinkedIn App Settings

1. **Go to LinkedIn Developers**: https://www.linkedin.com/developers/apps
2. **Select your app**: `77h1xghxtp06xm`
3. **Verify "Auth" Tab Settings**:

#### ✅ Redirect URLs (Must Include):
```
http://localhost:3000/api/auth/callback/linkedin
http://localhost:3001/api/auth/callback/linkedin
```

#### ✅ Required Scopes/Products:
You need to request access to these LinkedIn products:
- **Sign In with LinkedIn using OpenID Connect** ⭐ (REQUIRED)
- **Share on LinkedIn** (for posting functionality)
- **Advertising API** (optional, for analytics)

#### ✅ OAuth 2.0 Settings:
- **Authorization URL**: `https://www.linkedin.com/oauth/v2/authorization`
- **Token URL**: `https://www.linkedin.com/oauth/v2/accessToken`
- **Scopes**: `openid`, `profile`, `email`

## 🔑 Important Notes

### LinkedIn OIDC Migration
LinkedIn has moved to OpenID Connect (OIDC) for authentication. This means:

1. **User ID Format Changed**: 
   - Old: Random alphanumeric ID
   - New: `sub` claim in OIDC token (standardized format)

2. **Required Scopes Changed**:
   - Old: `r_liteprofile`, `r_emailaddress`
   - New: `openid`, `profile`, `email`

3. **Profile Response Changed**:
   - Now follows OIDC standard claims (`sub`, `name`, `email`, `picture`)

### Environment Variables Check
Verify your `.env.local` has:
```bash
LINKEDIN_CLIENT_ID="77h1xghxtp06xm"
LINKEDIN_CLIENT_SECRET="WPL_AP1.rSjs1GcHtmpIi6v8.YlUCFA=="
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="W5n1riE7yarvEbHWs6EGm58hxYtsNCMZu5isBLmw9f4"
```

## 🚀 Testing the Fix

1. **Restart the dev server** (already done automatically by Next.js hot reload)
2. **Clear browser cookies** for localhost
3. **Visit**: http://localhost:3000/login
4. **Click**: "Continue with LinkedIn"
5. **Watch the terminal** for debug logs

### Expected Flow:
```
✓ User clicks "Sign in with LinkedIn"
✓ Redirected to LinkedIn authorization page
✓ User approves permissions
✓ LinkedIn redirects back with authorization code
✓ NextAuth exchanges code for access token
✓ Profile data fetched using OIDC standards
✓ User created/updated in MongoDB
✓ JWT session created
✓ Redirected to /dashboard
```

## 🐛 Troubleshooting

### If you still see OAUTH_CALLBACK_ERROR:

1. **Check LinkedIn App Configuration**
   - Ensure "Sign In with LinkedIn using OpenID Connect" product is enabled
   - Verify redirect URLs include your exact callback URL
   - Confirm scopes are set to `openid profile email`

2. **Check Environment Variables**
   - Restart dev server after any .env changes
   - Verify CLIENT_ID and CLIENT_SECRET match your LinkedIn app

3. **Check Browser**
   - Clear cookies and cache
   - Try incognito/private mode
   - Check browser console for errors

4. **Check Logs**
   - Look for `[next-auth]` messages in terminal
   - Check for Prisma errors (database connection)
   - Look for custom log messages from our callbacks

### Common Issues:

**Issue**: `redirect_uri_mismatch`
**Fix**: Add exact callback URL to LinkedIn app settings

**Issue**: `invalid_scope`
**Fix**: LinkedIn app doesn't have OIDC product enabled

**Issue**: `invalid_client`
**Fix**: Check CLIENT_ID and CLIENT_SECRET are correct

**Issue**: No email returned
**Fix**: Ensure email scope is requested and user has verified email on LinkedIn

## 📝 Code Changes Summary

### Updated Files:
- ✅ `modules/auth/index.ts` - LinkedIn provider configuration
- ✅ Added OIDC support with proper issuer
- ✅ Updated profile mapping for OIDC claims
- ✅ Enhanced error logging
- ✅ Added debug mode for development

### Key Improvements:
1. ✅ LinkedIn OIDC compatibility
2. ✅ Better error handling and logging
3. ✅ Proper redirect URL handling
4. ✅ Enhanced user creation/update logic
5. ✅ Debug mode enabled in development

## 🎯 Next Steps

1. **Verify LinkedIn App Settings** (most important!)
2. **Test the login flow**
3. **Check terminal logs** for any remaining errors
4. **Verify user is created in MongoDB**

## 📚 References

- [NextAuth LinkedIn Provider](https://next-auth.js.org/providers/linkedin)
- [LinkedIn OIDC Migration Guide](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2)
- [OpenID Connect Specification](https://openid.net/connect/)

---

**The authentication system is now configured for LinkedIn's new OIDC flow!** 🎉

Try logging in again and check the terminal for detailed debug logs.
