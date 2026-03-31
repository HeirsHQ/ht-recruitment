"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import type { WorkflowTemplate } from "@/types/workflow";
import { ActionCell, ActionIcons } from "./shared";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib";

export const workflowColumns: ColumnDef<WorkflowTemplate>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        <span className="w-48 truncate text-xs text-gray-500">{row.original.description}</span>
      </div>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.original.department.name}
      </Badge>
    ),
  },
  {
    accessorKey: "stages",
    header: "Stages",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-1.5">
        <div className="flex -space-x-0.5">
          {row.original.stages.slice(0, 4).map((stage) => (
            <span
              key={stage.id}
              className="size-3 rounded-full border-2 border-white dark:border-neutral-900"
              style={{ backgroundColor: stage.color }}
              title={stage.title}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">{row.original.stages.length} stages</span>
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        className={cn(
          "text-xs",
          row.original.isActive
            ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
            : "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400",
        )}
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => format(new Date(row.original.createdAt), "dd MMM yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionCell
        actions={[
          { label: "View", icon: ActionIcons.View, href: `/pipelines/${row.original.id}` },
          { label: "Edit", icon: ActionIcons.Edit, href: `/pipelines/${row.original.id}/edit` },
          { label: "Delete", icon: ActionIcons.Delete, onClick: () => {}, variant: "danger" },
        ]}
      />
    ),
  },
];
