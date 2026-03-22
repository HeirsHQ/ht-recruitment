"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MessageSquare,
  Send,
  User,
  XCircle,
} from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, sanitizeText } from "@/lib";

import { MOCK_JOBS } from "@/__mock__/database";

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    icon: CheckCircle,
  },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300", icon: XCircle },
};

interface ReviewNote {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

const Page = () => {
  const { applicationId, id } = useParams() as { applicationId: string; id: string };

  const { application, job } = useMemo(() => {
    const job = MOCK_JOBS.find((job) => job.id === id);
    if (!job) return { application: null, job: null };
    const application = job.applications?.find((a) => a.id === applicationId);
    return { application: application ?? null, job };
  }, [applicationId, id]);

  const [status, setStatus] = useState(application?.status ?? "pending");
  const [notes, setNotes] = useState<ReviewNote[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [rating, setRating] = useState<string>("none");

  if (!application || !job) {
    return (
      <div className="grid min-h-64 place-items-center p-6">
        <div className="text-center">
          <p className="text-lg font-medium text-red-500">Application not found</p>
          <Link href={`/jobs/${id}`} className="mt-2 text-sm text-gray-500 underline">
            Back to job
          </Link>
        </div>
      </div>
    );
  }

  const initials = application.applicant.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    toast.success(`Status updated to "${statusConfig[newStatus].label}"`);
  };

  const handleAddNote = () => {
    const cleanNote = sanitizeText(noteInput);
    if (!cleanNote) return;
    const note: ReviewNote = {
      id: crypto.randomUUID(),
      author: "You",
      content: cleanNote,
      createdAt: new Date(),
    };
    setNotes((prev) => [note, ...prev]);
    setNoteInput("");
    toast.success("Note added");
  };

  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6 p-6">
      <Link href={`/jobs/${id}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </Link>
      {/* Header */}
      <div>
        <div className="flex items-center gap-x-2">
          <h1 className="text-2xl font-semibold">{application.applicant.name}</h1>
          <Badge className={cn("text-xs uppercase", statusInfo.color)}>
            <StatusIcon className="size-3" />
            {statusInfo.label}
          </Badge>
        </div>
        <p className="text-sm text-gray-500">
          Applied to <span className="font-medium text-gray-700 dark:text-gray-300">{job.title}</span>
          {" · "}
          {format(new Date(application.applicant.appliedAt), "dd MMM yyyy")}
        </p>
      </div>

      {/* Main content + Sidebar */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — Application details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Applicant info card */}
          <div className="space-y-4 rounded-xl border p-5">
            <h3 className="font-semibold">Applicant Information</h3>
            <div className="flex items-start gap-x-4">
              <Avatar size="lg">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-x-2 text-gray-600 dark:text-gray-400">
                  <User className="size-4 shrink-0" />
                  <span>{application.applicant.name}</span>
                </div>
                <div className="flex items-center gap-x-2 text-gray-600 dark:text-gray-400">
                  <Mail className="size-4 shrink-0" />
                  <a href={`mailto:${application.applicant.email}`} className="underline-offset-2 hover:underline">
                    {application.applicant.email}
                  </a>
                </div>
                <div className="flex items-center gap-x-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="size-4 shrink-0" />
                  <span>Applied {format(new Date(application.applicant.appliedAt), "dd MMM yyyy 'at' HH:mm")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resume */}
          <div className="space-y-3 rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Resume</h3>
              <a href={application.applicant.resume} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Download className="size-3.5" />
                  Download
                </Button>
              </a>
            </div>
            <div className="flex items-center gap-x-3 rounded-lg bg-gray-50 p-3 dark:bg-neutral-800">
              <FileText className="size-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Resume.pdf</p>
                <a
                  href={application.applicant.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-x-1 text-xs text-gray-500 hover:underline"
                >
                  <ExternalLink className="size-3" />
                  Open in new tab
                </a>
              </div>
            </div>
          </div>

          {/* Cover letter */}
          {application.applicant.coverLetter && (
            <div className="space-y-3 rounded-xl border p-5">
              <h3 className="font-semibold">Cover Letter</h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {application.applicant.coverLetter}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-3 rounded-xl border p-5">
            <h3 className="font-semibold">Activity Timeline</h3>
            <div className="space-y-4">
              <div className="flex gap-x-3">
                <div className="flex flex-col items-center">
                  <div className="grid size-8 place-items-center rounded-full bg-blue-100 dark:bg-blue-950">
                    <FileText className="size-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="mt-1 w-px flex-1 bg-gray-200 dark:bg-neutral-700" />
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium">Application submitted</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(application.createdAt), "dd MMM yyyy 'at' HH:mm")}
                  </p>
                </div>
              </div>
              {status !== "pending" && (
                <div className="flex gap-x-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "grid size-8 place-items-center rounded-full",
                        status === "accepted" ? "bg-green-100 dark:bg-green-950" : "bg-red-100 dark:bg-red-950",
                      )}
                    >
                      {status === "accepted" ? (
                        <CheckCircle className="size-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="size-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Application {status === "accepted" ? "accepted" : "rejected"}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(application.updatedAt), "dd MMM yyyy 'at' HH:mm")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar — HR Actions */}
        <div className="space-y-4">
          {/* Status */}
          <div className="space-y-3 rounded-xl border p-4">
            <h3 className="text-sm font-semibold">Status</h3>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="pending">
                  <span className="flex items-center gap-x-2">
                    <Clock className="size-3.5 text-amber-500" />
                    Pending
                  </span>
                </SelectItem>
                <SelectItem value="accepted">
                  <span className="flex items-center gap-x-2">
                    <CheckCircle className="size-3.5 text-green-500" />
                    Accepted
                  </span>
                </SelectItem>
                <SelectItem value="rejected">
                  <span className="flex items-center gap-x-2">
                    <XCircle className="size-3.5 text-red-500" />
                    Rejected
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick actions */}
          <div className="space-y-3 rounded-xl border p-4">
            <h3 className="text-sm font-semibold">Quick Actions</h3>
            <div className="flex flex-col gap-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  handleStatusChange("accepted");
                }}
              >
                <CheckCircle className="size-3.5 text-green-500" />
                Accept Application
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  handleStatusChange("rejected");
                }}
              >
                <XCircle className="size-3.5 text-red-500" />
                Reject Application
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  window.open(`mailto:${application.applicant.email}`, "_blank");
                }}
              >
                <Mail className="size-3.5 text-blue-500" />
                Send Email
              </Button>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-3 rounded-xl border p-4">
            <h3 className="text-sm font-semibold">Rating</h3>
            <Select
              value={rating}
              onValueChange={(v) => {
                setRating(v);
                toast.success("Rating updated");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="none">No rating</SelectItem>
                <SelectItem value="strong-yes">Strong Yes</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="maybe">Maybe</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="strong-no">Strong No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Review notes */}
          <div className="space-y-3 rounded-xl border p-4">
            <div className="flex items-center gap-x-2">
              <MessageSquare className="size-4 text-gray-500" />
              <h3 className="text-sm font-semibold">Review Notes</h3>
            </div>
            <div className="space-y-2">
              <Textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Add a note about this applicant..."
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
              />
              <Button size="sm" className="w-full" onClick={handleAddNote} disabled={!noteInput.trim()}>
                <Send className="size-3.5" />
                Add Note
              </Button>
            </div>
            {notes.length > 0 && (
              <div className="space-y-3 pt-2">
                {notes.map((note) => (
                  <div key={note.id} className="space-y-1 rounded-lg bg-gray-50 p-3 dark:bg-neutral-800">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium">{note.author}</p>
                      <p className="text-xs text-gray-400">{format(note.createdAt, "dd MMM 'at' HH:mm")}</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Job info */}
          <div className="space-y-3 rounded-xl border p-4">
            <h3 className="text-sm font-semibold">Job Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Position</span>
                <Link href={`/jobs/${id}`} className="font-medium underline-offset-2 hover:underline">
                  {job.title}
                </Link>
              </div>
              {job.department && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Department</span>
                  <span>{job.department}</span>
                </div>
              )}
              {job.location && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Location</span>
                  <span>{job.location}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Type</span>
                <span className="capitalize">{job.workType.replace("-", " ")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
