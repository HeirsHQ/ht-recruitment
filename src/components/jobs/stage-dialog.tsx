"use client";

import { Bell, Check, ShieldCheck, Workflow } from "lucide-react";
import { useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PipelineStageConfig } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const COLOR_PRESETS = [
  { value: "#f59e0b", label: "Amber" },
  { value: "#10b981", label: "Green" },
  { value: "#ef4444", label: "Red" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#f97316", label: "Orange" },
  { value: "#6b7280", label: "Gray" },
];

const EMAIL_TEMPLATES = [
  { value: "none", label: "None" },
  { value: "status-update", label: "Status Update" },
  { value: "interview-invite", label: "Interview Invitation" },
  { value: "rejection", label: "Rejection Notice" },
  { value: "offer-letter", label: "Offer Letter" },
];

const EMPTY_STAGE: Omit<PipelineStageConfig, "id"> = {
  title: "",
  color: "#3b82f6",
  notifications: { enabled: false, recipients: [] },
  approval: { required: false, approvers: [] },
  workflow: {},
};

interface StageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (stage: PipelineStageConfig) => void;
  initial?: PipelineStageConfig;
}

export function StageDialog({ open, onOpenChange, onSave, initial }: StageDialogProps) {
  const isEditing = !!initial;

  const [title, setTitle] = useState(initial?.title ?? EMPTY_STAGE.title);
  const [color, setColor] = useState(initial?.color ?? EMPTY_STAGE.color);
  const [notificationsEnabled, setNotificationsEnabled] = useState(initial?.notifications.enabled ?? false);
  const [recipients, setRecipients] = useState(initial?.notifications.recipients.join(", ") ?? "");
  const [approvalRequired, setApprovalRequired] = useState(initial?.approval.required ?? false);
  const [approvers, setApprovers] = useState(initial?.approval.approvers.join(", ") ?? "");
  const [autoMoveDays, setAutoMoveDays] = useState(initial?.workflow.autoMoveAfterDays?.toString() ?? "");
  const [emailTemplate, setEmailTemplate] = useState(initial?.workflow.sendEmailTemplate ?? "none");

  const handleSave = () => {
    if (!title.trim()) return;

    const stage: PipelineStageConfig = {
      id: initial?.id ?? title.trim().toLowerCase().replace(/\s+/g, "-"),
      title: title.trim(),
      color,
      notifications: {
        enabled: notificationsEnabled,
        recipients: notificationsEnabled
          ? recipients
              .split(",")
              .map((e) => e.trim())
              .filter(Boolean)
          : [],
      },
      approval: {
        required: approvalRequired,
        approvers: approvalRequired
          ? approvers
              .split(",")
              .map((e) => e.trim())
              .filter(Boolean)
          : [],
      },
      workflow: {
        autoMoveAfterDays: autoMoveDays ? parseInt(autoMoveDays, 10) || undefined : undefined,
        sendEmailTemplate: emailTemplate !== "none" ? emailTemplate : undefined,
      },
    };

    onSave(stage);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Status" : "Add Status"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the configuration for this pipeline stage."
              : "Create a new pipeline stage with notifications, workflows, and approval settings."}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-1">
          <div className="space-y-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Status name</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Screening" />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    title={preset.label}
                    onClick={() => setColor(preset.value)}
                    className={cn(
                      "grid size-7 place-items-center rounded-full transition-all",
                      color === preset.value ? "ring-2 ring-offset-2" : "hover:scale-110",
                    )}
                    style={{ backgroundColor: preset.value, "--tw-ring-color": preset.value } as React.CSSProperties}
                  >
                    {color === preset.value && <Check className="size-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <hr className="border-neutral-200 dark:border-neutral-700" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                <Bell className="size-4 text-gray-500" />
                <span className="text-sm font-medium">Notifications</span>
              </div>
              <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>
            {notificationsEnabled && (
              <div className="grid gap-1.5 pl-6">
                <label className="text-xs text-gray-500">
                  Recipients <span className="text-gray-400">(comma-separated emails)</span>
                </label>
                <Input
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="hr@company.com, manager@company.com"
                />
              </div>
            )}
          </div>
          <hr className="border-neutral-200 dark:border-neutral-700" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                <ShieldCheck className="size-4 text-gray-500" />
                <span className="text-sm font-medium">Require approval</span>
              </div>
              <Switch checked={approvalRequired} onCheckedChange={setApprovalRequired} />
            </div>
            {approvalRequired && (
              <div className="grid gap-1.5 pl-6">
                <label className="text-xs text-gray-500">
                  Approvers <span className="text-gray-400">(comma-separated emails)</span>
                </label>
                <Input
                  value={approvers}
                  onChange={(e) => setApprovers(e.target.value)}
                  placeholder="lead@company.com"
                />
              </div>
            )}
          </div>
          <hr className="border-neutral-200 dark:border-neutral-700" />
          <div className="space-y-3">
            <div className="flex items-center gap-x-2">
              <Workflow className="size-4 text-gray-500" />
              <span className="text-sm font-medium">Workflow</span>
            </div>
            <div className="grid gap-3 pl-6">
              <div className="grid gap-1.5">
                <label className="text-xs text-gray-500">Auto-move after (days)</label>
                <Input
                  type="number"
                  min={1}
                  value={autoMoveDays}
                  onChange={(e) => setAutoMoveDays(e.target.value)}
                  placeholder="Leave empty to disable"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs text-gray-500">Send email template</label>
                <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {EMAIL_TEMPLATES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {isEditing ? "Save changes" : "Add status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
