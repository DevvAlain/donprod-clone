import { failure, success } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { projectInputSchema } from "@/lib/project-validation";
import { parseBody } from "@/lib/request";
import { createProject, listProjects } from "@/services/projects";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    return success(await listProjects(true));
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return failure("Unauthorized.", 401);
    console.error("Unable to list admin projects", error);
    return failure("Unable to load projects.", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const result = await parseBody(request, projectInputSchema);
    if ("error" in result) return result.error;
    return success(await createProject(result.data), 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return failure("Unauthorized.", 401);
    if (error instanceof Error && error.message.includes("Unique constraint")) return failure("A project with this slug already exists.", 409);
    console.error("Unable to create project", error);
    return failure("Unable to create project.", 500);
  }
}
