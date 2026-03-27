"use client";

import { MapPin, Users } from "lucide-react";
import Link from "next/link";

import { Kanban, type KanbanColumnConfig, type KanbanDragEndEvent } from "@/components/shared";
import type { Job, JobStatus } from "@/types/job";

const COLUMNS: KanbanColumnConfig[] = [
  { id: "open", title: "Open", color: "#22c55e" },
  { id: "in progress", title: "In Progress", color: "#eab308" },
  { id: "pending", title: "Pending", color: "#f97316" },
  { id: "closed", title: "Closed", color: "#ef4444" },
  { id: "cancelled", title: "Cancelled", color: "#6b7280" },
];

interface Props {
  jobs: Job[];
  onStatusChange?: (jobId: string, newStatus: JobStatus) => void;
}

function JobKanbanCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`} className="block space-y-2">
      <p className="truncate text-sm font-medium">{job.title}</p>
      {job.company && <p className="text-xs text-gray-500">{job.company.name}</p>}
      {job.location && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <MapPin className="size-3" />
          <span className="truncate">{job.location}</span>
        </div>
      )}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Users className="size-3" />
          <span>{job.applications?.length ?? 0}</span>
        </div>
        <div className="flex gap-1.5">
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 capitalize">
            {job.jobType.replace("-", " ")}
          </span>
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 capitalize">
            {job.workType.replace("-", " ")}
          </span>
        </div>
      </div>
    </Link>
  );
}

export const JobKanban = ({ jobs, onStatusChange }: Props) => {
  const handleDragEnd = (event: KanbanDragEndEvent<Job>) => {
    if (event.fromStatus === event.toStatus) return;
    onStatusChange?.(event.item.id, event.toStatus as JobStatus);
  };

  return (
    <Kanban<Job>
      items={jobs}
      columns={COLUMNS}
      renderCard={(job) => <JobKanbanCard job={job} />}
      onDragEnd={handleDragEnd}
    />
  );
};
