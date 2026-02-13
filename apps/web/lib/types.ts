/**
 * SSE event types following consensus-cowork's named event pattern.
 * Events use colon-separated namespaces: "sandbox:*", "agent:*", "build:*"
 */
export type BuildEventType =
  | "sandbox:init_start"
  | "sandbox:init_progress"
  | "sandbox:init_complete"
  | "deps:install_start"
  | "deps:install_complete"
  | "agent:start"
  | "agent:message"
  | "agent:complete"
  | "build:server_start"
  | "build:complete"
  | "build:error";

export interface BuildEvent {
  event: BuildEventType;
  data: Record<string, unknown>;
}

export interface BuildStep {
  type: BuildEventType;
  message: string;
  status: "pending" | "active" | "done" | "error";
}

/**
 * Format an SSE event with named event type (matching consensus-cowork pattern).
 * Format: `event: <name>\ndata: <json>\n\n`
 */
export function formatSSE(event: BuildEventType, data: Record<string, unknown>): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}
