"use client";

import { Mail, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import type { JobApplication } from "@/types/job";
import { Badge } from "../ui/badge";

interface Props {
  application: JobApplication;
}

const KanbanCard = ({ application }: Props) => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">{application.applicant.name}</p>
          <div className="flex items-center gap-x-1 text-xs text-gray-500 lowercase">
            <Mail className="lowe size-3" />
            <span className="w-37.5 truncate">{application.applicant.email}</span>
          </div>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="grid size-5 place-items-center">
              <MoreVertical className="size-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-37.5 space-y-2 p-2">
            <button className="flex h-6 w-full items-center rounded px-3 text-xs hover:bg-gray-100">
              <Link href={`/jobs/${application.jobId}/applications/${application.id}`}>View</Link>
            </button>
            <button className="flex h-6 w-full items-center rounded px-3 text-xs hover:bg-gray-100">Download CV</button>
            <button className="flex h-6 w-full items-center rounded px-3 text-xs hover:bg-gray-100">Delete</button>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {format(new Date(application.applicant.appliedAt), "dd MMM yyyy")}
        </span>
        {application.applicant.coverLetter && (
          <Badge variant="outline" className="text-xs">
            Cover letter
          </Badge>
        )}
      </div>
    </div>
  );
};

export default KanbanCard;
