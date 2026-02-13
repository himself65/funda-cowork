"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXAMPLE_PROMPTS = [
  "Top Reddit posts about crypto each day",
  "Weekly SEC filing summaries for tech stocks",
  "Real-time whale wallet tracking on ETH",
  "Daily macro indicator dashboard",
];

interface CreatePromptProps {
  onCreateAgent: (prompt: string) => void;
  isBuilding: boolean;
}

export function CreatePrompt({ onCreateAgent, isBuilding }: CreatePromptProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (!prompt.trim() || isBuilding) return;
    onCreateAgent(prompt.trim());
    setPrompt("");
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-7 mb-7">
      <h2 className="text-lg font-bold text-foreground mb-1.5 text-balance">
        What data do you want to track?
      </h2>
      <p className="text-[13px] text-muted-foreground mb-5 leading-relaxed">
        {
          "Describe your dashboard in natural language. We'll generate the data pipeline and UI for you."
        }
      </p>
      <div className="flex gap-2.5">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          placeholder="e.g. Track daily Twitter sentiment on $TSLA, $NVDA, $AAPL with bull/bear signals..."
          className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary"
        />
        <Button
          onClick={handleSubmit}
          disabled={!prompt.trim() || isBuilding}
          className="rounded-xl px-5 py-3 h-auto"
        >
          <Sparkles className="w-4 h-4 mr-1.5" />
          {isBuilding ? "Building..." : "Build Agent"}
        </Button>
      </div>
      <div className="flex gap-2 mt-3.5 flex-wrap">
        {EXAMPLE_PROMPTS.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setPrompt(example)}
            className="bg-secondary border border-border px-3.5 py-1.5 rounded-full text-xs text-muted-foreground cursor-pointer transition-colors hover:border-primary hover:text-primary"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
