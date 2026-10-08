import { failure, success } from "@/lib/api-response";
import { getTvcItemBySlug } from "@/services/tvc";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const item = await getTvcItemBySlug(decodeURIComponent(slug));
    if (!item) return failure("TVC item not found.", 404);
    return success(item);
  } catch (error) {
    console.error("Unable to load TVC item", error);
    return failure("Unable to load TVC item.", 500);
  }
}
