"use client";

import { Bell, Moon, PanelLeft, Sun } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useGlobalStore } from "@/store/core";
import { Notification } from "@/types";
import { Input } from "../ui/input";
import { cn } from "@/lib";

const notifications: Notification[] = [
  { content: "", createdAt: "", id: "1", isRead: false, title: "" },
  { content: "", createdAt: "", id: "2", isRead: false, title: "" },
  { content: "", createdAt: "", id: "3", isRead: false, title: "" },
  { content: "", createdAt: "", id: "4", isRead: false, title: "" },
];

export const Header = () => {
  const { isCollapsed, setIsCollapsed, setTheme, theme } = useGlobalStore();

  const handleToggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className="bg-layout-background flex h-19 w-full items-center justify-between px-4">
      <div className="flex items-center gap-x-4">
        <button className="h-7 w-11 border-r" onClick={() => setIsCollapsed(!isCollapsed)}>
          <PanelLeft className={cn("size-4 transition-all duration-300", isCollapsed && "rotate-180")} />
        </button>
        <div>
          <p className="text-sm font-bold">Good morning, John Doe</p>
        </div>
      </div>
      <div className="flex items-center gap-x-3">
        <Input className="bg-white dark:bg-neutral-800" placeholder="Search" type="search" />
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative grid aspect-square size-9 place-items-center rounded border bg-white dark:bg-neutral-800">
              <Bell className="size-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 grid size-4.5 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {notifications.length > 9 ? "9+" : notifications.length}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="relative w-60 space-y-6">
            <div className="flex w-full items-center justify-between">
              <p className="text-sm font-medium">Notifications</p>
              <div className="absolute top-2 right-2 grid place-items-center rounded-full bg-red-500 text-xs text-white">
                {notifications.length}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <button
          className="grid aspect-square size-9 place-items-center rounded border bg-white dark:bg-neutral-800"
          onClick={handleToggleTheme}
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>
    </header>
  );
};
