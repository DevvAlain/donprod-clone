import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before seeding an admin.");
}

const prisma = new PrismaClient();
const passwordHash = await bcrypt.hash(password, 12);

await prisma.admin.upsert({
  where: { email },
  update: { passwordHash },
  create: { email, passwordHash },
});

await prisma.$disconnect();
