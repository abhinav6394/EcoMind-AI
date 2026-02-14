import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({ adapter });
} else {
  if (!globalThis._prisma) {
    globalThis._prisma = new PrismaClient({ adapter });
  }
  prisma = globalThis._prisma;
}

export { prisma };