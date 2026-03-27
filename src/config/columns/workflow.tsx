"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WorkflowTemplate } from "@/types/workflow";
import { cn } from "@/lib";

function WorkflowActions({ workflow, onDelete }: { workflow: WorkflowTemplate; onDelete?: (id: string) => void }) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button className="grid size-9 shrink-0 place-items-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700">
            <MoreVertical className="size-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-40 p-1">
          <div className="flex w-full flex-col">
            <Link
              href={`/pipelines/${workflow.id}`}
              className="flex w-full items-center gap-x-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
              onClick={() => setPopoverOpen(false)}
            >
              <Eye className="size-4 text-gray-500" />
              View
            </Link>
            <Link
              href={`/pipelines/${workflow.id}/edit`}
              className="flex w-full items-center gap-x-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
              onClick={() => setPopoverOpen(false)}
            >
              <Pencil className="size-4 text-gray-500" />
              Edit
            </Link>
            <button
              className="flex w-full items-center gap-x-2 rounded-md px-2.5 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => {
                setPopoverOpen(false);
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workflow</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="text-foreground font-medium">{workflow.name}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete?.(workflow.id);
                setDeleteOpen(false);
                toast.success("Workflow deleted successfully");
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function createWorkflowColumns(onDelete?: (id: string) => void): ColumnDef<WorkflowTemplate>[] {
  return [
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
      cell: ({ row }) => <WorkflowActions workflow={row.original} onDelete={onDelete} />,
    },
  ];
}
