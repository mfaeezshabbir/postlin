#!/bin/bash
# LinkedIn OAuth Configuration Test Script

echo "🔍 Checking LinkedIn OAuth Configuration..."
echo ""

# Check environment variables
echo "✅ Checking Environment Variables:"
if grep -q "LINKEDIN_CLIENT_ID" .env.local; then
    echo "  ✓ LINKEDIN_CLIENT_ID found"
else
    echo "  ✗ LINKEDIN_CLIENT_ID missing!"
fi

if grep -q "LINKEDIN_CLIENT_SECRET" .env.local; then
    echo "  ✓ LINKEDIN_CLIENT_SECRET found"
else
    echo "  ✗ LINKEDIN_CLIENT_SECRET missing!"
fi

if grep -q "NEXTAUTH_URL" .env.local; then
    echo "  ✓ NEXTAUTH_URL found"
else
    echo "  ✗ NEXTAUTH_URL missing!"
fi

if grep -q "NEXTAUTH_SECRET" .env.local; then
    echo "  ✓ NEXTAUTH_SECRET found"
else
    echo "  ✗ NEXTAUTH_SECRET missing!"
fi

echo ""
echo "✅ Checking Database Connection:"
if docker ps | grep -q mongo; then
    echo "  ✓ MongoDB container is running"
else
    echo "  ⚠ MongoDB container not found. Run: docker-compose up -d"
fi

echo ""
echo "✅ Checking Prisma Setup:"
if [ -d "app/generated/prisma" ]; then
    echo "  ✓ Prisma client generated"
else
    echo "  ⚠ Prisma client not generated. Run: npx prisma generate"
fi

echo ""
echo "📋 LinkedIn App Configuration Checklist:"
echo ""
echo "Go to: https://www.linkedin.com/developers/apps"
echo ""
echo "1. Verify Redirect URLs include:"
echo "   • http://localhost:3000/api/auth/callback/linkedin"
echo "   • http://localhost:3001/api/auth/callback/linkedin"
echo ""
echo "2. Verify Products/Scopes:"
echo "   • Sign In with LinkedIn using OpenID Connect ⭐ (REQUIRED)"
echo "   • Share on LinkedIn (for posting)"
echo ""
echo "3. Verify OAuth 2.0 Settings:"
echo "   • Scopes: openid, profile, email"
echo ""
echo "🚀 To test the login:"
echo "   1. Visit: http://localhost:3000/login"
echo "   2. Click 'Continue with LinkedIn'"
echo "   3. Check terminal for debug logs"
echo ""
echo "📝 For detailed setup instructions, see:"
echo "   • LINKEDIN_OAUTH_SETUP.md"
echo "   • LOGIN_SYSTEM_README.md"
echo ""
