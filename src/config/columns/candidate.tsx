"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ApprovalBadge } from "@/components/workflows/approval-badge";
import type { Candidate, WorkflowTemplate } from "@/types/workflow";
import { getInitials } from "@/lib";

export function createCandidateColumns(workflows: WorkflowTemplate[]): ColumnDef<Candidate>[] {
  return [
    {
      accessorKey: "name",
      header: "Candidate",
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          <Avatar className="size-7">
            <AvatarImage src={row.original.avatar} alt={row.original.name} />
            <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{row.original.name}</span>
            <span className="text-xs text-gray-500 lowercase">{row.original.email.toLowerCase()}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "currentStageId",
      header: "Current Stage",
      cell: ({ row }) => {
        const workflow = workflows.find((w) => w.id === row.original.workflowId);
        const stage = workflow?.stages.find((s) => s.id === row.original.currentStageId);
        return (
          <div className="flex items-center gap-x-1.5">
            {stage && <span className="size-2.5 rounded-full" style={{ backgroundColor: stage.color }} />}
            <span className="text-sm">{stage?.title ?? row.original.currentStageId}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "workflowId",
      header: "Workflow",
      cell: ({ row }) => {
        const workflow = workflows.find((w) => w.id === row.original.workflowId);
        return <span className="text-sm text-gray-600 dark:text-gray-400">{workflow?.name ?? "—"}</span>;
      },
    },
    {
      accessorKey: "approvalStatus",
      header: "Approval",
      cell: ({ row }) => <ApprovalBadge status={row.original.approvalStatus} />,
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => <span className="text-sm text-gray-600 dark:text-gray-400">{row.original.source ?? "—"}</span>,
    },
    {
      accessorKey: "appliedAt",
      header: "Applied",
      cell: ({ row }) => format(new Date(row.original.appliedAt), "dd MMM yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Popover>
          <PopoverTrigger asChild>
            <button className="grid size-9 shrink-0 place-items-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700">
              <MoreVertical className="size-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-40 p-1">
            <Link
              href={`/candidates/${row.original.id}`}
              className="flex w-full items-center gap-x-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
            >
              <Eye className="size-4 text-gray-500" />
              View Details
            </Link>
          </PopoverContent>
        </Popover>
      ),
    },
  ];
}
