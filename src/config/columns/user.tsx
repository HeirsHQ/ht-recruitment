"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Pencil, Shield, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Role, User } from "@/types";
import { getInitials } from "@/lib";
import { cn } from "@/lib";

// ---------------------------------------------------------------------------
// User actions
// ---------------------------------------------------------------------------

function UserActions({ user }: { user: User }) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button className="grid size-9 shrink-0 place-items-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700">
            <MoreVertical className="size-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-40 p-1">
          <div className="flex w-full flex-col">
            <button
              className="flex w-full items-center gap-x-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
              onClick={() => {
                setPopoverOpen(false);
                setEditOpen(true);
              }}
            >
              <Pencil className="size-4 text-gray-500" />
              Edit
            </button>
            <button
              className="flex w-full items-center gap-x-2 rounded-md px-2.5 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => {
                setPopoverOpen(false);
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Name</label>
              <Input defaultValue={user.name} />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input defaultValue={user.email} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setEditOpen(false);
                toast.success("User updated successfully");
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="text-foreground font-medium">{user.name}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteOpen(false);
                toast.success("User deleted successfully");
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Role actions
// ---------------------------------------------------------------------------

function RoleActions({ role }: { role: Role }) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button className="grid size-9 shrink-0 place-items-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700">
            <MoreVertical className="size-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-40 p-1">
          <div className="flex w-full flex-col">
            <button
              className="flex w-full items-center gap-x-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
              onClick={() => {
                setPopoverOpen(false);
                setEditOpen(true);
              }}
            >
              <Pencil className="size-4 text-gray-500" />
              Edit
            </button>
            <button
              className="flex w-full items-center gap-x-2 rounded-md px-2.5 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => {
                setPopoverOpen(false);
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update role details and permissions.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Name</label>
              <Input defaultValue={role.name} />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Description</label>
              <Input defaultValue={role.description ?? ""} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setEditOpen(false);
                toast.success("Role updated successfully");
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the <span className="text-foreground font-medium">{role.name}</span> role?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteOpen(false);
                toast.success("Role deleted successfully");
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// User columns
// ---------------------------------------------------------------------------

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-3">
        <Avatar>
          <AvatarImage src={row.original.avatar} alt={row.original.name} />
          <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-gray-500">{row.original.email}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-1.5">
        <Shield className="size-3.5 text-gray-400" />
        <span className="capitalize">{row.original.role.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        className={cn(
          "text-xs uppercase",
          row.original.isActive
            ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
            : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
        )}
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "lastLoginAt",
    header: "Last Login",
    cell: ({ row }) => (row.original.lastLoginAt ? format(new Date(row.original.lastLoginAt), "dd MMM yyyy") : "Never"),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => format(new Date(row.original.createdAt), "dd MMM yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => <UserActions user={row.original} />,
  },
];

// ---------------------------------------------------------------------------
// Role columns
// ---------------------------------------------------------------------------

export const roleColumns: ColumnDef<Role>[] = [
  {
    accessorKey: "name",
    header: "Role",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium capitalize">{row.original.name}</span>
        {row.original.description && (
          <span className="max-w-xs truncate text-xs text-gray-500">{row.original.description}</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.permissions.slice(0, 3).map((perm, i) => (
          <Badge key={i} variant="secondary" className="text-xs capitalize">
            {perm}
          </Badge>
        ))}
        {row.original.permissions.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{row.original.permissions.length - 3}
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        className={cn(
          "text-xs uppercase",
          row.original.isActive
            ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
            : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
        )}
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => format(new Date(row.original.createdAt), "dd MMM yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => <RoleActions role={row.original} />,
  },
];
