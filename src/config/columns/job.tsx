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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Job } from "@/types/job";
import { cn } from "@/lib";

const employmentTypeLabel: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
};

const experienceLevelLabel: Record<string, string> = {
  entry: "Entry",
  mid: "Mid",
  senior: "Senior",
  executive: "Executive",
};

// ---------------------------------------------------------------------------
// Actions cell component
// ---------------------------------------------------------------------------

function JobActions({ job }: { job: Job }) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
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
              href={`/jobs/${job.id}`}
              className="flex w-full items-center gap-x-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
              onClick={() => setPopoverOpen(false)}
            >
              <Eye className="size-4 text-gray-500" />
              View
            </Link>
            <button
              className="flex w-full items-center gap-x-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
              onClick={() => {
                setPopoverOpen(false);
                setEditOpen(true);
              }}
            >
              <Pencil className="size-4 text-gray-500" />
              Edit
            </button>
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

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>Update the details for this job posting.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Title</label>
              <Input defaultValue={job.title} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Status</label>
                <Select defaultValue={job.status}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Type</label>
                <Select defaultValue={job.employmentType}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Level</label>
                <Select defaultValue={job.experienceLevel}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Location</label>
                <Input defaultValue={job.location ?? ""} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setEditOpen(false);
                toast.success("Job updated successfully");
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="text-foreground font-medium">{job.title}</span>? This
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
                setDeleteOpen(false);
                toast.success("Job deleted successfully");
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

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

export const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.title}</span>
        {row.original.company && <span className="text-xs text-gray-500">{row.original.company}</span>}
      </div>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-1.5">
        <span>{row.original.location ?? "—"}</span>
        {row.original.remote && (
          <Badge className="bg-blue-50 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">Remote</Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "employmentType",
    header: "Type",
    cell: ({ row }) => employmentTypeLabel[row.original.employmentType] ?? row.original.employmentType,
  },
  {
    accessorKey: "experienceLevel",
    header: "Level",
    cell: ({ row }) => experienceLevelLabel[row.original.experienceLevel] ?? row.original.experienceLevel,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        className={cn(
          "text-xs uppercase",
          row.original.status === "open"
            ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
            : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
        )}
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Posted",
    cell: ({ row }) => format(new Date(row.original.createdAt), "dd MMM yyyy"),
  },
  {
    accessorKey: "openUntil",
    header: "Deadline",
    cell: ({ row }) => format(new Date(row.original.openUntil), "dd MMM yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => <JobActions job={row.original} />,
  },
];
