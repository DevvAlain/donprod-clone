import { failure, success } from "@/lib/api-response";
import { listTvcItems } from "@/services/tvc";

export const runtime = "nodejs";

export async function GET() {
  try {
    return success(await listTvcItems(false));
  } catch (error) {
    console.error("Unable to load TVC items", error);
    return failure("Unable to load TVC items.", 500);
  }
}
