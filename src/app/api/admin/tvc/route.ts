import { failure, success } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { parseBody } from "@/lib/request";
import { tvcItemSchema } from "@/lib/tvc-validation";
import { createTvcItem, listTvcItems } from "@/services/tvc";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    return success(await listTvcItems(true));
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return failure("Unauthorized.", 401);
    console.error("Unable to list admin TVC items", error);
    return failure("Unable to load TVC items.", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const result = await parseBody(request, tvcItemSchema);
    if ("error" in result) return result.error;
    return success(await createTvcItem(result.data), 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return failure("Unauthorized.", 401);
    console.error("Unable to create TVC item", error);
    return failure("Unable to create TVC item.", 500);
  }
}
