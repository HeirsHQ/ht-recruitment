"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sanitizeText, isValidEmail, validatePassword } from "@/lib/sanitize";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Role, User } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CreateUserProps {
  onSubmit: (user: User) => void;
  roles: Role[];
}

export function CreateUser({ onSubmit, roles }: CreateUserProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRoleId("");
  };

  const handleSubmit = () => {
    const cleanName = sanitizeText(name);
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !password.trim() || !roleId) return;

    if (!isValidEmail(cleanEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const pw = validatePassword(password);
    if (!pw.isValid) {
      toast.error(pw.errors[0]);
      return;
    }

    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    const now = new Date();
    const user: User = {
      id: Date.now(),
      name: cleanName,
      email: cleanEmail,
      password,
      role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    onSubmit(user);
    resetForm();
    setOpen(false);
    toast.success(`User "${user.name}" created`);
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
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New User</DialogTitle>
          <DialogDescription>Create a new user account.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" />
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@company.com"
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">
              Password <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">
              Role <span className="text-red-500">*</span>
            </label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent position="popper">
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <span className="capitalize">{role.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !email.trim() || !password.trim() || !roleId}>
            Create user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
