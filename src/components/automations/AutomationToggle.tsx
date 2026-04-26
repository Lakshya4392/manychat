"use client";

import { Switch } from "@/components/ui/switch";
import { updateAutomation } from "@/actions/automations";
import { useTransition } from "react";
import { toast } from "sonner";

export default function AutomationToggle({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (checked: boolean) => {
    startTransition(async () => {
      const result = await updateAutomation(id, { active: checked });
      if (result.status !== 200) {
        toast.error("Failed to update automation");
      }
    });
  };

  return (
    <Switch
      checked={active}
      onCheckedChange={handleToggle}
      disabled={isPending}
      className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-white/10"
    />
  );
}
