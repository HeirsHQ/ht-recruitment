import { ActivityPriority, ActivityType, MeetingType } from "@/types";

export const ACTIVITY_PRIORITY_LIST: { label: string; value: ActivityPriority }[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

export const ACTIVITY_TYPE_LIST: { label: string; value: ActivityType }[] = [
  { label: "Assessment", value: "assessment" },
  { label: "Interview", value: "interview" },
  { label: "Follow-up", value: "follow-up" },
  { label: "Onboarding", value: "onboarding" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Task", value: "task" },
  { label: "Other", value: "other" },
];

export const MEETING_TYPE_LIST: { label: string; value: MeetingType }[] = [
  { label: "In-person", value: "in-person" },
  { label: "Phone", value: "phone" },
  { label: "Video", value: "video" },
];
