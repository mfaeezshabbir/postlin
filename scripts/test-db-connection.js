#!/usr/bin/env node
/**
 * Test MongoDB Atlas Connection
 * 
 * Run this script to verify your MongoDB Atlas connection is working:
 * node scripts/test-db-connection.js
 */

const { PrismaClient } = require('../app/generated/prisma');

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  console.log('🔍 Testing MongoDB connection...\n');

  try {
    // Test 1: Connect to database
    console.log('1️⃣ Testing connection...');
    await prisma.$connect();
    console.log('✅ Successfully connected to database!\n');

    // Test 2: Count users
    console.log('2️⃣ Counting users...');
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} user(s) in database\n`);

    // Test 3: Count posts
    console.log('3️⃣ Counting posts...');
    const postCount = await prisma.post.count();
    console.log(`✅ Found ${postCount} post(s) in database\n`);

    // Test 4: Try a simple query
    console.log('4️⃣ Testing query...');
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
    
    if (users.length > 0) {
      console.log(`✅ Successfully queried ${users.length} user(s):`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email || 'No email'} (${user.name || 'No name'})`);
      });
    } else {
      console.log('✅ Query successful (no users yet)');
    }

    console.log('\n🎉 All tests passed! Your database connection is working correctly.\n');
    
  } catch (error) {
    console.error('❌ Connection test failed!\n');
    
    if (error.code === 'P2010') {
      console.error('⚠️  Transaction Error Detected');
      console.error('This usually means you\'re using MongoDB Atlas M0 (free tier).');
      console.error('\nQuick Fix:');
      console.error('1. Run: npx prisma generate');
      console.error('2. Restart your dev server: npm run dev');
      console.error('3. See docs/MONGODB_ATLAS_SETUP.md for more details\n');
    } else if (error.message?.includes('Server selection timeout')) {
      console.error('⚠️  Connection Timeout Error');
      console.error('\nPossible causes:');
      console.error('1. IP address not whitelisted in MongoDB Atlas Network Access');
      console.error('2. Wrong connection string in DATABASE_URL');
      console.error('3. Database user credentials are incorrect');
      console.error('4. Firewall blocking connection');
      console.error('\nSee docs/MONGODB_ATLAS_SETUP.md for troubleshooting steps\n');
    } else {
      console.error('Error details:', error.message);
      console.error('\nFor help, see docs/MONGODB_ATLAS_SETUP.md\n');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testConnection();
