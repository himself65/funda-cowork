import { stopSandbox } from "@/lib/sandbox-manager";

export async function POST(request: Request) {
  const { sandboxId } = (await request.json()) as { sandboxId: string };

  if (!sandboxId || typeof sandboxId !== "string") {
    return Response.json({ error: "sandboxId is required" }, { status: 400 });
  }

  await stopSandbox(sandboxId);
  return Response.json({ ok: true });
}
