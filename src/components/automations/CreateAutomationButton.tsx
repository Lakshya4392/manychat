"use client";

import { createAutomation } from "@/actions/automations";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <Button
        onClick={handleCreate}
        disabled={isPending}
        variant={variant}
        className={
          variant === "default"
            ? "bg-primary text-white hover:bg-primary/90"
            : "bg-white/5 hover:bg-white/10"
        }
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Automation
      </Button>

      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent className="bg-[#121215] border border-white/5">
          <DialogHeader>
            <DialogTitle className="text-white">Automation Limit Reached</DialogTitle>
            <DialogDescription className="text-zinc-500">
              You&apos;ve reached the maximum number of automations on the Free plan.
              Upgrade to Pro to create unlimited automations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowLimitModal(false)}
              className="bg-white/5 border-white/5"
            >
              Maybe Later
            </Button>
            <Button
              onClick={() => {
                setShowLimitModal(false);
                router.push("/profile?tab=billing");
              }}
              className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
            >
              Upgrade to Pro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
