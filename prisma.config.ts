/**
 * Prisma Configuration File
 * 
 * Configures Prisma CLI, migrations, and database connection.
 * 
 * This file is required for Prisma v7+ and recommended for v6.19+
 * See: https://www.prisma.io/docs/orm/reference/prisma-config-reference
 */

import 'dotenv/config';

export default {
  // Path to the Prisma schema file(s)
  schema: 'prisma/schema.prisma',
  
  // Migration configuration
  migrations: {
    path: 'prisma/migrations',
    // Uncomment to enable database seeding
    // seed: 'tsx prisma/seed.ts',
  },
  
  // Database connection configuration
  datasources: {
    db: {
      // Connection URL comes from DATABASE_URL environment variable
      // This approach works with Prisma v6.19+ and v7+
      url: process.env.DATABASE_URL,
    },
  },
};
