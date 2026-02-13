"use client";

import React from "react";

import { useState, useRef, useEffect } from "react";
import {
  RefreshCw,
  Clock,
  Users,
  MoreHorizontal,
  Mail,
  Send,
  Settings,
  Trash2,
  TrendingUp,
  Twitter,
  Building2,
  Bot,
  MessageCircle,
  FileText,
  Wallet,
  BarChart3,
  Bitcoin,
  ExternalLink,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Agent, AgentStatus } from "@/lib/agent-store";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp,
  Twitter,
  Building2,
  Bot,
  MessageCircle,
  FileText,
  Wallet,
  BarChart3,
  Bitcoin,
};

interface AgentCardProps {
  agent: Agent;
  onRefresh: (id: string) => void;
  onDelete: (id: string) => void;
}

function StatusBadge({ status }: { status: AgentStatus }) {
  return (
    <span
      className={cn(
        "text-[11px] px-2.5 py-0.5 rounded-xl font-semibold flex-shrink-0",
        status === "live" && "bg-success/10 text-success",
        status === "building" && "bg-warning/10 text-warning",
        status === "paused" && "bg-muted text-muted-foreground",
        status === "error" && "bg-destructive/10 text-destructive",
      )}
    >
      {status === "live"
        ? "Live"
        : status === "building"
          ? "Building"
          : status === "error"
            ? "Error"
            : "Paused"}
    </span>
  );
}

function SandboxPreview({ url }: { url: string }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative rounded-lg overflow-hidden border border-border bg-background">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}
      <iframe
        src={url}
        title="Agent Preview"
        sandbox="allow-scripts allow-same-origin"
        className="w-full border-0"
        style={{ height: 240 }}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

export function AgentCard({ agent, onRefresh, onDelete }: AgentCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const Icon = ICON_MAP[agent.icon] || Bot;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh(agent.id);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="bg-card border border-border rounded-[14px] overflow-hidden transition-all hover:border-primary hover:-translate-y-0.5 group">
      {/* Header */}
      <div className="flex items-start gap-3 px-5 pt-[18px] pb-3.5">
        <div
          className={cn(
            "w-[38px] h-[38px] rounded-[10px] flex items-center justify-center flex-shrink-0",
            agent.iconBg,
          )}
        >
          <Icon className={cn("w-[18px] h-[18px]", agent.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate">
            {agent.name}
          </h3>
          <p className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">
            {agent.description}
          </p>
        </div>
        <StatusBadge status={agent.status} />

        {/* Dropdown menu */}
        <div className="relative flex-shrink-0 -ml-1" ref={dropdownRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}
            className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {dropdownOpen && (
            <div className="absolute top-[34px] right-0 bg-card border border-border rounded-xl p-1.5 min-w-[200px] shadow-xl z-20">
              <DropdownItem
                icon={RefreshCw}
                label="Refresh Data"
                onClick={() => {
                  handleRefresh();
                  setDropdownOpen(false);
                }}
              />
              <DropdownItem
                icon={Clock}
                label="Schedule Settings"
                onClick={() => setDropdownOpen(false)}
              />
              <DropdownItem
                icon={Mail}
                label="Send to my email"
                onClick={() => setDropdownOpen(false)}
              />
              <DropdownItem
                icon={Send}
                label="Send to Telegram"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="h-px bg-border mx-2 my-1" />
              <DropdownItem
                icon={Settings}
                label="Refine Agent"
                highlight
                onClick={() => setDropdownOpen(false)}
              />
              <DropdownItem
                icon={Trash2}
                label="Delete Agent"
                destructive
                onClick={() => {
                  onDelete(agent.id);
                  setDropdownOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Data Preview */}
      <div className="px-5 pb-[18px] min-h-[140px]">
        {agent.previewUrl ? (
          <SandboxPreview url={agent.previewUrl} />
        ) : agent.status === "building" ? (
          <BuildingState />
        ) : agent.status === "error" ? (
          <div className="flex flex-col items-center justify-center h-[120px] gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <p className="text-xs text-destructive">
              {agent.errorMessage || "Build failed"}
            </p>
          </div>
        ) : agent.rows.length > 0 ? (
          <DataTable
            columns={agent.columns}
            rows={agent.rows}
            isRefreshing={isRefreshing}
          />
        ) : (
          <div className="flex items-center justify-center h-[120px] text-muted-foreground text-sm">
            No data yet
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          {agent.schedule}
        </div>
        {agent.previewUrl ? (
          <a
            href={agent.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Open in new tab
          </a>
        ) : (
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {agent.subscribers.toLocaleString()} subscribers
          </div>
        )}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing || agent.status === "building"}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={cn("w-3 h-3", isRefreshing && "animate-spin")}
          />
          {agent.lastRun}
        </button>
      </div>
    </div>
  );
}

function DataTable({
  columns,
  rows,
  isRefreshing,
}: {
  columns: string[];
  rows: { cells: string[] }[];
  isRefreshing: boolean;
}) {
  return (
    <div className={cn("transition-opacity", isRefreshing && "opacity-40")}>
      <table className="w-full text-xs">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="text-left text-[11px] uppercase tracking-wide text-muted-foreground font-semibold px-2 py-1.5 border-b border-border"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`row-${i}`}>
              {row.cells.map((cell, j) => (
                <td
                  key={`cell-${i}-${j}`}
                  className={cn(
                    "px-2 py-[7px] border-b border-border/50",
                    j === 0 && "font-semibold text-foreground",
                    cell === "BULL" || cell === "BUY" || cell === "NEW"
                      ? "text-success font-semibold"
                      : cell === "BEAR" || cell === "SELL"
                        ? "text-destructive font-semibold"
                        : j !== 0 && "text-muted-foreground",
                  )}
                >
                  {cell === "BULL" ? (
                    <>{"BULL \u25B2"}</>
                  ) : cell === "BEAR" ? (
                    <>{"BEAR \u25BC"}</>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BuildingState() {
  return (
    <div className="flex flex-col gap-2.5 pt-1">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-background rounded-lg p-3">
          <div className="flex gap-3">
            <div
              className="h-3 rounded bg-border/60 animate-pulse"
              style={{ width: `${30 + i * 15}%` }}
            />
            <div
              className="h-3 rounded bg-border/40 animate-pulse"
              style={{ width: `${20 + i * 10}%` }}
            />
          </div>
          <div
            className="h-2.5 rounded bg-border/30 animate-pulse mt-2"
            style={{ width: `${60 + i * 8}%` }}
          />
        </div>
      ))}
    </div>
  );
}

interface DropdownItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  highlight?: boolean;
  destructive?: boolean;
  onClick: () => void;
}

function DropdownItem({
  icon: ItemIcon,
  label,
  highlight,
  destructive,
  onClick,
}: DropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] transition-colors text-left",
        highlight && "text-primary font-semibold hover:bg-primary/10",
        destructive && "text-destructive font-semibold hover:bg-destructive/10",
        !highlight && !destructive && "text-foreground hover:bg-secondary",
      )}
    >
      <ItemIcon className="w-[15px] h-[15px] flex-shrink-0" />
      {label}
    </button>
  );
}
