import { failure, success } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { projectUpdateSchema } from "@/lib/project-validation";
import { parseBody } from "@/lib/request";
import { deleteProject, getProjectById, updateProject } from "@/services/projects";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const runtime = "nodejs";

export async function GET(_: Request, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;
    const project = await getProjectById(id);
    return project ? success(project) : failure("Project not found.", 404);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return failure("Unauthorized.", 401);
    return failure("Unable to load project.", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    await requireAdmin();
    const result = await parseBody(request, projectUpdateSchema);
    if ("error" in result) return result.error;
    const { id } = await params;
    return success(await updateProject(id, result.data));
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return failure("Unauthorized.", 401);
    if (error instanceof Error && error.message.includes("Record to update not found")) return failure("Project not found.", 404);
    if (error instanceof Error && error.message.includes("Unique constraint")) return failure("A project with this slug already exists.", 409);
    console.error("Unable to update project", error);
    return failure("Unable to update project.", 500);
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteProject(id);
    return success(null, 204);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return failure("Unauthorized.", 401);
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) return failure("Project not found.", 404);
    console.error("Unable to delete project", error);
    return failure("Unable to delete project.", 500);
  }
}
