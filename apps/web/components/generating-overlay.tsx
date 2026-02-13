"use client";

import { useRef, useEffect } from "react";
import { Check, Circle, Loader2, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BuildStep } from "@/lib/types";

interface GeneratingOverlayProps {
  isOpen: boolean;
  onCancel: () => void;
  agentName: string;
  steps: BuildStep[];
  currentMessage: string;
  error: string | null;
}

export function GeneratingOverlay({
  isOpen,
  onCancel,
  agentName,
  steps,
  currentMessage,
  error,
}: GeneratingOverlayProps) {
  const codePreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (codePreviewRef.current) {
      codePreviewRef.current.scrollTop = codePreviewRef.current.scrollHeight;
    }
  }, [currentMessage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/85 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-10 text-center max-w-[520px] w-full mx-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-foreground">
            Building {agentName || "Your Agent"}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[13px] text-muted-foreground mb-6 leading-relaxed text-left">
          AI is building a data pipeline and visualization for your request
        </p>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-5 text-left">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">
                Build failed
              </p>
              <p className="text-xs text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="text-left flex flex-col gap-3">
          {steps.map((step) => {
            const isDone = step.status === "done";
            const isActive = step.status === "active";
            const isPending = step.status === "pending";
            const isError = step.status === "error";

            return (
              <div
                key={step.type}
                className="flex items-center gap-3 text-[13px]"
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                    isDone && "bg-success/15 text-success",
                    isActive && "bg-primary/15 text-primary animate-pulse-glow",
                    isPending && "bg-secondary text-muted-foreground",
                    isError && "bg-destructive/15 text-destructive",
                  )}
                >
                  {isDone ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : isActive ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isError ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : (
                    <Circle className="w-3 h-3" />
                  )}
                </div>
                <span
                  className={cn(
                    isDone && "text-success",
                    isActive && "text-foreground",
                    isPending && "text-muted-foreground",
                    isError && "text-destructive",
                  )}
                >
                  {step.message}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live code preview */}
        {currentMessage && (
          <div className="bg-background border border-border rounded-xl mt-5 overflow-hidden">
            <div className="flex border-b border-border">
              <div className="px-4 py-2 text-xs text-primary border-b-2 border-primary">
                Claude Output
              </div>
            </div>
            <div
              ref={codePreviewRef}
              className="p-4 font-mono text-xs text-muted-foreground leading-relaxed max-h-[180px] overflow-y-auto text-left whitespace-pre-wrap break-all"
            >
              {currentMessage.slice(-2000)}
            </div>
          </div>
        )}

        {/* Cancel button */}
        {!error && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel build
          </button>
        )}
      </div>
    </div>
  );
}
