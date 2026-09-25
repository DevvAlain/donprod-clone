import { z } from "zod";
import { failure } from "@/lib/api-response";

export async function parseBody<T extends z.ZodType>(request: Request, schema: T) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 100_000) {
    return { error: failure("Request body is too large.", 413) } as const;
  }
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return { error: failure("Invalid request data.", 422, parsed.error.issues) } as const;
    }
    return { data: parsed.data } as const;
  } catch {
    return { error: failure("Malformed JSON request.", 400) } as const;
  }
}
