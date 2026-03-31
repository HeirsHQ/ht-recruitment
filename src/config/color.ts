import type { ActivityPriority, MeetingType } from "@/types";

export const ACTIVITY_PRIORITIES: Record<ActivityPriority, string> = {
  low: "bg-green-100 text-green-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-orange-100 text-orange-600",
  urgent: "bg-red-100 text-red-600",
};

export const MEETING_TYPES: Record<MeetingType, string> = {
  "in-person": "bg-purple-100 text-purple-600",
  phone: "bg-indigo-100 text-indigo-600",
  video: "bg-teal-100 text-teal-600",
};
