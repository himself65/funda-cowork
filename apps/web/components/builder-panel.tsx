"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Agent } from "@/lib/agent-store";

interface ChatMessage {
  role: "user" | "agent" | "divider";
  text: string;
  time?: string;
}

interface BuilderPanelProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
}

export function BuilderPanel({
  isOpen,
  onClose,
  agents,
  selectedAgentId,
  onSelectAgent,
}: BuilderPanelProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  useEffect(() => {
    if (selectedAgent) {
      setMessages([
        {
          role: "agent",
          text: `I'm the builder for **${selectedAgent.name}**. This agent ${selectedAgent.description}.\n\nI can help you refine the data pipeline, add new data sources, change the schedule, or modify the output format. What would you like to improve?`,
          time: "Now",
        },
      ]);
    } else {
      setMessages([
        {
          role: "agent",
          text: "Welcome to the Agent Builder! Select one of your agents above to start refining it, or create a new agent from the main dashboard.",
          time: "Now",
        },
      ]);
    }
  }, [selectedAgent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      role: "user",
      text: input.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate agent response
    setTimeout(() => {
      const agentMsg: ChatMessage = {
        role: "agent",
        text: getAgentResponse(input.trim(), selectedAgent?.name),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, agentMsg]);
    }, 1000);
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-card border-l border-border flex-shrink-0 transition-all duration-300 overflow-hidden",
        isOpen ? "w-[460px]" : "w-0 border-l-0",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border flex-shrink-0">
        <Bot className="w-[15px] h-[15px] text-primary" />
        <h3 className="text-sm font-bold text-foreground flex-1">
          Agent Builder
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Agent selector tabs */}
      {agents.length > 0 && (
        <div className="flex gap-1.5 px-5 py-3 border-b border-border flex-shrink-0 overflow-x-auto">
          {agents.map((agent) => (
            <button
              key={agent.id}
              type="button"
              onClick={() => onSelectAgent(agent.id)}
              className={cn(
                "px-3 py-1 rounded-2xl text-[11px] font-semibold border transition-colors whitespace-nowrap",
                selectedAgentId === agent.id
                  ? "bg-primary/15 border-primary text-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-foreground",
              )}
            >
              {agent.name}
            </button>
          ))}
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">
        {messages.map((msg, i) => {
          if (msg.role === "divider") {
            return (
              <div
                key={`divider-${i}`}
                className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold"
              >
                <div className="flex-1 h-px bg-border" />
                {msg.text}
                <div className="flex-1 h-px bg-border" />
              </div>
            );
          }

          return (
            <div
              key={`msg-${i}`}
              className={cn(
                "flex gap-2.5",
                msg.role === "user" && "flex-row-reverse",
              )}
            >
              <div
                className={cn(
                  "w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",
                  msg.role === "agent"
                    ? "bg-gradient-to-br from-primary to-[hsl(var(--chart-4))] text-primary-foreground"
                    : "bg-secondary text-foreground",
                )}
              >
                {msg.role === "agent" ? <Bot className="w-3.5 h-3.5" /> : "ZY"}
              </div>
              <div className="flex flex-col max-w-[340px]">
                <div
                  className={cn(
                    "rounded-[14px] px-3.5 py-2.5 text-[13px] leading-relaxed",
                    msg.role === "agent"
                      ? "bg-secondary text-foreground rounded-tl-[4px]"
                      : "bg-primary text-primary-foreground rounded-tr-[4px]",
                  )}
                >
                  <MessageContent text={msg.text} />
                </div>
                {msg.time && (
                  <div
                    className={cn(
                      "text-[10px] text-muted-foreground mt-1 px-1",
                      msg.role === "user" && "text-right",
                    )}
                  >
                    {msg.time}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end px-4 py-3.5 border-t border-border flex-shrink-0">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Tell the agent what to build or improve..."
          rows={1}
          className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground outline-none resize-none min-h-[40px] max-h-[100px] font-sans leading-snug transition-colors focus:border-primary"
        />
        <button
          type="button"
          onClick={handleSend}
          className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

function MessageContent({ text }: { text: string }) {
  return (
    <div className="space-y-2">
      {text.split("\n\n").map((paragraph, i) => (
        <p key={`p-${i}`}>
          {paragraph.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={`b-${j}`}>{part.slice(2, -2)}</strong>;
            }
            return <span key={`t-${j}`}>{part}</span>;
          })}
        </p>
      ))}
    </div>
  );
}

function getAgentResponse(userInput: string, agentName?: string): string {
  const lower = userInput.toLowerCase();

  if (lower.includes("schedule") || lower.includes("frequency")) {
    return `I can adjust the schedule for **${agentName || "this agent"}**. Currently it runs every 6 hours. Would you like to change it to:\n\n- Every 2 hours (more real-time)\n- Every 12 hours (less frequent)\n- Daily at a specific time\n\nJust let me know your preference!`;
  }

  if (lower.includes("source") || lower.includes("data")) {
    return `Great question! **${agentName || "This agent"}** currently pulls from its primary data source. I can add additional sources like:\n\n- Twitter/X API for social sentiment\n- Reddit via PRAW\n- SEC EDGAR for filings\n- On-chain analytics\n\nWhich sources interest you?`;
  }

  if (lower.includes("filter") || lower.includes("ticker")) {
    return `I can add ticker filtering to **${agentName || "this agent"}**. You can specify:\n\n- Specific tickers (e.g., NVDA, TSLA, AAPL)\n- Sectors (e.g., AI/ML, Healthcare, Energy)\n- Market cap ranges\n\nWhat filters would you like to apply?`;
  }

  return `Got it! I'll work on updating **${agentName || "the agent"}** based on your request. Here's what I'm planning:\n\n1. Analyzing your requirements\n2. Updating the data pipeline\n3. Refreshing the output format\n\nThis should take just a moment. Is there anything else you'd like to adjust?`;
}
