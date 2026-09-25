import { failure, success } from "@/lib/api-response";
import { getProjectBySlug } from "@/services/projects";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_: Request, { params }: RouteContext) {
  const { slug } = await params;
  try {
    const project = await getProjectBySlug(slug);
    return project ? success(project) : failure("Project not found.", 404);
  } catch (error) {
    console.error("Unable to load public project", error);
    return failure("Unable to load project.", 500);
  }
}
