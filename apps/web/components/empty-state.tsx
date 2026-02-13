"use client";

import React from "react";

import { Bot, Sparkles, Zap, TrendingUp } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Bot className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2 text-balance text-center">
        No agents yet
      </h3>
      <p className="text-sm text-muted-foreground mb-8 max-w-md text-center leading-relaxed">
        Create your first AI agent using the prompt above. Describe what data
        you want to track and
        {"we'll"} build a complete data pipeline and dashboard for you.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg w-full">
        <FeatureCard
          icon={Sparkles}
          title="Vibe Code"
          description="Describe in plain English, we build it"
        />
        <FeatureCard
          icon={Zap}
          title="Auto Pipeline"
          description="Data sources connected automatically"
        />
        <FeatureCard
          icon={TrendingUp}
          title="Live Data"
          description="Real-time updates on your schedule"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 text-center">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2.5">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="text-sm font-semibold text-foreground mb-1">{title}</div>
      <div className="text-[11px] text-muted-foreground leading-snug">
        {description}
      </div>
    </div>
  );
}
