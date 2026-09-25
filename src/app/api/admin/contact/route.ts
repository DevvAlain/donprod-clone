import { failure, success } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { contactSettingsSchema } from "@/lib/contact-validation";
import { parseBody } from "@/lib/request";
import { getContactSettings, updateContactSettings } from "@/services/contact";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    return success(await getContactSettings());
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return failure("Unauthorized.", 401);
    console.error("Unable to load admin contact settings", error);
    return failure("Unable to load contact settings.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const result = await parseBody(request, contactSettingsSchema);
    if ("error" in result) return result.error;
    return success(await updateContactSettings(result.data));
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return failure("Unauthorized.", 401);
    console.error("Unable to update contact settings", error);
    return failure("Unable to update contact settings.", 500);
  }
}
