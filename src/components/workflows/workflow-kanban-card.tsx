"use client";

import { format } from "date-fns";
import { Eye, Mail, MoreVertical } from "lucide-react";
import Link from "next/link";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { Candidate } from "@/types/workflow";
import { ApprovalBadge } from "./approval-badge";
import { getInitials } from "@/lib";

interface WorkflowKanbanCardProps {
  candidate: Candidate;
}

export function WorkflowKanbanCard({ candidate }: WorkflowKanbanCardProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-x-2">
          <Avatar className="size-7">
            <AvatarImage src={candidate.avatar} alt={candidate.name} />
            <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{candidate.name}</p>
            <div className="flex items-center gap-x-1 text-xs text-gray-500">
              <Mail className="size-3" />
              <span className="w-36 truncate lowercase">{candidate.email.toLowerCase()}</span>
            </div>
          </div>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="grid size-5 place-items-center">
              <MoreVertical className="size-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-36 p-1">
            <Link
              href={`/candidates/${candidate.id}`}
              className="flex w-full items-center gap-x-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
            >
              <Eye className="size-3.5 text-gray-500" />
              View Details
            </Link>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{format(new Date(candidate.appliedAt), "dd MMM yyyy")}</span>
        <div className="flex items-center gap-x-1">
          {candidate.rating && (
            <span className="text-xs text-amber-400">
              {"★".repeat(candidate.rating)}
              <span className="text-gray-200 dark:text-neutral-700">{"★".repeat(5 - candidate.rating)}</span>
            </span>
          )}
        </div>
      </div>

      {candidate.approvalStatus && <ApprovalBadge status={candidate.approvalStatus} />}
    </div>
  );
}
