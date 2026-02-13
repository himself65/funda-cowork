"use client";

import React from "react";

import { Bot, Home, Zap, Settings, CreditCard, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  agentCount: number;
}

export function AppSidebar({ agentCount }: AppSidebarProps) {
  return (
    <aside className="hidden md:flex w-[260px] flex-col border-r border-border bg-card flex-shrink-0 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(var(--chart-4))] flex items-center justify-center text-sm font-bold text-primary-foreground">
          AM
        </div>
        <span className="font-bold text-base bg-gradient-to-r from-primary to-[hsl(var(--chart-4))] bg-clip-text text-transparent">
          Alpha Meta AI
        </span>
      </div>

      {/* Nav Sections */}
      <div className="flex flex-col flex-1">
        <SectionLabel>Agents</SectionLabel>
        <NavItem
          icon={Bot}
          label="My Agents"
          active
          badge={agentCount > 0 ? String(agentCount) : undefined}
        />
        <NavItem icon={Home} label="Agent Market" />

        <SectionLabel>Skills</SectionLabel>
        <NavItem icon={Zap} label="Skills Market" badge="12" />

        <SectionLabel>Settings</SectionLabel>
        <NavItem icon={Settings} label="Configuration" />
        <NavItem icon={CreditCard} label="Billing" />
        <NavItem icon={HelpCircle} label="Help & Docs" />
      </div>

      {/* User */}
      <div className="mt-auto border-t border-border p-4">
        <div className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-primary to-[hsl(var(--chart-4))] flex items-center justify-center text-[13px] font-semibold text-primary-foreground">
            ZY
          </div>
          <div>
            <div className="text-[13px] font-semibold text-foreground">
              Zhiye
            </div>
            <div className="text-[11px] text-muted-foreground">Pro Plan</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  badge?: string;
}

function NavItem({ icon: Icon, label, active, badge }: NavItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-2.5 px-4 py-2 mx-2 my-0.5 rounded-lg text-sm transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <Icon className="w-[18px] h-[18px]" />
      <span>{label}</span>
      {badge && (
        <span className="ml-auto bg-primary text-primary-foreground text-[11px] px-2 py-0.5 rounded-full font-semibold">
          {badge}
        </span>
      )}
    </button>
  );
}
