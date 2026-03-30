"use client";

import { useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { StageListEditor } from "./stage-list-editor";
import type { PipelineStageConfig } from "@/types/job";
import type { WorkflowTemplate } from "@/types/workflow";

import { sanitizeText } from "@/lib/sanitize";
import { MOCK_DEPARTMENTS } from "@/__mock__/database";

interface WorkflowFormProps {
  initialData?: WorkflowTemplate;
  onSave: (workflow: WorkflowTemplate) => void;
  onCancel: () => void;
}

export function WorkflowForm({ initialData, onSave, onCancel }: WorkflowFormProps) {
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [departmentId, setDepartmentId] = useState(initialData?.department?.id ?? "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [stages, setStages] = useState<PipelineStageConfig[]>(initialData?.stages ?? []);

  const canSave = name.trim() && departmentId && stages.length >= 2;

  const handleSave = () => {
    if (!canSave) return;

    const cleanName = sanitizeText(name);
    const cleanDescription = sanitizeText(description);

    if (!cleanName) return;

    const now = new Date();
    const dept = MOCK_DEPARTMENTS.find((d) => d.id === departmentId);
    if (!dept) return;

    const workflow: WorkflowTemplate = {
      id: initialData?.id ?? cleanName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
      name: cleanName,
      description: cleanDescription,
      department: dept,
      stages,
      isActive,
      createdBy: initialData?.createdBy ?? "Current User",
      createdAt: initialData?.createdAt ?? now,
      updatedAt: now,
    };

    onSave(workflow);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-xl border p-4">
        <h3 className="font-semibold">Basic Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engineering Hiring Pipeline"
              maxLength={200}
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">
              Department <span className="text-red-500">*</span>
            </label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent position="popper">
                {MOCK_DEPARTMENTS.filter((d) => d.id !== "all").map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose of this workflow..."
            rows={3}
            maxLength={2000}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Active</p>
            <p className="text-xs text-gray-500">Enable this workflow for use with jobs</p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border p-4">
        <div>
          <h3 className="font-semibold">Pipeline Stages</h3>
          <p className="text-xs text-gray-500">
            Define the stages candidates will move through. At least 2 stages are required. Drag to reorder.
          </p>
        </div>
        <StageListEditor stages={stages} onStagesChange={setStages} />
      </div>

      <div className="flex items-center justify-end gap-x-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!canSave}>
          {isEditing ? "Save Changes" : "Create Workflow"}
        </Button>
      </div>
    </div>
  );
}
