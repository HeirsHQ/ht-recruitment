"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { sanitizeText, parsePositiveInt } from "@/lib/sanitize";
import type { Job } from "@/types/job";
import { MOCK_DEPARTMENTS, MOCK_JOB_ROLES } from "@/__mock__/database";

interface CreateJobProps {
  onSubmit: (job: Job) => void;
}

export function CreateJob({ onSubmit }: CreateJobProps) {
  const [open, setOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [employmentType, setEmploymentType] = useState<string>("full-time");
  const [experienceLevel, setExperienceLevel] = useState<string>("mid");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [openUntil, setOpenUntil] = useState("");

  // List fields
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [requirementInput, setRequirementInput] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [benefitInput, setBenefitInput] = useState("");
  const [benefits, setBenefits] = useState<string[]>([]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEmploymentType("full-time");
    setExperienceLevel("mid");
    setLocation("");
    setRemote(false);
    setRole("");
    setDepartment("");
    setSalaryMin("");
    setSalaryMax("");
    setCurrency("NGN");
    setOpenUntil("");
    setTagInput("");
    setTags([]);
    setRequirementInput("");
    setRequirements([]);
    setBenefitInput("");
    setBenefits([]);
  };

  const handleAddTag = () => {
    const value = sanitizeText(tagInput);
    if (value && !tags.includes(value)) {
      setTags((prev) => [...prev, value]);
      setTagInput("");
    }
  };

  const handleAddRequirement = () => {
    const value = sanitizeText(requirementInput);
    if (value) {
      setRequirements((prev) => [...prev, value]);
      setRequirementInput("");
    }
  };

  const handleAddBenefit = () => {
    const value = sanitizeText(benefitInput);
    if (value) {
      setBenefits((prev) => [...prev, value]);
      setBenefitInput("");
    }
  };

  const handleSubmit = () => {
    const cleanTitle = sanitizeText(title);
    if (!cleanTitle) return;

    const parsedMin = salaryMin ? parsePositiveInt(salaryMin) : undefined;
    const parsedMax = salaryMax ? parsePositiveInt(salaryMax) : undefined;

    if (parsedMin !== undefined && parsedMax !== undefined && parsedMin > parsedMax) {
      toast.error("Minimum salary cannot exceed maximum salary");
      return;
    }

    const now = new Date();
    const job: Job = {
      id: crypto.randomUUID(),
      title: cleanTitle,
      description: sanitizeText(description) || undefined,
      status: "open",
      employmentType: employmentType as Job["employmentType"],
      experienceLevel: experienceLevel as Job["experienceLevel"],
      location: sanitizeText(location) || undefined,
      remote,
      role: role || undefined,
      department: department || undefined,
      salaryMin: parsedMin,
      salaryMax: parsedMax,
      currency: parsedMin !== undefined || parsedMax !== undefined ? currency : undefined,
      openUntil: openUntil ? new Date(openUntil) : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()),
      tags: tags.length > 0 ? tags.map(sanitizeText) : undefined,
      requirements: requirements.length > 0 ? requirements.map(sanitizeText) : undefined,
      benefits: benefits.length > 0 ? benefits.map(sanitizeText) : undefined,
      applications: [],
      createdAt: now,
      updatedAt: now,
      views: 0,
    };

    onSubmit(job);
    resetForm();
    setOpen(false);
    toast.success(`Job "${job.title}" created`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Job</DialogTitle>
          <DialogDescription>Fill in the details to create a new job posting.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-1">
          {/* Basic info */}
          <div className="space-y-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role, responsibilities, and what makes it great..."
                rows={3}
              />
            </div>
          </div>

          <hr className="border-neutral-200 dark:border-neutral-700" />

          {/* Job details */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Job details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs text-gray-500">Employment type</label>
                <Select value={employmentType} onValueChange={setEmploymentType}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs text-gray-500">Experience level</label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="entry">Entry</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs text-gray-500">Role</label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {MOCK_JOB_ROLES.map((r) => (
                      <SelectItem key={r.id} value={r.name}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs text-gray-500">Department</label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {MOCK_DEPARTMENTS.map((d) => (
                      <SelectItem key={d.id} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs text-gray-500">Location</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Lagos, Nigeria" />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span className="text-sm">Remote position</span>
              <Switch checked={remote} onCheckedChange={setRemote} />
            </div>
          </div>

          <hr className="border-neutral-200 dark:border-neutral-700" />

          {/* Compensation */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Compensation</p>
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-2 grid gap-1.5">
                <label className="text-xs text-gray-500">Min salary</label>
                <Input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="50,000"
                />
              </div>
              <div className="col-span-2 grid gap-1.5">
                <label className="text-xs text-gray-500">Max salary</label>
                <Input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="100,000"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs text-gray-500">Currency</label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="NGN">NGN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs text-gray-500">Open until</label>
              <Input type="date" value={openUntil} onChange={(e) => setOpenUntil(e.target.value)} />
            </div>
          </div>

          <hr className="border-neutral-200 dark:border-neutral-700" />

          {/* Tags */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Tags</p>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button variant="outline" size="default" onClick={handleAddTag} type="button">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-x-1 text-xs">
                    {tag}
                    <button type="button" onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}>
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <hr className="border-neutral-200 dark:border-neutral-700" />

          {/* Requirements */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Requirements</p>
            <div className="flex gap-2">
              <Input
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                placeholder="Add a requirement"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
              />
              <Button variant="outline" size="default" onClick={handleAddRequirement} type="button">
                Add
              </Button>
            </div>
            {requirements.length > 0 && (
              <ul className="space-y-1">
                {requirements.map((req, i) => (
                  <li
                    key={i}
                    className="flex items-start justify-between gap-x-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span>• {req}</span>
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 text-gray-400 hover:text-red-500"
                      onClick={() => setRequirements((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <hr className="border-neutral-200 dark:border-neutral-700" />

          {/* Benefits */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Benefits</p>
            <div className="flex gap-2">
              <Input
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                placeholder="Add a benefit"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddBenefit();
                  }
                }}
              />
              <Button variant="outline" size="default" onClick={handleAddBenefit} type="button">
                Add
              </Button>
            </div>
            {benefits.length > 0 && (
              <ul className="space-y-1">
                {benefits.map((ben, i) => (
                  <li
                    key={i}
                    className="flex items-start justify-between gap-x-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span>• {ben}</span>
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 text-gray-400 hover:text-red-500"
                      onClick={() => setBenefits((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            Create job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
