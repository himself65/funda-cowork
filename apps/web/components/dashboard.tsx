"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { CreatePrompt } from "@/components/create-prompt";
import { AgentCard } from "@/components/agent-card";
import { EmptyState } from "@/components/empty-state";
import { BuilderPanel } from "@/components/builder-panel";
import { GeneratingOverlay } from "@/components/generating-overlay";
import {
  type Agent,
  deriveAgentMetadata,
  refreshAgentData,
} from "@/lib/agent-store";
import { useAgentBuilder } from "@/hooks/use-agent-builder";

export function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [buildingAgentName, setBuildingAgentName] = useState("");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const {
    isBuilding,
    steps,
    currentMessage,
    previewUrl,
    sandboxId,
    error,
    startBuild,
    cancel,
  } = useAgentBuilder();

  const handleCreateAgent = useCallback(
    (prompt: string) => {
      const metadata = deriveAgentMetadata(prompt);
      setBuildingAgentName(metadata.name);
      startBuild(prompt);
    },
    [startBuild],
  );

  // When build completes with a preview URL, add the agent
  useEffect(() => {
    if (previewUrl && !isBuilding) {
      const metadata = deriveAgentMetadata(buildingAgentName);
      const newAgent: Agent = {
        id: `agent-${Date.now()}`,
        ...metadata,
        name: buildingAgentName,
        status: "live",
        schedule: "Every 6 hours",
        subscribers: Math.floor(Math.random() * 5000),
        lastRun: "Just now",
        rows: [],
        createdAt: Date.now(),
        sandboxId: sandboxId ?? undefined,
        previewUrl,
      };
      setAgents((prev) => [newAgent, ...prev]);
      setSelectedAgentId(newAgent.id);
      setBuildingAgentName("");
    }
  }, [previewUrl, isBuilding, buildingAgentName, sandboxId]);

  // When build fails with error, add agent in error state
  useEffect(() => {
    if (error && !isBuilding && buildingAgentName) {
      const metadata = deriveAgentMetadata(buildingAgentName);
      const errorAgent: Agent = {
        id: `agent-${Date.now()}`,
        ...metadata,
        name: buildingAgentName,
        status: "error",
        schedule: "Every 6 hours",
        subscribers: 0,
        lastRun: "Failed",
        rows: [],
        createdAt: Date.now(),
        errorMessage: error,
      };
      setAgents((prev) => [errorAgent, ...prev]);
      setBuildingAgentName("");
    }
  }, [error, isBuilding, buildingAgentName]);

  const handleRefresh = useCallback((id: string) => {
    setAgents((prev) =>
      prev.map((agent) => (agent.id === id ? refreshAgentData(agent) : agent)),
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setAgents((prev) => {
      const agent = prev.find((a) => a.id === id);
      if (agent?.sandboxId) {
        fetch("/api/agent/stop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sandboxId: agent.sandboxId }),
        }).catch(() => {});
      }
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const handleCancelBuild = useCallback(() => {
    cancel();
    setBuildingAgentName("");
  }, [cancel]);

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar agentCount={agents.length} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-border flex items-center px-6 gap-4 flex-shrink-0">
          <span className="font-bold text-[17px] text-foreground">
            My Dashboards
          </span>
          <div className="ml-auto flex gap-2.5 items-center">
            <Button
              onClick={() => setBuilderOpen(!builderOpen)}
              className="rounded-lg text-[13px] font-semibold h-9"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Agent
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <CreatePrompt
            onCreateAgent={handleCreateAgent}
            isBuilding={isBuilding}
          />

          {agents.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onRefresh={handleRefresh}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Ask All Agents Bar */}
          {agents.length > 0 && (
            <div className="sticky bottom-0 pt-4 pb-5 flex justify-center pointer-events-none z-10">
              <div className="w-full max-w-[640px] flex gap-2.5 items-center pointer-events-auto bg-card border border-border rounded-2xl py-2 pl-5 pr-2 shadow-xl">
                <input
                  type="text"
                  placeholder='Ask all agents — e.g. "What are the top signals today?"'
                  className="flex-1 bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0 font-sans"
                />
                <button
                  type="button"
                  className="w-[38px] h-[38px] rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity"
                >
                  <Bot className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Builder Panel */}
      <BuilderPanel
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        agents={agents}
        selectedAgentId={selectedAgentId}
        onSelectAgent={setSelectedAgentId}
      />

      {/* Mobile toggle */}
      {!builderOpen && agents.length > 0 && (
        <button
          type="button"
          onClick={() => setBuilderOpen(true)}
          className="fixed right-4 bottom-4 w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg z-50 md:hidden hover:opacity-90 transition-opacity"
        >
          <Bot className="w-5 h-5" />
        </button>
      )}

      {/* Generating Overlay */}
      <GeneratingOverlay
        isOpen={isBuilding}
        onCancel={handleCancelBuild}
        agentName={buildingAgentName}
        steps={steps}
        currentMessage={currentMessage}
        error={error}
      />
    </div>
  );
}
