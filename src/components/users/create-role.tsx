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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { sanitizeText } from "@/lib/sanitize";
import type { Role } from "@/types";

interface CreateRoleProps {
  onSubmit: (role: Role) => void;
}

export function CreateRole({ onSubmit }: CreateRoleProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissionInput, setPermissionInput] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPermissionInput("");
    setPermissions([]);
  };

  const handleAddPermission = () => {
    const value = sanitizeText(permissionInput).toLowerCase();
    if (value && !permissions.includes(value)) {
      setPermissions((prev) => [...prev, value]);
      setPermissionInput("");
    }
  };

  const handleSubmit = () => {
    const cleanName = sanitizeText(name);
    if (!cleanName) return;

    const now = new Date();
    const role: Role = {
      id: crypto.randomUUID(),
      name: cleanName.toLowerCase(),
      description: sanitizeText(description) || undefined,
      permissions: permissions.map(sanitizeText),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    onSubmit(role);
    resetForm();
    setOpen(false);
    toast.success(`Role "${role.name}" created`);
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
          Add Role
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Role</DialogTitle>
          <DialogDescription>Create a new role with permissions.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. admin" />
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this role can do..."
              rows={2}
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Permissions</label>
            <div className="flex gap-2">
              <Input
                value={permissionInput}
                onChange={(e) => setPermissionInput(e.target.value)}
                placeholder="Add a permission"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPermission();
                  }
                }}
              />
              <Button variant="outline" size="default" onClick={handleAddPermission} type="button">
                Add
              </Button>
            </div>
            {permissions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {permissions.map((perm) => (
                  <Badge key={perm} variant="secondary" className="gap-x-1 text-xs">
                    {perm}
                    <button type="button" onClick={() => setPermissions((prev) => prev.filter((p) => p !== perm))}>
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Create role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
