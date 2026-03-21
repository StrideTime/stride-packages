import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/drizzle/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || './stride.db',
  },
});
