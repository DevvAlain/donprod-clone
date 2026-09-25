import { failure, success } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { parseBody } from "@/lib/request";
import { tvcReorderSchema } from "@/lib/tvc-validation";
import { reorderTvcItems } from "@/services/tvc";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const result = await parseBody(request, tvcReorderSchema);
    if ("error" in result) return result.error;
    await reorderTvcItems(result.data.itemIds);
    return success(null);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return failure("Unauthorized.", 401);
    if (error instanceof Error && error.message === "TVC_ITEM_NOT_FOUND") return failure("TVC item not found.", 404);
    console.error("Unable to reorder TVC items", error);
    return failure("Unable to reorder TVC items.", 500);
  }
}
