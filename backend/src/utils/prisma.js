import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma Client Instance
 * Prevents multiple PrismaClient instances in development
 * which can cause memory issues and connection pool exhaustion
 */

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: process.env.PRISMA_LOG === 'true' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  prisma = global.prisma;
}

export default prisma;
