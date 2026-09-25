import { createHash, randomUUID } from "crypto";
import { cookies } from "next/headers";
import { failure, success } from "@/lib/api-response";
import { recordProjectView } from "@/services/projects";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

const visitorCookieName = "donprod_visitor";

export async function POST(_: Request, { params }: RouteContext) {
  const { slug } = await params;
  const cookieStore = await cookies();
  let visitorId = cookieStore.get(visitorCookieName)?.value;
  const responseCookie = !visitorId;
  visitorId ??= randomUUID();
  const visitorHash = createHash("sha256").update(visitorId).digest("hex");
  try {
    const result = await recordProjectView(slug, visitorHash);
    if (!result) return failure("Project not found.", 404);
    const response = success(result, 202);
    if (responseCookie) {
      response.cookies.set(visitorCookieName, visitorId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
    }
    return response;
  } catch (error) {
    console.error("Unable to record project view", error);
    return failure("Unable to record project view.", 500);
  }
}
