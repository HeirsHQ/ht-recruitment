"use client";

import { CircleCheck, Clock, Eye, MapPin, MoreVertical, Pencil, Trash2, Users, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  job: Job;
}

const statusConfig: Record<JobStatus, { icon: typeof CircleCheck; className: string }> = {
  open: { icon: CircleCheck, className: "text-green-600" },
  closed: { icon: XCircle, className: "text-red-600" },
  cancelled: { icon: XCircle, className: "text-red-600" },
  pending: { icon: Clock, className: "text-yellow-600" },
  "in progress": { icon: Clock, className: "text-yellow-600" },
};

export const JobCard = ({ job }: Props) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const status = statusConfig[job.status];
  const StatusIcon = status.icon;

  return (
    <>
      <div className="flex h-full flex-col justify-between rounded-xl border bg-white p-5 transition-shadow duration-300 hover:shadow-md">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold">{job.title}</p>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <button className="grid size-7 shrink-0 place-items-center rounded-md hover:bg-gray-100">
                  <MoreVertical className="size-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-44 p-1">
                <div className="flex w-full flex-col">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="flex w-full items-center gap-x-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-gray-100"
                    onClick={() => setPopoverOpen(false)}
                  >
                    <Eye className="size-4 text-gray-500" />
                    View Details
                  </Link>
                  <button
                    className="flex w-full items-center gap-x-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-gray-100"
                    onClick={() => {
                      setPopoverOpen(false);
                      setEditOpen(true);
                    }}
                  >
                    <Pencil className="size-4 text-gray-500" />
                    Edit
                  </button>
                  <button
                    className="flex w-full items-center gap-x-2 rounded-md px-2.5 py-1.5 text-sm text-red-600 hover:bg-red-50"
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
          </div>
          <p className="text-xs text-gray-500">{job.company}</p>
          <div className="flex items-center gap-x-1.5 text-xs text-gray-500">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {job.location} ({job.workType})
            </span>
          </div>
          <div className="text-xs text-gray-500 capitalize">{job.experienceType.replace("-", " ")}</div>
        </div>
        <div className="mt-4 space-y-3 border-t pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-1.5 text-xs text-gray-500">
              <Users className="size-3.5" />
              <span>
                {job.applications?.length ?? 0} applicant{(job.applications?.length ?? 0) !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-x-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize">
              <StatusIcon className={`size-3 ${status.className}`} />
              {job.status}
            </div>
          </div>
          <p className="text-xs text-gray-400">{format(new Date(job.createdAt), "dd MMM yyyy")}</p>
        </div>
      </div>

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
                    <SelectItem value="management-level">Management</SelectItem>
                    <SelectItem value="director-level">Director</SelectItem>
                    <SelectItem value="executive-level">Executive</SelectItem>
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
};
