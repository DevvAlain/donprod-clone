import { failure, success } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { reorderSchema } from "@/lib/project-validation";
import { parseBody } from "@/lib/request";
import { reorderProjects } from "@/services/projects";

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const result = await parseBody(request, reorderSchema);
    if ("error" in result) return result.error;
    await reorderProjects(result.data.projectIds);
    return success(null);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return failure("Unauthorized.", 401);
    if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") return failure("One or more projects do not exist.", 404);
    console.error("Unable to reorder projects", error);
    return failure("Unable to reorder projects.", 500);
  }
}
