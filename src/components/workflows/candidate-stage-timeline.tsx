"use client";

import { format } from "date-fns";
import { ArrowRight, Check, MoveRight, X, Zap } from "lucide-react";

import type { StageHistoryEntry } from "@/types/workflow";
import { cn } from "@/lib";

const actionConfig: Record<StageHistoryEntry["action"], { icon: typeof Check; color: string; label: string }> = {
  moved: { icon: MoveRight, color: "text-blue-500", label: "Moved" },
  approved: { icon: Check, color: "text-green-500", label: "Approved" },
  rejected: { icon: X, color: "text-red-500", label: "Rejected" },
  "auto-moved": { icon: Zap, color: "text-amber-500", label: "Auto-moved" },
};

interface CandidateStageTimelineProps {
  history: StageHistoryEntry[];
}

export function CandidateStageTimeline({ history }: CandidateStageTimelineProps) {
  const sorted = [...history].sort((a, b) => new Date(b.enteredAt).getTime() - new Date(a.enteredAt).getTime());

  if (sorted.length === 0) {
    return <p className="text-sm text-gray-400">No stage history yet.</p>;
  }

  return (
    <div className="relative space-y-0">
      {sorted.map((entry, index) => {
        const config = actionConfig[entry.action];
        const Icon = config.icon;
        const isLast = index === sorted.length - 1;

        return (
          <div key={`${entry.stageId}-${index}`} className="relative flex gap-x-3 pb-6">
            {!isLast && <div className="absolute top-6 left-[11px] h-full w-px bg-gray-200 dark:bg-neutral-700" />}
            <div
              className={cn(
                "relative z-10 grid size-6 shrink-0 place-items-center rounded-full border bg-white dark:bg-neutral-900",
                index === 0 ? "border-primary-500" : "border-gray-200 dark:border-neutral-700",
              )}
            >
              <Icon className={cn("size-3", config.color)} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-x-2">
                <span className="text-sm font-medium">{entry.stageName}</span>
                <span className={cn("text-xs", config.color)}>{config.label}</span>
              </div>
              <div className="flex items-center gap-x-2 text-xs text-gray-500">
                <span>by {entry.performedBy}</span>
                <span>{format(new Date(entry.enteredAt), "dd MMM yyyy, HH:mm")}</span>
              </div>
              {entry.notes && <p className="text-xs text-gray-400 italic">{entry.notes}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
