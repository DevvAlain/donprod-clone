import { success, failure } from "@/lib/api-response";
import { getContactSettings } from "@/services/contact";

export const runtime = "nodejs";

export async function GET() {
  try {
    const response = success(await getContactSettings());
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=600");
    return response;
  } catch (error) {
    console.error("Unable to load contact settings", error);
    return failure("Unable to load contact settings.", 500);
  }
}
