import { Eye, LucideIcon, MoreVertical, SquarePen, Trash } from "lucide-react";
import { format } from "date-fns";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, fromSnakeCase } from "@/lib";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
}

const statusVariants: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  COMPLETED: "bg-green-100 text-green-800",
  PAID: "bg-green-100 text-green-800",
  PUBLISHED: "bg-green-100 text-green-800",
  SENT: "bg-green-100 text-green-800",
  GRADED: "bg-green-100 text-green-800",
  ENROLLED: "bg-green-100 text-green-800",
  ADMITTED: "bg-green-100 text-green-800",
  LIVE: "bg-green-100 text-green-800",
  SUBMITTED: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  DRAFT: "bg-yellow-100 text-yellow-800",
  SCHEDULED: "bg-yellow-100 text-yellow-800",
  REVIEWING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  SENDING: "bg-yellow-100 text-yellow-800",
  PAYMENT_OVERDUE: "bg-yellow-100 text-yellow-800",
  OVERDUE: "bg-yellow-100 text-yellow-800",
  ON_LEAVE: "bg-yellow-100 text-yellow-800",
  LATE: "bg-yellow-100 text-yellow-800",
  INACTIVE: "bg-red-100 text-red-800",
  SUSPENDED: "bg-red-100 text-red-800",
  CANCELLED: "bg-red-100 text-red-800",
  FAILED: "bg-red-100 text-red-800",
  EXPELLED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-red-100 text-red-800",
  VOIDED: "bg-red-100 text-red-800",
  DISPUTED: "bg-red-100 text-red-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
  ENDED: "bg-gray-100 text-gray-800",
  GRADUATED: "bg-blue-100 text-blue-800",
  ONBOARDED: "bg-blue-100 text-blue-800",
  NOT_STARTED: "bg-gray-100 text-gray-800",
  TRANSFERRED: "bg-blue-100 text-blue-800",
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const variant = statusVariants[status] || "bg-gray-100 text-gray-800";
  const displayStatus = fromSnakeCase(status);

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", variant)}>
      {displayStatus.toLowerCase()}
    </span>
  );
};

interface DateCellProps {
  date: Date | string | undefined | null;
  formatStr?: string;
  fallback?: string;
}

export const DateCell = ({ date, formatStr = "dd/MM/yyyy", fallback = "N/A" }: DateCellProps) => {
  if (!date) return <span className="text-gray-400">{fallback}</span>;
  return <span>{format(new Date(date), formatStr)}</span>;
};

export const DateTimeCell = ({ date, fallback = "N/A" }: DateCellProps) => {
  if (!date) return <span className="text-gray-400">{fallback}</span>;
  return <span>{format(new Date(date), "dd/MM/yyyy HH:mm")}</span>;
};

interface ActionItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "danger";
}

interface ActionCellProps {
  actions: ActionItem[];
}

export const ActionCell = ({ actions }: ActionCellProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost">
          <MoreVertical className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1">
        {actions.map((action, index) =>
          action.href ? (
            <a
              key={index}
              href={action.href}
              className={cn(
                "flex w-full items-center gap-x-2 rounded-md px-2.5 py-2 text-xs hover:bg-gray-200",
                action.variant === "danger" && "text-red-600 hover:bg-red-50",
              )}
            >
              <action.icon className="size-4" />
              <span>{action.label}</span>
            </a>
          ) : (
            <button
              key={index}
              onClick={action.onClick}
              className={cn(
                "flex w-full items-center gap-x-2 rounded-md px-2.5 py-2 text-xs hover:bg-gray-200",
                action.variant === "danger" && "text-red-600 hover:bg-red-50",
              )}
            >
              <action.icon className="size-4" />
              <span>{action.label}</span>
            </button>
          ),
        )}
      </PopoverContent>
    </Popover>
  );
};

interface CurrencyCellProps {
  amount: number;
  currency?: string;
}

export const CurrencyCell = ({ amount, currency = "NGN" }: CurrencyCellProps) => {
  return (
    <span>
      {new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
      }).format(amount)}
    </span>
  );
};

interface UserAvatarCellProps {
  name: string;
  email?: string;
  avatar?: string;
}

export const UserAvatarCell = ({ name, email, avatar }: UserAvatarCellProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-x-3">
      <Avatar className="size-8">
        <AvatarImage src={avatar} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{name}</span>
        {email && <span className="text-xs text-gray-500">{email}</span>}
      </div>
    </div>
  );
};

interface PercentageCellProps {
  value: number;
  showBar?: boolean;
}

export const PercentageCell = ({ value, showBar = false }: PercentageCellProps) => {
  const color = value >= 70 ? "bg-green-500" : value >= 50 ? "bg-yellow-500" : "bg-red-500";

  if (showBar) {
    return (
      <div className="flex items-center gap-x-2">
        <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200">
          <div className={cn("h-full", color)} style={{ width: `${Math.min(value, 100)}%` }} />
        </div>
        <span className="text-xs">{value.toFixed(1)}%</span>
      </div>
    );
  }

  return <span>{value.toFixed(1)}%</span>;
};

export const ActionIcons = {
  View: Eye,
  Edit: SquarePen,
  Delete: Trash,
};
