# MongoDB Atlas Setup Guide

This guide helps you set up MongoDB Atlas for Postlin and fix common connection issues.

## Quick Start

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (M0 Free Tier is fine for development)

### 2. Configure Network Access

1. In Atlas Dashboard, go to **Network Access**
2. Click **Add IP Address**
3. For development: Click **Allow Access from Anywhere** (0.0.0.0/0)
4. For production: Add your server's specific IP address

### 3. Create Database User

1. Go to **Database Access**
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Create a username and strong password
5. Set **Database User Privileges** to "Atlas admin" or "Read and write to any database"
6. Click **Add User**

### 4. Get Connection String

1. In **Database** section, click **Connect**
2. Choose **Connect your application**
3. Select **Node.js** as driver and latest version
4. Copy the connection string (should look like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 5. Configure Your `.env` File

Update your `.env` file with the connection string:

```bash
# Replace <username>, <password>, and add database name
DATABASE_URL="mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/postli?retryWrites=true&w=majority"
```

**Important Notes:**
- Replace `<username>` with your database username
- Replace `<password>` with your database password
- Add `/postli` after `.mongodb.net` to specify the database name
- Ensure special characters in password are URL-encoded

### 6. Regenerate Prisma Client

After updating the DATABASE_URL, regenerate the Prisma client:

```bash
npx prisma generate
```

### 7. Push Schema to MongoDB

```bash
npx prisma db push
```

## Common Issues & Solutions

### Issue 1: "Transactions are not supported by this deployment"

**Error:**
```
Raw query failed. Code: `unknown`. Message: `Kind: Transactions are not supported by this deployment`
```

**Solution:**
This happens because MongoDB Atlas M0 (free tier) doesn't support transactions. Prisma schema has been configured with `directUrl` to disable transactions:

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
  directUrl = env("DATABASE_URL")
}
```

The fix is already applied in the schema. Just run:
```bash
npx prisma generate
npm run dev
```

### Issue 2: "Server selection timeout: No available servers"

**Error:**
```
Kind: Server selection timeout: No available servers
Kind: I/O error: received fatal alert: InternalError
```

**Causes:**
1. **IP Not Whitelisted**: Your IP address isn't allowed in Atlas Network Access
2. **Wrong Connection String**: Missing database name or incorrect format
3. **Invalid Credentials**: Wrong username or password
4. **Network/Firewall Issues**: Firewall blocking MongoDB port

**Solutions:**

1. **Check Network Access:**
   - Go to Atlas Dashboard → Network Access
   - Verify your IP is whitelisted
   - For development, add 0.0.0.0/0 (allow all)

2. **Verify Connection String Format:**
   ```bash
   # Correct format:
   DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/postli?retryWrites=true&w=majority"
   
   # Common mistakes:
   # ❌ Missing database name: .mongodb.net/?retryWrites
   # ❌ Using < > brackets: <username>:<password>
   # ❌ Spaces in credentials
   # ✅ Correct: .mongodb.net/postli?retryWrites
   ```

3. **URL-Encode Special Characters:**
   If your password contains special characters, encode them:
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`
   - `%` → `%25`
   - `&` → `%26`

4. **Test Connection:**
   ```bash
   # Test with mongosh (if installed):
   mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/postli"
   ```

### Issue 3: SSL/TLS Errors

**Error:**
```
Kind: I/O error: received fatal alert: InternalError
```

**Solution:**
1. Ensure connection string uses `mongodb+srv://` (not `mongodb://`)
2. Add SSL parameters if needed:
   ```bash
   DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/postli?retryWrites=true&w=majority&ssl=true"
   ```

### Issue 4: "Authentication failed"

**Solutions:**
1. Verify username and password in Atlas Database Access
2. Check that user has correct permissions
3. Ensure password doesn't contain special characters (or they're URL-encoded)
4. Try creating a new database user with a simple password

## Local Development vs Production

### Local Development (Docker)

For local development, use Docker with replica set:

```bash
# .env
DATABASE_URL="mongodb://localhost:27017/postli?replicaSet=rs0"

# Start MongoDB with Docker:
docker compose up -d
```

### Production (MongoDB Atlas)

For production, use MongoDB Atlas:

```bash
# .env
DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/postli?retryWrites=true&w=majority"
```

## Environment Variables Checklist

✅ Required environment variables for database:

```bash
# .env file
DATABASE_URL="mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/postli?retryWrites=true&w=majority"
```

## Testing Your Connection

After configuring, test your connection:

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Push schema to database
npx prisma db push

# 3. Start the development server
npm run dev

# 4. Try signing in with LinkedIn
# Check the console for any database errors
```

## Debugging Tips

1. **Enable Prisma Logging:**
   Add to your `lib/prisma.ts`:
   ```typescript
   const prisma = new PrismaClient({
     log: ['query', 'info', 'warn', 'error'],
   });
   ```

2. **Check Connection String:**
   ```bash
   # Print without exposing password:
   echo $DATABASE_URL | sed 's/:.*@/:****@/'
   ```

3. **Test with Simple Query:**
   Create a test script:
   ```javascript
   // test-db.js
   const { PrismaClient } = require('./app/generated/prisma');
   const prisma = new PrismaClient();
   
   async function test() {
     const users = await prisma.user.findMany();
     console.log('✅ Database connected!', users.length, 'users found');
   }
   
   test().catch(console.error).finally(() => prisma.$disconnect());
   ```

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Prisma MongoDB Guide](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/)

## Support

If you continue to have issues:
1. Check MongoDB Atlas status page
2. Review Prisma logs
3. Verify all environment variables are set correctly
4. Try connecting with mongosh to isolate the issue
