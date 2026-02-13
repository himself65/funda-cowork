import { initSandbox, stopSandbox } from "@/lib/sandbox-manager";
import { SANDBOX_BASE_DIR } from "@/lib/sandbox-templates";
import { buildAgentPrompt } from "@/lib/prompts";
import { formatSSE } from "@/lib/types";

/**
 * Core SSE API route for agent creation.
 *
 * Following consensus-cowork's StreamHandler pattern:
 * 1. Create/connect Vercel Sandbox
 * 2. Install dependencies
 * 3. Run Claude CLI *inside* the sandbox (--output-format stream-json)
 * 4. Stream Claude's stdout as `agent:message` SSE events
 * 5. Start Vite dev server, return preview URL
 */
export async function POST(request: Request) {
  const { prompt, sandboxId: existingSandboxId } = (await request.json()) as {
    prompt: string;
    sandboxId?: string;
  };

  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 },
    );
  }

  const encoder = new TextEncoder();
  let sandboxId: string | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (
        event: Parameters<typeof formatSSE>[0],
        data: Record<string, unknown>,
      ) => {
        controller.enqueue(encoder.encode(formatSSE(event, data)));
      };

      try {
        // 1. Initialize sandbox
        send("sandbox:init_start", {
          sandboxId: existingSandboxId ?? null,
        });

        const result = await initSandbox(existingSandboxId);
        const sandbox = result.sandbox;
        sandboxId = sandbox.sandboxId;

        send("sandbox:init_complete", {
          sandboxId,
          isExisting: result.isExisting,
        });

        // 2. Install project dependencies
        send("deps:install_start", {});

        const installResult = await sandbox.runCommand({
          cmd: "npm",
          args: ["install"],
          cwd: SANDBOX_BASE_DIR,
        });
        if (installResult.exitCode !== 0) {
          const stderr = await installResult.stderr();
          throw new Error(`npm install failed: ${stderr || "unknown error"}`);
        }
        send("deps:install_complete", {});

        // 3. Install Claude CLI in sandbox (consensus-cowork pattern)
        send("sandbox:init_progress", {
          step: "install_claude",
          status: "start",
        });

        const cliInstall = await sandbox.runCommand({
          cmd: "npm",
          args: ["install", "-g", "@anthropic-ai/claude-code"],
          sudo: true,
        });
        if (cliInstall.exitCode !== 0) {
          const stderr = await cliInstall.stderr();
          throw new Error(
            `Claude CLI install failed: ${stderr || "unknown error"}`,
          );
        }
        send("sandbox:init_progress", {
          step: "install_claude",
          status: "complete",
        });

        // 4. Run Claude CLI inside sandbox (consensus-cowork's ClaudeAgent pattern)
        //    Use detached mode + logs() iterator to stream stdout in real-time
        const agentPrompt = buildAgentPrompt(prompt);

        send("agent:start", { prompt: agentPrompt });

        const claudeCmd = await sandbox.runCommand({
          cmd: "claude",
          args: [
            "-p",
            agentPrompt,
            "--output-format",
            "stream-json",
            "--verbose",
            "--dangerously-skip-permissions",
          ],
          cwd: SANDBOX_BASE_DIR,
          env: { ANTHROPIC_API_KEY: apiKey },
          detached: true,
        });

        // Stream stdout line-by-line (like consensus-cowork's ClaudeAgent)
        let stdoutBuffer = "";
        for await (const log of claudeCmd.logs()) {
          if (log.stream === "stdout") {
            stdoutBuffer += log.data;
            // Process complete lines
            while (stdoutBuffer.includes("\n")) {
              const newlineIdx = stdoutBuffer.indexOf("\n");
              const line = stdoutBuffer.slice(0, newlineIdx).trim();
              stdoutBuffer = stdoutBuffer.slice(newlineIdx + 1);
              if (!line) continue;
              try {
                const data = JSON.parse(line);
                send("agent:message", data);
              } catch {
                // Partial JSON or non-JSON output — skip
              }
            }
          }
        }
        // Flush remaining buffer
        if (stdoutBuffer.trim()) {
          try {
            const data = JSON.parse(stdoutBuffer.trim());
            send("agent:message", data);
          } catch {
            // skip
          }
        }

        const claudeResult = await claudeCmd.wait();
        if (claudeResult.exitCode !== 0) {
          const stderr = await claudeResult.stderr();
          throw new Error(
            `Claude execution failed (exit ${claudeResult.exitCode}): ${stderr || ""}`,
          );
        }

        send("agent:complete", { output: null });

        // 5. Start Vite dev server
        send("build:server_start", {});

        await sandbox.runCommand({
          cmd: "npx",
          args: ["vite", "--host", "0.0.0.0", "--port", "5173"],
          cwd: SANDBOX_BASE_DIR,
          detached: true,
        });

        // Give Vite a moment to start
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const previewUrl = sandbox.domain(5173);
        send("build:complete", {
          sandboxId,
          previewUrl,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown build error";
        send("build:error", {
          error: message,
          sandboxId: sandboxId ?? undefined,
        });

        if (sandboxId) {
          await stopSandbox(sandboxId).catch(() => {});
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
