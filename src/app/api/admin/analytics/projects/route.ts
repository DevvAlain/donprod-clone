import { failure, success } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { projectAnalytics } from "@/services/projects";

export async function GET() {
  try {
    await requireAdmin();
    return success(await projectAnalytics());
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return failure("Unauthorized.", 401);
    console.error("Unable to load project analytics", error);
    return failure("Unable to load project analytics.", 500);
  }
}
