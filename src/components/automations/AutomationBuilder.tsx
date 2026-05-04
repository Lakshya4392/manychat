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
  Monitor,
  MousePointerClick,
  TrendingUp,
  Brain,
} from "lucide-react";
import { addTrigger, createKeyword, deleteKeyword } from "@/actions/triggers";
import { updateListener } from "@/actions/listeners";
import { updateAutomation } from "@/actions/automations";
import Link from "next/link";
import PostSelector from "./PostSelector";

const TRIGGER_OPTIONS = [
  {
    value: "MESSAGE",
    label: "Direct Message",
    desc: "When someone engages with your inbox",
    icon: MessageSquare,
  },
  {
    value: "COMMENT",
    label: "Post Comment",
    desc: "When people engage with your content",
    icon: Hash,
  },
  {
    value: "STORY_MENTION",
    label: "Story Mention",
    desc: "When fans tag you in their stories",
    icon: Zap,
  },
  {
    value: "NEW_FOLLOWER",
    label: "New Follower",
    desc: "Welcome every new fan automatically",
    icon: Bot,
  },
];

const PERSONAS = [
  { id: "CUSTOM", label: "Custom Persona", desc: "Build your own prompt from scratch", icon: Edit3 },
  { id: "CASUAL", label: "Casual Friend", desc: "Friendly, casual, uses emojis & slang", icon: MessageSquare },
  { id: "PROFESSIONAL", label: "Pro Expert", desc: "Always formal, precise, and helpful", icon: Monitor },
  { id: "SALES", label: "Sales Agent", desc: "Conversion focused, persuasive tone", icon: TrendingUp },
  { id: "SUPPORT", label: "Help Desk", desc: "Concise problem solver, technical", icon: AlertCircle },
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
      persona?: any;
    } | null;
    trigger: { id: string; type: string }[];
    posts: any[];
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
  const [persona, setPersona] = useState<any>(
    (automation.listener as any)?.persona || "CUSTOM"
  );
  const [active, setActive] = useState(automation.active);
  const [isSemantic, setIsSemantic] = useState(automation.isSemantic || false);
  const [isSaving, setIsSaving] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const router = useRouter();

  const handleNameBlur = useCallback(async () => {
    if (name !== automation.name) {
      await updateAutomation(automation.id, { name });
    }
  }, [name, automation.name, automation.id]);

  const handleToggleSemantic = async () => {
    const newVal = !isSemantic;
    setIsSemantic(newVal);
    const res = await updateAutomation(automation.id, { isSemantic: newVal });
    if (res.status === 200) {
        toast.success(newVal ? "Semantic AI Activated" : "Keyword Mode Only");
    } else {
        setIsSemantic(!newVal);
    }
  };

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

  const handleRemoveKeyword = async (keywordId: string) => {
    const res = await deleteKeyword(keywordId);
    if (res.status === 200) {
      setKeywords(keywords.filter((k) => k.id !== keywordId));
    } else {
      toast.error(res.message || "Failed to delete");
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      if (name !== automation.name) {
        await updateAutomation(automation.id, { name });
      }
      await addTrigger(automation.id, selectedTriggers);
      await updateListener(automation.id, listenerType, aiPrompt, replyMessage, persona);
      toast.success("Flow saved successfully!");
      router.refresh();
    } catch {
      toast.error("Failed to save flow");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!active) {
      if (selectedTriggers.length === 0) {
        toast.error("Add at least one trigger before activating");
        return;
      }
      if (listenerType === "MESSAGE" && !replyMessage.trim()) {
        toast.error("Set a reply message before activating");
        return;
      }
      if (keywords.length === 0 && !isSemantic) {
        toast.error("Add keywords or enable Semantic AI before activating");
        return;
      }
    }

    const newActive = !active;
    setActive(newActive);
    const res = await updateAutomation(automation.id, { active: newActive });
    if (res.status === 200) {
      toast.success(newActive ? "Engine Started!" : "Engine Paused");
    } else {
      setActive(!newActive);
      toast.error("Failed to update status");
    }
  };

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
          `✅ SUCCESS: Automation triggered!\nResponse Sent: "${data.result.response}"`
        );
      } else {
        setTestResult(
          `❌ FAILED: ${data.result?.error || "No matching automation found"}`
        );
      }
    } catch {
      setTestResult("❌ FATAL: Test failed — check server logs");
    } finally {
      setIsTesting(false);
    }
  };

  // Progressive Disclosure Logic
  const step1Done = selectedTriggers.length > 0;
  const step2Done = step1Done && (keywords.length > 0 || isSemantic);
  const step3Done = step1Done && (listenerType === "MESSAGE" ? replyMessage.trim().length > 0 : aiPrompt.trim().length > 0);

  return (
    <div className="flex flex-col h-full gap-10 max-w-7xl mx-auto w-full pb-20 px-4 sm:px-8">
      {/* ─── Top Navigation Bar ─── */}
      <div className="flex items-center justify-between py-[24px] sticky top-0 bg-canvas/90 backdrop-blur-xl z-50 px-[24px] border-b border-ink-black/5 -mx-[16px] sm:-mx-[32px]">
        <div className="flex items-center gap-[24px]">
          <Link
            href="/automations"
            className="group flex items-center justify-center w-[40px] h-[40px] bg-white hover:bg-canvas rounded-xl border border-ink-black/5 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft size={18} className="text-slate group-hover:text-ink-black transition-colors" />
          </Link>
          <div className="flex flex-col gap-[4px]">
            <div className="flex items-center gap-[8px] group/title">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
                className="text-2xl font-semibold text-ink-black bg-transparent border-none focus:outline-none w-fit min-w-[200px] px-0 tracking-tight placeholder:text-slate/40"
                placeholder="Name Your Flow..."
              />
              <Edit3 size={16} className="text-slate opacity-0 group-hover/title:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-center gap-[8px]">
                <div className={`w-[6px] h-[6px] rounded-full ${active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" : "bg-slate/40"}`} />
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate leading-none">
                    {active ? "Live Engine Active" : "Draft Status"}
                </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-[16px]">
          <div className="flex bg-white p-[4px] rounded-xl border border-ink-black/5 shadow-sm">
             <button 
                onClick={handleToggleActive}
                className={`flex items-center gap-[6px] px-[16px] py-[8px] rounded-lg text-[11px] font-medium uppercase tracking-wider transition-all ${
                    active 
                    ? "bg-ink-black text-white shadow-sm" 
                    : "text-slate hover:text-ink-black hover:bg-canvas"
                }`}
             >
                <Power size={14} />
                {active ? "Live" : "Paused"}
             </button>
             <button 
                className={`flex items-center gap-[6px] px-[16px] py-[8px] rounded-lg text-[11px] font-medium uppercase tracking-wider transition-all text-slate hover:text-ink-black hover:bg-canvas`}
             >
                Development
             </button>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-[8px] px-[24px] py-[12px] bg-white text-ink-black border border-ink-black/5 hover:border-ink-black/10 hover:shadow-md rounded-xl font-semibold text-[13px] transition-all disabled:opacity-50 active:scale-95 shadow-sm"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Flow
          </button>
        </div>
      </div>

      {/* ─── Builder Canvas ─── */}
      <div className="flex flex-col gap-0 max-w-4xl mx-auto w-full relative pt-[40px]">
        <div className="absolute left-[15px] top-[80px] bottom-[80px] w-[2px] bg-ink-black/5 hidden sm:block" />

        {/* ═══════════════════════════════════════ */}
        {/*  STEP 1: TRIGGER SECTION                */}
        {/* ═══════════════════════════════════════ */}
        <div className="flex gap-[32px] items-start relative mb-[48px]">
           <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center font-bold text-[12px] z-10 shrink-0 transition-all duration-500 bg-white hidden sm:flex ${step1Done ? "border-2 border-ink-black text-ink-black shadow-sm" : "border border-ink-black/20 text-slate"}`}>
              1
           </div>
           
           <div className={`flex-grow bg-white border transition-all duration-500 rounded-2xl overflow-hidden relative ${step1Done ? "border-ink-black/10 shadow-md" : "border-ink-black/5 shadow-sm"}`}>
              <div className="px-[32px] py-[24px] border-b border-ink-black/5 flex items-center justify-between bg-white">
                 <div className="flex items-center gap-[16px]">
                    <div className={`w-[40px] h-[40px] rounded-xl flex items-center justify-center transition-colors ${step1Done ? "bg-ink-black text-white shadow-sm" : "bg-canvas border border-ink-black/5 text-slate"}`}>
                        <Monitor size={20} />
                    </div>
                    <div>
                        <h3 className="text-[16px] font-semibold text-ink-black tracking-tight">Trigger Event</h3>
                        <p className="text-[11px] font-medium text-slate uppercase tracking-wider mt-[4px]">When should this flow run?</p>
                    </div>
                 </div>
              </div>

              <div className="p-[32px] grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
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
                       className={`group relative p-[24px] rounded-2xl border text-left transition-all duration-300 ${
                         isSelected
                           ? `bg-white border-ink-black/20 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] ring-1 ring-ink-black/5`
                           : "bg-white border-ink-black/5 hover:border-ink-black/10 hover:shadow-sm"
                       }`}
                     >
                       <div className="flex flex-col gap-[16px]">
                          <div className={`w-[40px] h-[40px] rounded-xl flex items-center justify-center transition-all ${
                            isSelected ? "bg-ink-black text-white shadow-sm scale-105" : "bg-canvas border border-ink-black/5 text-slate group-hover:scale-105"
                          }`}>
                            <Icon size={20} />
                          </div>
                          
                          <div>
                             <p className={`text-[14px] font-semibold tracking-tight ${isSelected ? "text-ink-black" : "text-slate group-hover:text-ink-black transition-colors"}`}>
                               {option.label}
                             </p>
                             <p className="text-[12px] text-slate/70 mt-[4px] leading-relaxed">{option.desc}</p>
                          </div>
                          
                          <div className={`absolute top-[24px] right-[24px] w-[20px] h-[20px] rounded-full border flex items-center justify-center transition-all ${
                            isSelected ? "bg-ink-black border-ink-black scale-110" : "border-ink-black/10 bg-canvas"
                          }`}>
                             {isSelected && <Check size={12} className="text-white stroke-[3px]" />}
                          </div>
                       </div>
                     </button>
                   );
                 })}
              </div>

              {/* Post Selection UI */}
              {selectedTriggers.includes("COMMENT") && (
                <div className="px-[32px] pb-[32px] animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="pt-[24px] border-t border-ink-black/5">
                        <PostSelector automationId={automation.id} initialPosts={automation.posts} />
                    </div>
                </div>
              )}
           </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/*  STEP 2: KEYWORDS SECTION              */}
        {/* ═══════════════════════════════════════ */}
        <div className={`gap-[32px] items-start relative mb-[48px] ${!step1Done ? "hidden" : "flex animate-in fade-in slide-in-from-bottom-8 duration-700"}`}>
           <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center font-bold text-[12px] z-10 shrink-0 transition-all duration-500 bg-white hidden sm:flex ${!step1Done ? "border border-ink-black/10 text-slate/40" : step2Done ? "border-2 border-ink-black text-ink-black shadow-sm" : "border border-ink-black/20 text-slate"}`}>
              2
           </div>

           <div className={`flex-grow bg-white border transition-all duration-500 rounded-2xl overflow-hidden relative ${step2Done ? "border-ink-black/10 shadow-md" : "border-ink-black/5 shadow-sm"}`}>
              <div className="px-[32px] py-[24px] border-b border-ink-black/5 flex items-center justify-between bg-white">
                 <div className="flex items-center gap-[16px]">
                    <div className={`w-[40px] h-[40px] rounded-xl flex items-center justify-center transition-colors ${!step1Done ? "bg-canvas border border-ink-black/5 text-slate/50" : step2Done ? "bg-ink-black text-white shadow-sm" : "bg-canvas border border-ink-black/5 text-slate"}`}>
                        <Hash size={20} />
                    </div>
                    <div>
                        <h3 className="text-[16px] font-semibold text-ink-black tracking-tight">Content Filter</h3>
                        <p className="text-[11px] font-medium text-slate uppercase tracking-wider mt-[4px]">Specify keywords or use Semantic AI</p>
                    </div>
                 </div>

                 {/* Semantic Toggle */}
                 <button 
                    onClick={handleToggleSemantic}
                    className={`flex items-center gap-[12px] px-[16px] py-[8px] rounded-lg border transition-all ${
                        isSemantic 
                        ? "bg-ink-black/5 border-ink-black/20 text-ink-black shadow-sm" 
                        : "bg-white border-ink-black/5 text-slate hover:text-ink-black hover:border-ink-black/10"
                    }`}
                 >
                    <Brain size={14} className={`${isSemantic ? "animate-pulse" : ""}`} />
                    <span className="text-[11px] font-medium uppercase tracking-wider">Semantic Match</span>
                    <div className={`w-[28px] h-[14px] rounded-full relative transition-all ${isSemantic ? "bg-ink-black" : "bg-slate/30"}`}>
                        <div className={`absolute top-[2px] w-[10px] h-[10px] rounded-full bg-white transition-all shadow-sm ${isSemantic ? "right-[2px]" : "left-[2px]"}`} />
                    </div>
                 </button>
              </div>

              <div className="p-[32px] space-y-[24px]">
                 <div className="relative group">
                    <input
                        type="text"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                        placeholder="Type a keyword and press Enter..."
                        className="w-full bg-canvas border border-ink-black/5 rounded-xl px-[24px] py-[16px] text-[14px] text-ink-black placeholder:text-slate/50 focus:outline-none focus:border-ink-black/20 focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,0,0,0.02)] transition-all pr-[60px]"
                    />
                    <button
                        onClick={handleAddKeyword}
                        disabled={!newKeyword.trim()}
                        className="absolute right-[8px] top-[8px] h-[36px] w-[36px] bg-white border border-ink-black/5 text-ink-black hover:bg-canvas rounded-lg flex items-center justify-center transition-all disabled:opacity-0 active:scale-95 shadow-sm"
                    >
                        <Plus size={16} />
                    </button>
                 </div>

                 <div className="flex flex-wrap gap-[12px]">
                    {keywords.length > 0 ? (
                      keywords.map((keyword) => (
                        <div
                          key={keyword.id}
                          className="px-[16px] py-[8px] rounded-lg bg-white border border-ink-black/5 text-ink-black text-[13px] font-medium flex items-center gap-[12px] hover:border-ink-black/10 hover:shadow-sm transition-all"
                        >
                          <span className="text-slate font-bold">#</span>
                          {keyword.word}
                          <button onClick={() => handleRemoveKeyword(keyword.id)} className="p-[4px] text-slate hover:text-red-500 transition-colors ml-[4px]">
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-[12px] text-slate bg-canvas border border-dashed border-ink-black/10 rounded-xl px-[24px] py-[20px] w-full justify-center">
                        <AlertCircle size={16} className="opacity-50" />
                        <span className="text-[12px] font-medium uppercase tracking-wider leading-none">
                            {isSemantic ? "Semantic AI Active — No keywords needed" : "Universal Listener — Triggers on any message"}
                        </span>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/*  STEP 3: ACTION SECTION                */}
        {/* ═══════════════════════════════════════ */}
        <div className={`gap-[32px] items-start relative mb-[48px] ${!step2Done ? "hidden" : "flex animate-in fade-in slide-in-from-bottom-8 duration-700"}`}>
           <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center font-bold text-[12px] z-10 shrink-0 transition-all duration-500 bg-white hidden sm:flex ${!step2Done ? "border border-ink-black/10 text-slate/40" : step3Done ? "border-2 border-ink-black text-ink-black shadow-sm" : "border border-ink-black/20 text-slate"}`}>
              3
           </div>

           <div className={`flex-grow bg-white border transition-all duration-500 rounded-2xl overflow-hidden relative ${step3Done ? "border-ink-black/10 shadow-md" : "border-ink-black/5 shadow-sm"}`}>
              <div className="px-[32px] py-[24px] border-b border-ink-black/5 flex items-center justify-between bg-white">
                 <div className="flex items-center gap-[16px]">
                    <div className={`w-[40px] h-[40px] rounded-xl flex items-center justify-center transition-colors ${!step2Done ? "bg-canvas border border-ink-black/5 text-slate/50" : step3Done ? "bg-ink-black text-white shadow-sm" : "bg-canvas border border-ink-black/5 text-slate"}`}>
                        <MousePointerClick size={20} />
                    </div>
                    <div>
                        <h3 className="text-[16px] font-semibold text-ink-black tracking-tight">Response Strategy</h3>
                        <p className="text-[11px] font-medium text-slate uppercase tracking-wider mt-[4px]">Configure the automation payload</p>
                    </div>
                 </div>
              </div>

              <div className="p-[32px] space-y-[32px]">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                    <button
                        onClick={() => setListenerType("MESSAGE")}
                        className={`flex flex-col gap-[16px] p-[24px] rounded-2xl border transition-all text-left group ${
                        listenerType === "MESSAGE"
                            ? "bg-white border-ink-black/20 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] ring-1 ring-ink-black/5"
                            : "bg-white border-ink-black/5 hover:border-ink-black/10 hover:shadow-sm"
                        }`}
                    >
                        <div className={`w-[40px] h-[40px] rounded-xl flex items-center justify-center transition-all ${listenerType === "MESSAGE" ? "bg-ink-black text-white shadow-sm scale-105" : "bg-canvas border border-ink-black/5 text-slate group-hover:scale-105"}`}>
                            <MessageSquare size={20} />
                        </div>
                        <div>
                           <p className={`text-[14px] font-semibold tracking-tight ${listenerType === "MESSAGE" ? "text-ink-black" : "text-slate group-hover:text-ink-black transition-colors"}`}>Static Message</p>
                           <p className="text-[12px] text-slate/70 mt-[4px] leading-relaxed">Send a fixed predetermined text</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setListenerType("SMARTAI")}
                        className={`flex flex-col gap-[16px] p-[24px] rounded-2xl border transition-all text-left group ${
                        listenerType === "SMARTAI"
                            ? "bg-white border-ink-black/20 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] ring-1 ring-ink-black/5"
                            : "bg-white border-ink-black/5 hover:border-ink-black/10 hover:shadow-sm"
                        }`}
                    >
                        <div className={`w-[40px] h-[40px] rounded-xl flex items-center justify-center transition-all ${listenerType === "SMARTAI" ? "bg-ink-black text-white shadow-sm scale-105" : "bg-canvas border border-ink-black/5 text-slate group-hover:scale-105"}`}>
                            <Brain size={20} />
                        </div>
                        <div>
                           <p className={`text-[14px] font-semibold tracking-tight ${listenerType === "SMARTAI" ? "text-ink-black" : "text-slate group-hover:text-ink-black transition-colors"}`}>AI Intelligence</p>
                           <p className="text-[12px] text-slate/70 mt-[4px] leading-relaxed">Dynamically generate responses</p>
                        </div>
                    </button>
                 </div>

                 {listenerType === "SMARTAI" && (
                    <div className="space-y-[16px] animate-in fade-in slide-in-from-top-4 duration-500">
                        <label className="text-[11px] font-medium text-slate uppercase tracking-wider ml-[8px]"> AI Personality Profile </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[12px]">
                            {PERSONAS.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setPersona(p.id)}
                                    className={`p-[16px] rounded-xl border text-left transition-all ${
                                        persona === p.id 
                                        ? "bg-white border-ink-black/20 shadow-sm ring-1 ring-ink-black/5" 
                                        : "bg-canvas border-ink-black/5 hover:border-ink-black/10 hover:bg-white"
                                    }`}
                                >
                                    <p className={`text-[12px] font-semibold tracking-tight ${persona === p.id ? "text-ink-black" : "text-slate"}`}>{p.label}</p>
                                    <p className={`text-[11px] font-medium leading-relaxed mt-[4px] ${persona === p.id ? "text-slate/80" : "text-slate/60"}`}>{p.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                 )}

                 <div className="space-y-[16px]">
                    <label className="text-[11px] font-medium text-slate uppercase tracking-wider ml-[8px]"> Implementation Payload </label>
                    <textarea
                        value={listenerType === "MESSAGE" ? replyMessage : aiPrompt}
                        onChange={(e) => listenerType === "MESSAGE" ? setReplyMessage(e.target.value) : setAiPrompt(e.target.value)}
                        placeholder={listenerType === "MESSAGE" ? "Enter the exact message to send to the user..." : "Provide instructions or knowledge for the AI to use..."}
                        className="w-full bg-canvas border border-ink-black/5 rounded-2xl p-[24px] text-[14px] text-ink-black focus:outline-none focus:border-ink-black/20 focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,0,0,0.02)] min-h-[160px] resize-y placeholder:text-slate/50 transition-all"
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/*  STEP 4: TEST SECTION                  */}
        {/* ═══════════════════════════════════════ */}
        <div className={`gap-[32px] items-start relative ${!step3Done ? "hidden" : "flex animate-in fade-in slide-in-from-bottom-8 duration-700"}`}>
           <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center font-bold text-[12px] z-10 shrink-0 transition-all duration-500 bg-white hidden sm:flex ${!step3Done ? "border border-ink-black/10 text-slate/40" : "border-2 border-ink-black text-ink-black shadow-sm"}`}>
              4
           </div>

           <div className="flex-grow bg-white border border-ink-black/5 rounded-2xl overflow-hidden shadow-sm relative mb-[80px]">
              <div className="px-[32px] py-[24px] border-b border-ink-black/5 flex items-center justify-between bg-white">
                 <div className="flex items-center gap-[16px]">
                    <div className="w-[40px] h-[40px] bg-canvas border border-ink-black/5 rounded-xl text-slate flex items-center justify-center">
                        <TestTube size={20} />
                    </div>
                    <div>
                        <h3 className="text-[16px] font-semibold text-ink-black tracking-tight">Test Sandbox</h3>
                        <p className="text-[11px] font-medium text-slate uppercase tracking-wider mt-[4px]">Verify flow logic</p>
                    </div>
                 </div>
              </div>

              <div className="p-[32px] space-y-[24px]">
                 <div className="flex gap-[16px]">
                    <input
                        type="text"
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleTest()}
                        placeholder="Simulate an incoming message..."
                        className="flex-1 bg-canvas border border-ink-black/5 rounded-xl px-[24px] py-[16px] text-[14px] text-ink-black focus:outline-none focus:border-ink-black/20 focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate/50"
                    />
                    <button
                        onClick={handleTest}
                        disabled={isTesting || !testMessage.trim()}
                        className="flex items-center gap-[12px] px-[32px] bg-white border border-ink-black/5 hover:border-ink-black/10 hover:shadow-md hover:bg-canvas text-ink-black rounded-xl text-[12px] font-semibold transition-all shadow-sm disabled:opacity-50"
                    >
                        {isTesting ? <Loader2 size={16} className="animate-spin" /> : "Run Test"}
                    </button>
                 </div>

                 {testResult && (
                   <div className="p-[24px] rounded-[1rem] bg-canvas border border-ink-black/10 font-mono text-sm">
                      <div className={`text-[10px] font-black uppercase tracking-widest mb-[12px] ${testResult.startsWith("✅") ? "text-emerald-600" : "text-red-600"}`}>Result Output</div>
                      <div className="text-ink-black leading-relaxed">{testResult}</div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
