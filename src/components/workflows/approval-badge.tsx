import type { ApprovalStatus } from "@/types/workflow";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib";

const statusConfig: Record<ApprovalStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending Approval",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  },
};

interface ApprovalBadgeProps {
  status: ApprovalStatus | undefined;
  className?: string;
}

export function ApprovalBadge({ status, className }: ApprovalBadgeProps) {
  if (!status) return null;
  const config = statusConfig[status];

  return <Badge className={cn("text-xs", config.className, className)}>{config.label}</Badge>;
}
