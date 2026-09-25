import { getSession } from "@/lib/auth";
import { failure, success } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  return session ? success({ email: session.email }) : failure("Unauthorized.", 401);
}
