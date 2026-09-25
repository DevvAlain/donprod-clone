import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession, sessionCookie } from "@/lib/auth";
import { failure } from "@/lib/api-response";
import { loginSchema } from "@/lib/project-validation";
import { prisma } from "@/lib/prisma";
import { parseBody } from "@/lib/request";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const clientKey = forwardedFor || "unknown";
    if (isRateLimited(`login:${clientKey}`, 5, 15 * 60 * 1000)) return failure("Too many login attempts. Please try again later.", 429);
    const result = await parseBody(request, loginSchema);
    if ("error" in result) return result.error;
    const admin = await prisma.admin.findUnique({ where: { email: result.data.email } });
    if (!admin || !(await bcrypt.compare(result.data.password, admin.passwordHash))) return failure("Invalid email or password.", 401);
    const token = await createSession(admin.id, admin.email);
    const response = NextResponse.json({ success: true, data: { email: admin.email } });
    response.cookies.set(sessionCookie.name, token, sessionCookie.options);
    return response;
  } catch (error) {
    console.error("Admin login failed", error);
    return failure("Unable to sign in.", 500);
  }
}
