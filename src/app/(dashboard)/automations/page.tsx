"use client";

import React from "react";
import {
  Zap,
  MessageSquare,
  Hash,
  Sparkles,
  Power,
  ChevronRight,
  Bot,
  Clock,
  Activity,
} from "lucide-react";
import { getAutomations } from "@/actions/automations";
import AutomationToggle from "@/components/automations/AutomationToggle";
import CreateAutomationButton from "@/components/automations/CreateAutomationButton";
import { useRouter } from "next/navigation";

type AutomationKeyword = {
  id: string;
  word: string;
};

type AutomationListener = {
  id: string;
  listener: "SMARTAI" | "MESSAGE";
  commentReply?: string | null;
  dmCount: number;
  commentCount: number;
};

type AutomationTrigger = {
  id: string;
  type: string;
};

type Automation = {
  id: string;
  name: string;
  createdAt: string;
  active: boolean;
  keywords: AutomationKeyword[];
  listener: AutomationListener | null;
  trigger: AutomationTrigger[];
};

const TRIGGER_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  MESSAGE: { icon: MessageSquare, color: "text-blue-400" },
  COMMENT: { icon: Hash, color: "text-purple-400" },
  STORY_MENTION: { icon: Zap, color: "text-amber-400" },
  NEW_FOLLOWER: { icon: Bot, color: "text-green-400" },
};

export default function AutomationsPage() {
  const router = useRouter();
  const [automations, setAutomations] = React.useState<Automation[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      const result = await getAutomations();
      setAutomations((result.data || []) as unknown as Automation[]);
      setLoading(false);
    };
    load();
  }, []);

  const activeCount = automations.filter((a) => a.active).length;
  const totalResponses = automations.reduce(
    (sum, a) => sum + (a.listener?.dmCount || 0) + (a.listener?.commentCount || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/10 rounded-xl">
            <Zap className="w-5 h-5 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Automations</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-zinc-500">
            <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
            <span className="text-sm">Loading automations...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-8 max-w-5xl mx-auto">
      {/* Main Content */}
      <div className="flex-grow flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 rounded-xl border border-violet-500/20">
              <Zap className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Automations</h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                {automations.length} automation{automations.length !== 1 ? "s" : ""} · {activeCount} active
              </p>
            </div>
          </div>
          <CreateAutomationButton />
        </div>

        {/* Stats bar */}
        {automations.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0e0e11] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 rounded-lg">
                <Zap className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{automations.length}</p>
                <p className="text-[11px] text-zinc-500 font-medium">Total</p>
              </div>
            </div>
            <div className="bg-[#0e0e11] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Activity className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{activeCount}</p>
                <p className="text-[11px] text-zinc-500 font-medium">Active</p>
              </div>
            </div>
            <div className="bg-[#0e0e11] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <MessageSquare className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{totalResponses}</p>
                <p className="text-[11px] text-zinc-500 font-medium">Responses</p>
              </div>
            </div>
          </div>
        )}

        {/* Automation List */}
        {automations.length === 0 ? (
          <div className="bg-[#0e0e11] border border-white/[0.06] rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-5">
            <div className="w-16 h-16 bg-violet-500/5 border border-violet-500/10 rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-violet-500/40" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No automations yet</h3>
              <p className="text-zinc-500 text-sm mt-1 max-w-sm">
                Create your first automation to start responding to Instagram DMs automatically.
              </p>
            </div>
            <CreateAutomationButton />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {automations.map((automation) => (
              <div
                key={automation.id}
                className="bg-[#0e0e11] border border-white/[0.06] rounded-2xl p-5 flex items-center justify-between group hover:border-white/[0.1] transition-all cursor-pointer"
                onClick={() => router.push(`/automations/${automation.id}`)}
              >
                <div className="flex items-center gap-4 flex-grow min-w-0">
                  {/* Status dot */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        automation.active
                          ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"
                          : "bg-zinc-700"
                      }`}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-2 min-w-0 flex-grow">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                        {automation.name}
                      </h3>
                      {automation.listener?.listener === "SMARTAI" && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-[10px] font-semibold text-violet-300">
                          <Sparkles className="w-3 h-3" />
                          AI
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                      {/* Triggers */}
                      <div className="flex items-center gap-1.5">
                        {automation.trigger.length > 0 ? (
                          automation.trigger.map((t) => {
                            const Icon = TRIGGER_ICONS[t.type]?.icon || Zap;
                            const color = TRIGGER_ICONS[t.type]?.color || "text-zinc-500";
                            return <Icon key={t.id} className={`w-3.5 h-3.5 ${color}`} />;
                          })
                        ) : (
                          <span className="italic text-zinc-600">No triggers</span>
                        )}
                      </div>
                      <span className="text-zinc-700">·</span>

                      {/* Keywords */}
                      <div className="flex items-center gap-1">
                        {automation.keywords.length > 0 ? (
                          <>
                            {automation.keywords.slice(0, 3).map((kw) => (
                              <span
                                key={kw.id}
                                className="px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 text-[10px] font-medium"
                              >
                                {kw.word}
                              </span>
                            ))}
                            {automation.keywords.length > 3 && (
                              <span className="text-zinc-600">+{automation.keywords.length - 3}</span>
                            )}
                          </>
                        ) : (
                          <span className="italic text-zinc-600">No keywords</span>
                        )}
                      </div>
                      <span className="text-zinc-700">·</span>

                      {/* Date */}
                      <div className="flex items-center gap-1 text-zinc-600">
                        <Clock className="w-3 h-3" />
                        {new Date(automation.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3 ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <AutomationToggle id={automation.id} active={automation.active} />
                  <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-[320px] flex-shrink-0 flex flex-col gap-4 hidden lg:flex">
        {/* Quick Start Guide */}
        <div className="bg-[#0e0e11] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Quick Start</h3>
          <div className="space-y-3">
            {[
              { step: "1", text: "Create an automation", done: automations.length > 0 },
              { step: "2", text: "Add triggers & keywords", done: automations.some((a) => a.trigger.length > 0) },
              { step: "3", text: "Set reply message", done: automations.some((a) => a.listener?.commentReply) },
              { step: "4", text: "Activate & test", done: automations.some((a) => a.active) },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                    item.done
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-white/5 text-zinc-600 border border-white/5"
                  }`}
                >
                  {item.done ? "✓" : item.step}
                </div>
                <span
                  className={`text-xs ${item.done ? "text-zinc-400 line-through" : "text-zinc-300"}`}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade Card */}
        <div className="bg-gradient-to-br from-violet-950/40 to-indigo-950/40 border border-violet-500/10 rounded-2xl p-6 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 blur-3xl" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-white">Upgrade to Pro</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Unlock Smart AI responses, unlimited keywords, and priority support.
          </p>
          <button className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-violet-600/20">
            Upgrade — $99.99/mo
          </button>
        </div>
      </div>
    </div>
  );
}
