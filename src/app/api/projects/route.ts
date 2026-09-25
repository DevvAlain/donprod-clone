import { failure, success } from "@/lib/api-response";
import { listProjects } from "@/services/projects";

export async function GET() {
  try {
    return success(await listProjects());
  } catch (error) {
    console.error("Unable to list public projects", error);
    return failure("Unable to load projects.", 500);
  }
}
