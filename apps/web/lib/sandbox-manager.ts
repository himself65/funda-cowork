import { Sandbox } from "@vercel/sandbox";
import { getScaffoldFiles, getWorkspaceFiles } from "@/lib/sandbox-templates";

/**
 * Sandbox lifecycle management following consensus-cowork's SandboxManager pattern.
 * Manages creation, connection, file setup, and cleanup of Vercel Sandboxes.
 */

interface SandboxEntry {
  sandboxId: string;
  createdAt: number;
}

const activeSandboxes = new Map<string, SandboxEntry>();

const SANDBOX_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const STALE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes
const IDLE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

export interface SandboxResult {
  sandbox: Sandbox;
  isExisting: boolean;
}

/** Connect to an existing sandbox by ID. */
export async function connectSandbox(sandboxId: string): Promise<Sandbox> {
  const sandbox = await Sandbox.get({ sandboxId });
  return sandbox;
}

/** Create a new sandbox and copy workspace files into it. */
export async function createSandbox(): Promise<Sandbox> {
  const sandbox = await Sandbox.create({
    timeout: SANDBOX_TIMEOUT_MS,
    runtime: "node22",
  });

  activeSandboxes.set(sandbox.sandboxId, {
    sandboxId: sandbox.sandboxId,
    createdAt: Date.now(),
  });

  // Copy workspace files (CLAUDE.md, scaffold) into sandbox
  await copyWorkspaceFiles(sandbox);

  return sandbox;
}

/** Initialize sandbox — connect if ID provided, otherwise create new. */
export async function initSandbox(
  sandboxId?: string | null,
): Promise<SandboxResult> {
  if (sandboxId) {
    const sandbox = await connectSandbox(sandboxId);
    return { sandbox, isExisting: true };
  }
  const sandbox = await createSandbox();
  return { sandbox, isExisting: false };
}

/** Copy scaffold + workspace instruction files into the sandbox. */
async function copyWorkspaceFiles(sandbox: Sandbox): Promise<void> {
  const scaffoldFiles = getScaffoldFiles();
  const workspaceFiles = getWorkspaceFiles();
  const allFiles = [...scaffoldFiles, ...workspaceFiles];

  await sandbox.writeFiles(
    allFiles.map((f) => ({
      path: f.path,
      content: Buffer.from(f.content),
    })),
  );
}

/** Stop and clean up a sandbox. */
export async function stopSandbox(sandboxId: string): Promise<void> {
  try {
    const sandbox = await Sandbox.get({ sandboxId });
    await sandbox.stop();
  } catch {
    // Sandbox may already be stopped or expired
  } finally {
    activeSandboxes.delete(sandboxId);
  }
}

/** Clean up sandboxes that have exceeded the stale threshold. */
export function cleanupStaleSandboxes(): void {
  const now = Date.now();
  for (const [id, entry] of activeSandboxes) {
    if (now - entry.createdAt > STALE_THRESHOLD_MS) {
      stopSandbox(id);
    }
  }
}
