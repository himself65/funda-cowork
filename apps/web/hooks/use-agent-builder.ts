"use client";

import { useState, useCallback, useRef } from "react";
import type { BuildEventType, BuildStep } from "@/lib/types";

/**
 * SSE event parsing following consensus-cowork's named event format.
 * Format: `event: <name>\ndata: <json>\n\n`
 */

const STEP_ORDER: BuildEventType[] = [
  "sandbox:init_start",
  "sandbox:init_progress",
  "sandbox:init_complete",
  "deps:install_start",
  "deps:install_complete",
  "agent:start",
  "agent:message",
  "agent:complete",
  "build:server_start",
  "build:complete",
];

const STEP_LABELS: Record<BuildEventType, string> = {
  "sandbox:init_start": "Creating sandbox environment",
  "sandbox:init_progress": "Setting up sandbox",
  "sandbox:init_complete": "Sandbox ready",
  "deps:install_start": "Installing dependencies",
  "deps:install_complete": "Dependencies installed",
  "agent:start": "AI is generating your widget",
  "agent:message": "Writing code",
  "agent:complete": "Code generation complete",
  "build:server_start": "Starting preview server",
  "build:complete": "Build complete",
  "build:error": "Build failed",
};

function buildInitialSteps(): BuildStep[] {
  return [
    {
      type: "sandbox:init_start",
      message: "Creating sandbox environment",
      status: "pending",
    },
    {
      type: "deps:install_start",
      message: "Installing dependencies",
      status: "pending",
    },
    {
      type: "agent:start",
      message: "AI is generating your widget",
      status: "pending",
    },
    {
      type: "build:server_start",
      message: "Starting preview server",
      status: "pending",
    },
    { type: "build:complete", message: "Build complete", status: "pending" },
  ];
}

function getStepIndex(type: BuildEventType): number {
  return STEP_ORDER.indexOf(type);
}

/**
 * Parse named SSE events from a text buffer.
 * Handles the `event: <name>\ndata: <json>\n\n` format used by consensus-cowork.
 */
function parseSSEBuffer(buffer: string): {
  events: Array<{ event: string; data: Record<string, unknown> }>;
  remainder: string;
} {
  const events: Array<{ event: string; data: Record<string, unknown> }> = [];
  const blocks = buffer.split("\n\n");
  const remainder = blocks.pop() || "";

  for (const block of blocks) {
    if (!block.trim()) continue;
    let eventName = "";
    let dataStr = "";

    for (const line of block.split("\n")) {
      if (line.startsWith("event: ")) {
        eventName = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        dataStr = line.slice(6).trim();
      }
    }

    if (eventName && dataStr) {
      try {
        events.push({ event: eventName, data: JSON.parse(dataStr) });
      } catch {
        // Skip malformed JSON
      }
    }
  }

  return { events, remainder };
}

export function useAgentBuilder() {
  const [isBuilding, setIsBuilding] = useState(false);
  const [steps, setSteps] = useState<BuildStep[]>(buildInitialSteps);
  const [currentMessage, setCurrentMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sandboxId, setSandboxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const startBuild = useCallback(async (prompt: string) => {
    setIsBuilding(true);
    setSteps(buildInitialSteps());
    setCurrentMessage("");
    setPreviewUrl(null);
    setSandboxId(null);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/agent/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Build request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const { events, remainder } = parseSSEBuffer(buffer);
        buffer = remainder;

        for (const { event: eventName, data } of events) {
          const eventType = eventName as BuildEventType;

          // Update current message based on event type
          if (eventType === "agent:message") {
            // stream-json format from Claude CLI — show type-specific info
            const msgType = data.type as string;
            if (
              msgType === "assistant" &&
              typeof data.message === "object" &&
              data.message
            ) {
              const msg = data.message as Record<string, unknown>;
              const content = msg.content;
              if (Array.isArray(content)) {
                for (const block of content) {
                  if (
                    (block as Record<string, unknown>).type === "text" &&
                    typeof (block as Record<string, unknown>).text === "string"
                  ) {
                    setCurrentMessage(
                      (prev) =>
                        prev + (block as Record<string, unknown>).text,
                    );
                  }
                }
              }
            } else if (msgType === "result") {
              setCurrentMessage(
                STEP_LABELS["agent:complete"],
              );
            }
          } else {
            setCurrentMessage(
              STEP_LABELS[eventType] || JSON.stringify(data),
            );
          }

          // Handle error
          if (eventType === "build:error") {
            const errMsg =
              (data.error as string) || "Unknown build error";
            setError(errMsg);
            setSteps((prev) =>
              prev.map((s) =>
                s.status === "active"
                  ? { ...s, status: "error", message: errMsg }
                  : s,
              ),
            );
            setIsBuilding(false);
            return;
          }

          // Handle completion
          if (eventType === "build:complete") {
            setPreviewUrl((data.previewUrl as string) ?? null);
            setSandboxId((data.sandboxId as string) ?? null);
            setSteps((prev) =>
              prev.map((s) => ({ ...s, status: "done" as const })),
            );
            setIsBuilding(false);
            return;
          }

          // Update step states based on event progress
          const eventIndex = getStepIndex(eventType);
          if (eventIndex >= 0) {
            setSteps((prev) =>
              prev.map((step) => {
                const stepIndex = getStepIndex(step.type);
                if (stepIndex < 0) return step;
                if (stepIndex < eventIndex) {
                  return { ...step, status: "done" };
                }
                if (stepIndex === eventIndex) {
                  return { ...step, status: "active" };
                }
                return step;
              }),
            );
          }

          // Capture sandbox ID
          if (
            eventType === "sandbox:init_complete" &&
            typeof data.sandboxId === "string"
          ) {
            setSandboxId(data.sandboxId);
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const message =
        err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setSteps((prev) =>
        prev.map((s) =>
          s.status === "active"
            ? { ...s, status: "error", message }
            : s,
        ),
      );
    } finally {
      setIsBuilding(false);
      abortRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsBuilding(false);
  }, []);

  return {
    isBuilding,
    steps,
    currentMessage,
    previewUrl,
    sandboxId,
    error,
    startBuild,
    cancel,
  };
}
