import { failure, success } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { parseBody } from "@/lib/request";
import { tvcItemUpdateSchema } from "@/lib/tvc-validation";
import { deleteTvcItem, updateTvcItem } from "@/services/tvc";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    await requireAdmin();
    const result = await parseBody(request, tvcItemUpdateSchema);
    if ("error" in result) return result.error;
    const { id } = await params;
    return success(await updateTvcItem(id, result.data));
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return failure("Unauthorized.", 401);
    if (error instanceof Error && error.message.includes("Record to update not found")) return failure("TVC item not found.", 404);
    console.error("Unable to update TVC item", error);
    return failure("Unable to update TVC item.", 500);
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteTvcItem(id);
    return success(null);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return failure("Unauthorized.", 401);
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) return failure("TVC item not found.", 404);
    console.error("Unable to delete TVC item", error);
    return failure("Unable to delete TVC item.", 500);
  }
}
