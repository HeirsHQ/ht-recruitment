"use client";

import { CircleCheck, Clock, Eye, MoreVertical, Pencil, Trash2, XCircle } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Job, JobStatus } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
        <PopoverContent align="end" className="w-56 p-1">
          <div className="flex w-full flex-col">
            <Link
              href={`/jobs/${job.id}`}
              className="flex w-full items-center gap-x-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
              onClick={() => setPopoverOpen(false)}
            >
              <Eye className="size-4 text-gray-500" />
              View Details
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
                <Select defaultValue={job.jobType}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Level</label>
                <Select defaultValue={job.experienceType}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="entry-level">Entry</SelectItem>
                    <SelectItem value="associate-level">Associate</SelectItem>
                    <SelectItem value="mid-level">Mid</SelectItem>
                    <SelectItem value="senior-level">Senior</SelectItem>
                    <SelectItem value="management-leval">Management</SelectItem>
                    <SelectItem value="director-leval">Director</SelectItem>
                    <SelectItem value="executive-leval">Executive</SelectItem>
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
const getStatusBadge = (status: JobStatus) => {
  function icon(status: JobStatus) {
    switch (status) {
      case "cancelled":
      case "closed":
        return <XCircle className="size-3 text-red-600" />;
      case "in progress":
      case "pending":
        return <Clock className="size-3 text-yellow-600" />;
      case "open":
        return <CircleCheck className="size-3 text-green-600" />;
    }
  }
  return (
    <div className="flex w-fit items-center gap-x-1 rounded-3xl bg-gray-100 px-2 py-1 text-xs font-medium text-black capitalize">
      {icon(status)}
      {status}
    </div>
  );
};

export const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "title",
    header: "Role",
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <span className="capitalize">
        {row.original.location ?? "—"} ({row.original.workType})
      </span>
    ),
  },
  {
    accessorKey: "experienceType",
    header: "Type",
    cell: ({ row }) => <span className="capitalize">{row.original.experienceType.replace("-", " ")}</span>,
  },
  {
    id: "applicants",
    header: "Applicants",
    cell: ({ row }) => <span>{row.original.applications?.length}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.original.status),
  },
  {
    accessorKey: "createdAt",
    header: "Posted",
    cell: ({ row }) => format(new Date(row.original.createdAt), "dd MMM yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => <JobActions job={row.original} />,
  },
];
