/**
 * Prisma Configuration File
 *
 * Configures Prisma CLI, migrations, and database connection.
 *
 * This file is required for Prisma v7+ and recommended for v6.19+
 * See: https://www.prisma.io/docs/orm/reference/prisma-config-reference
 */

// prisma.config.js
require("dotenv").config();

module.exports = {
  // Path to the Prisma schema file(s)
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Uncomment to enable database seeding
    // seed: 'tsx prisma/seed.ts',
  },
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};
