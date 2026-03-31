"use client";

import { useParams } from "next/navigation";
import { format } from "date-fns";
import { useMemo } from "react";
import Link from "next/link";
import { Plus, SquareCheckBig, CalendarDays } from "lucide-react";

import { ACTIVITY_PRIORITIES, MEETING_TYPES } from "@/config/color";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib";

import { MOCK_JOBS } from "@/__mock__/database";

const Page = () => {
  const id = useParams().id as string;
  const job = MOCK_JOBS.find((job) => job.id === id);

  const activities = useMemo(() => {
    if (!job) return [];
    return job.activities;
  }, [job]);

  if (!job) {
    return (
      <div className="grid min-h-64 place-items-center p-6">
        <div className="text-center">
          <p className="text-lg font-medium text-red-500">Job not found</p>
          <Link href="/jobs" className="mt-2 text-sm text-gray-500 underline">
            Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-semibold">Schedules</p>
          <p className="text-sm text-gray-600">Manage activities and schedules for {job.title}</p>
        </div>
        <Button asChild size="sm">
          <Link href={`/jobs/${id}/schedules/create`}>
            <Plus className="size-4" /> Add Schedule
          </Link>
        </Button>
      </div>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-x-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800/50"
          >
            <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-500">
              <SquareCheckBig className="size-4" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-x-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{activity.title}</p>
                <Badge className={cn("text-xs capitalize", ACTIVITY_PRIORITIES[activity.priority])}>
                  {activity.priority}
                </Badge>
                <Badge className={cn("text-xs capitalize", MEETING_TYPES[activity.meetingType])}>
                  {activity.meetingType}
                </Badge>
              </div>
              <div className="flex items-center gap-x-2 text-xs text-gray-400">
                <span>{format(activity.startDate, "MMM dd, yyyy")}</span>
                <span className="size-1 rounded-full bg-gray-400" />
                <span>{format(activity.startDate, "hh:mm a")}</span>
                {activity.endDate && (
                  <>
                    <span>-</span>
                    <span>{format(activity.endDate, "MMM dd, yyyy")}</span>
                    <span className="size-1 rounded-full bg-gray-400" />
                    <span>{format(activity.endDate, "hh:mm a")}</span>
                  </>
                )}
              </div>
              {activity.description && <p className="text-xs text-gray-500">{activity.description}</p>}
            </div>
            <Badge variant="secondary" className="shrink-0 text-xs capitalize">
              {activity.type}
            </Badge>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="grid min-h-64 place-items-center rounded-lg border border-dashed">
            <div className="text-center">
              <CalendarDays className="mx-auto size-8 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">No activities scheduled yet</p>
              <Button asChild size="sm" variant="outline" className="mt-4">
                <Link href={`/jobs/${id}/schedules/create`}>
                  <Plus className="size-4" /> Create your first schedule
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
