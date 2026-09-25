import { success, failure } from "@/lib/api-response";
import { getContactSettings } from "@/services/contact";

export const runtime = "nodejs";

export async function GET() {
  try {
    return success(await getContactSettings());
  } catch (error) {
    console.error("Unable to load contact settings", error);
    return failure("Unable to load contact settings.", 500);
  }
}
