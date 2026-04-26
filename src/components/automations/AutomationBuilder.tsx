"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Zap,
  MessageSquare,
  X,
  Sparkles,
  Edit3,
  Power,
  Check,
  Plus,
  Send,
  Bot,
  Hash,
  AlertCircle,
  Loader2,
  TestTube,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { addTrigger, createKeyword, deleteKeyword } from "@/actions/triggers";
import { updateListener } from "@/actions/listeners";
import { updateAutomation } from "@/actions/automations";
import Link from "next/link";

const TRIGGER_OPTIONS = [
  {
    value: "MESSAGE",
    label: "DM Received",
    desc: "Fires when someone sends a direct message",
    icon: MessageSquare,
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  {
    value: "COMMENT",
    label: "Post Comment",
    desc: "Fires when someone comments on a post",
    icon: Hash,
    color: "from-purple-500 to-pink-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
  },
  {
    value: "STORY_MENTION",
    label: "Story Mention",
    desc: "Fires when you're mentioned in a story",
    icon: Zap,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  {
    value: "NEW_FOLLOWER",
    label: "New Follower",
    desc: "Fires when someone follows your account",
    icon: Bot,
    color: "from-green-500 to-emerald-500",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
];

export default function AutomationBuilder({
  automation,
}: {
  automation: {
    id: string;
    name: string;
    active: boolean;
    keywords: { id: string; word: string }[];
    listener: {
      id: string;
      listener: "SMARTAI" | "MESSAGE";
      prompt?: string | null;
      commentReply?: string | null;
    } | null;
    trigger: { id: string; type: string }[];
  };
}) {
  const [name, setName] = useState(automation.name);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(
    automation.trigger.map((t) => t.type)
  );
  const [keywords, setKeywords] = useState<{ id: string; word: string }[]>(
    automation.keywords
  );
  const [newKeyword, setNewKeyword] = useState("");
  const [listenerType, setListenerType] = useState<"MESSAGE" | "SMARTAI">(
    automation.listener?.listener || "MESSAGE"
  );
  const [replyMessage, setReplyMessage] = useState(
    automation.listener?.commentReply || ""
  );
  const [aiPrompt, setAiPrompt] = useState(automation.listener?.prompt || "");
  const [active, setActive] = useState(automation.active);
  const [isSaving, setIsSaving] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const router = useRouter();

  // Save name on blur
  const handleNameBlur = useCallback(async () => {
    if (name !== automation.name) {
      await updateAutomation(automation.id, { name });
    }
  }, [name, automation.name, automation.id]);

  // Add keyword
  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;
    if (keywords.length >= 5) {
      toast.error("Maximum 5 keywords on Free plan");
      return;
    }

    const res = await createKeyword(automation.id, newKeyword.trim());
    if (res.status === 201 && res.data) {
      setKeywords([...keywords, res.data]);
      setNewKeyword("");
      toast.success("Keyword added");
    } else {
      toast.error(res.message || "Failed to add keyword");
    }
  };

  // Remove keyword
  const handleRemoveKeyword = async (keywordId: string) => {
    const res = await deleteKeyword(keywordId);
    if (res.status === 200) {
      setKeywords(keywords.filter((k) => k.id !== keywordId));
    } else {
      toast.error(res.message || "Failed to delete");
    }
  };

  // Save all — triggers + listener + name in one go
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Save name
      if (name !== automation.name) {
        await updateAutomation(automation.id, { name });
      }

      // Save triggers
      await addTrigger(automation.id, selectedTriggers);

      // Save listener
      await updateListener(automation.id, listenerType, aiPrompt, replyMessage);

      toast.success("Automation saved successfully!");
      router.refresh();
    } catch {
      toast.error("Failed to save automation");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle active
  const handleToggleActive = async () => {
    // Validate before activating
    if (!active) {
      if (selectedTriggers.length === 0) {
        toast.error("Add at least one trigger before activating");
        return;
      }
      if (listenerType === "MESSAGE" && !replyMessage.trim()) {
        toast.error("Set a reply message before activating");
        return;
      }
      if (keywords.length === 0) {
        toast.error("Add at least one keyword before activating");
        return;
      }
    }

    const newActive = !active;
    setActive(newActive);
    const res = await updateAutomation(automation.id, { active: newActive });
    if (res.status === 200) {
      toast.success(newActive ? "Automation activated!" : "Automation paused");
    } else {
      setActive(!newActive);
      toast.error("Failed to update status");
    }
  };

  // Test automation
  const handleTest = async () => {
    if (!testMessage.trim()) {
      toast.error("Enter a test message first");
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/webhook/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: testMessage }),
      });
      const data = await res.json();

      if (data.result?.triggered) {
        setTestResult(
          `✅ Automation triggered!\nResponse: "${data.result.response}"`
        );
      } else {
        setTestResult(
          `❌ Not triggered: ${data.result?.error || "No matching automation found"}`
        );
      }
    } catch {
      setTestResult("❌ Test failed — check server logs");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 max-w-4xl mx-auto w-full">
      {/* ─── Top Bar ─── */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-4">
          <Link
            href="/automations"
            className="p-2.5 bg-white/[0.03] hover:bg-white/[0.08] rounded-xl border border-white/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-400" />
          </Link>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              className="text-xl font-bold text-white bg-transparent border-none focus:outline-none w-64 px-0"
              placeholder="Untitled Automation"
            />
            <Edit3 className="w-3.5 h-3.5 text-zinc-600" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                active
                  ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"
                  : "bg-zinc-600"
              }`}
            />
            <span className="text-[11px] font-semibold text-zinc-400">
              {active ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Toggle Active */}
          <button
            onClick={handleToggleActive}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              active
                ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                : "bg-white/[0.03] text-zinc-400 border border-white/5 hover:bg-white/[0.08]"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {active ? "On" : "Off"}
          </button>

          {/* Save All */}
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {isSaving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      {/* ─── Builder Workspace ─── */}
      <div className="flex-grow overflow-y-auto pb-12">
        <div className="flex flex-col items-center gap-0">
          
          {/* ═══════════════════════════════════════ */}
          {/*  STEP 1: WHEN (Triggers)               */}
          {/* ═══════════════════════════════════════ */}
          <div className="w-full relative">
            <div className="absolute -left-0 top-8 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-violet-600/30">
                1
              </div>
            </div>

            <div className="ml-12 bg-[#0e0e11] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-bold text-white">When this happens...</h3>
                </div>
                <p className="text-xs text-zinc-500 mt-1 ml-6">Select trigger events for this automation</p>
              </div>

              <div className="p-6 grid grid-cols-2 gap-3">
                {TRIGGER_OPTIONS.map((option) => {
                  const isSelected = selectedTriggers.includes(option.value);
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTriggers(selectedTriggers.filter((t) => t !== option.value));
                        } else {
                          setSelectedTriggers([...selectedTriggers, option.value]);
                        }
                      }}
                      className={`relative p-4 rounded-xl border text-left transition-all group ${
                        isSelected
                          ? `${option.bg} ${option.border}`
                          : "bg-white/[0.02] border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${isSelected ? option.bg : "bg-white/5"}`}>
                            <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-zinc-500"}`} />
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${isSelected ? "text-white" : "text-zinc-300"}`}>
                              {option.label}
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">{option.desc}</p>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-gradient-to-br " + option.color + " border-transparent"
                              : "border-white/10"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Connector line */}
          <div className="ml-12 flex items-center py-1">
            <div className="w-px h-8 bg-gradient-to-b from-violet-600/40 to-indigo-600/40" />
          </div>

          {/* ═══════════════════════════════════════ */}
          {/*  STEP 2: FILTER (Keywords)              */}
          {/* ═══════════════════════════════════════ */}
          <div className="w-full relative">
            <div className="absolute -left-0 top-8 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-600/30">
                2
              </div>
            </div>

            <div className="ml-12 bg-[#0e0e11] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">If message contains...</h3>
                </div>
                <p className="text-xs text-zinc-500 mt-1 ml-6">Only trigger when these keywords are found</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                    placeholder="Type a keyword and press Enter..."
                    className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
                  />
                  <button
                    onClick={handleAddKeyword}
                    disabled={!newKeyword.trim()}
                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword) => (
                      <Badge
                        key={keyword.id}
                        className="rounded-lg px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-indigo-500/20 transition-colors"
                      >
                        <Hash className="w-3 h-3" />
                        {keyword.word}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveKeyword(keyword.id);
                          }}
                          className="ml-0.5 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-zinc-600 text-xs py-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>No keywords added — add at least one to filter messages</span>
                  </div>
                )}

                {keywords.length >= 5 && (
                  <p className="text-xs text-amber-400/70">
                    Keyword limit reached. Upgrade to Pro for more.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Connector line */}
          <div className="ml-12 flex items-center py-1">
            <div className="w-px h-8 bg-gradient-to-b from-indigo-600/40 to-emerald-600/40" />
          </div>

          {/* ═══════════════════════════════════════ */}
          {/*  STEP 3: THEN (Action / Response)       */}
          {/* ═══════════════════════════════════════ */}
          <div className="w-full relative">
            <div className="absolute -left-0 top-8 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-emerald-600/30">
                3
              </div>
            </div>

            <div className="ml-12 bg-[#0e0e11] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Then respond with...</h3>
                </div>
                <p className="text-xs text-zinc-500 mt-1 ml-6">Choose how to automatically reply</p>
              </div>

              <div className="p-6 space-y-5">
                {/* Response type toggle */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setListenerType("MESSAGE")}
                    className={`flex-1 p-4 rounded-xl border transition-all ${
                      listenerType === "MESSAGE"
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${listenerType === "MESSAGE" ? "bg-emerald-500/15" : "bg-white/5"}`}>
                        <MessageSquare className={`w-4 h-4 ${listenerType === "MESSAGE" ? "text-emerald-400" : "text-zinc-500"}`} />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-semibold ${listenerType === "MESSAGE" ? "text-white" : "text-zinc-400"}`}>
                          Static Reply
                        </p>
                        <p className="text-[11px] text-zinc-500">Send a fixed message every time</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setListenerType("SMARTAI")}
                    className={`flex-1 p-4 rounded-xl border transition-all ${
                      listenerType === "SMARTAI"
                        ? "bg-violet-500/10 border-violet-500/30"
                        : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${listenerType === "SMARTAI" ? "bg-violet-500/15" : "bg-white/5"}`}>
                        <Sparkles className={`w-4 h-4 ${listenerType === "SMARTAI" ? "text-violet-400" : "text-zinc-500"}`} />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-semibold ${listenerType === "SMARTAI" ? "text-white" : "text-zinc-400"}`}>
                          Smart AI
                        </p>
                        <p className="text-[11px] text-zinc-500">AI generates contextual replies</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Message / Prompt input */}
                {listenerType === "MESSAGE" ? (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Reply Message
                    </label>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Hi! Thanks for reaching out. We'll get back to you shortly..."
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-colors min-h-[120px] resize-none"
                    />
                    <p className="text-[11px] text-zinc-600">This exact message will be sent as a reply.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      AI Instructions
                    </label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="You are a friendly assistant for a clothing brand. Help customers with product questions, sizing, shipping and returns. Be casual and helpful..."
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40 transition-colors min-h-[150px] resize-none"
                    />
                    <p className="text-[11px] text-zinc-600">
                      The AI uses this as context to generate personalized responses.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Connector line */}
          <div className="ml-12 flex items-center py-1">
            <div className="w-px h-8 bg-gradient-to-b from-emerald-600/40 to-amber-600/40" />
          </div>

          {/* ═══════════════════════════════════════ */}
          {/*  STEP 4: TEST                           */}
          {/* ═══════════════════════════════════════ */}
          <div className="w-full relative">
            <div className="absolute -left-0 top-8 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-amber-600/30">
                4
              </div>
            </div>

            <div className="ml-12 bg-[#0e0e11] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Test your automation</h3>
                </div>
                <p className="text-xs text-zinc-500 mt-1 ml-6">Simulate a DM to see if your automation triggers correctly</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTest()}
                    placeholder="Type a simulated DM message..."
                    className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 transition-colors"
                  />
                  <button
                    onClick={handleTest}
                    disabled={isTesting || !testMessage.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-30"
                  >
                    {isTesting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Test
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-4 rounded-xl border text-sm font-mono whitespace-pre-wrap ${
                      testResult.startsWith("✅")
                        ? "bg-green-500/10 border-green-500/20 text-green-300"
                        : "bg-red-500/10 border-red-500/20 text-red-300"
                    }`}
                  >
                    {testResult}
                  </div>
                )}

                <p className="text-[11px] text-zinc-600">
                  💡 Tip: Make sure to save your automation first, then type a message containing one of your keywords.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
