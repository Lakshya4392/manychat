"use client";

import { createAutomation } from "@/actions/automations";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function CreateAutomationButton({ variant = "default" }: { variant?: "default" | "outline" }) {
  const [isPending, startTransition] = useTransition();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    startTransition(async () => {
      const result = await createAutomation();

      if (result.status === 201 && result.data && "id" in result.data) {
        toast.success("Automation created");
        router.push(`/automations/${result.data.id}`);
      } else if (result.status === 403) {
        // Limit reached
        setShowLimitModal(true);
      } else {
        toast.error(result.message || "Failed to create automation");
      }
    });
  };

  return (
    <>
      <button
        onClick={handleCreate}
        disabled={isPending}
        className={
          variant === "default"
            ? "flex items-center justify-center gap-[8px] px-[24px] py-[12px] bg-ink-black text-white hover:bg-ink-black/90 active:scale-95 rounded-xl font-semibold text-[13px] transition-all shadow-sm disabled:opacity-50"
            : "flex items-center justify-center gap-[8px] px-[24px] py-[12px] bg-white border border-ink-black/5 text-ink-black hover:bg-canvas active:scale-95 rounded-xl font-semibold text-[13px] transition-all shadow-sm disabled:opacity-50"
        }
      >
        <Plus size={16} />
        Create Automation
      </button>

      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent className="bg-white border border-ink-black/5 shadow-xl rounded-2xl sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-ink-black tracking-tight">Automation Limit Reached</DialogTitle>
            <DialogDescription className="text-[14px] text-slate font-medium leading-relaxed">
              You&apos;ve reached the maximum number of automations on the Free plan.
              Upgrade to Pro to create unlimited automations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-[12px] sm:gap-0 mt-[16px]">
            <button
              onClick={() => setShowLimitModal(false)}
              className="px-[20px] py-[10px] rounded-xl bg-white border border-ink-black/5 text-ink-black font-medium text-[13px] hover:bg-canvas transition-all"
            >
              Maybe Later
            </button>
            <button
              onClick={() => {
                setShowLimitModal(false);
                router.push("/profile?tab=billing");
              }}
              className="px-[20px] py-[10px] rounded-xl bg-ink-black text-white font-semibold text-[13px] hover:bg-ink-black/90 shadow-sm transition-all"
            >
              Upgrade to Pro
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
