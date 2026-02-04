import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Usamos process.env como fallback para evitar el error estricto de Prisma v7 si la variable falta
    url: process.env.DATABASE_URL || env('DATABASE_URL') || '',
  },
});
