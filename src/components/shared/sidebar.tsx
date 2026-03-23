"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useGlobalStore } from "@/store/core";
import { Button } from "../ui/button";
import { ROUTES } from "@/config";
import { cn } from "@/lib";

export const Sidebar = () => {
  const { isCollapsed } = useGlobalStore();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isOnPath = (href: string) => pathname.startsWith(href);

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-layout-background h-full overflow-hidden"
    >
      <div className="flex h-19 w-full items-center justify-center">
        <div className={cn("relative", isCollapsed ? "hidden" : "aspect-[2.7/1] w-25")}>
          <Image alt="converge" className="object-contain" fill sizes="100%" src="/assets/images/converge-logo.png" />
        </div>
      </div>
      <div className="flex h-[calc(100%-76px)] w-full flex-col justify-between">
        <div className="space-y-1 p-2">
          {ROUTES.map((route) => (
            <Link
              className={cn(
                "flex h-11 items-center rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200",
                isOnPath(route.href) ? "bg-primary-500 text-white" : "hover:bg-gray-200 dark:hover:bg-neutral-800",
                isCollapsed ? "justify-center px-0" : "gap-x-2 px-2",
              )}
              href={route.href}
              key={route.href}
              title={route.name}
            >
              <span className="shrink-0">
                <route.icon className="size-4" />
              </span>
              <span
                className={cn(
                  "overflow-hidden transition-opacity duration-200",
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
                )}
              >
                {route.name}
              </span>
            </Link>
          ))}
        </div>
        <div className={cn("flex items-center border-t p-4", isCollapsed ? "justify-center" : "justify-between")}>
          <div
            className={cn(
              "flex items-center gap-x-3 overflow-hidden transition-opacity duration-200",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
            )}
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src="" />
              <AvatarFallback className="rounded-lg">JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold whitespace-nowrap">{"John Doe"}</p>
              <p className="text-xs whitespace-nowrap text-gray-600 dark:text-gray-400">{"Software Engineer"}</p>
            </div>
          </div>
          <Dialog onOpenChange={setOpen} open={open}>
            <DialogTrigger asChild>
              <button className="shrink-0 cursor-pointer">
                <LogOut className="size-4" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <div>
                <DialogTitle>Sign Out</DialogTitle>
                <DialogDescription></DialogDescription>
              </div>
              <div>
                <p className="text-sm"></p>
                <div className="flex w-full items-center justify-end gap-x-4">
                  <Button onClick={() => setOpen(false)} size="sm" variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={() => {}} size="sm" variant="destructive">
                    Sign Out
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </motion.aside>
  );
};
