"use client";

import { Bell, Moon, PanelLeft, Sun } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useGlobalStore } from "@/store/core";
import { Notification } from "@/types";
import { Input } from "../ui/input";
import { cn } from "@/lib";
import { Button } from "../ui/button";

const notifications: Notification[] = [
  {
    content: "Your pipeline for Software Engineer at Transcorp has been reviewed.",
    createdAt: "2024-05-15T10:30:00Z",
    id: "1",
    isRead: false,
    title: "Application Reviewed",
  },
  {
    content: "Interview scheduled for Product Designer role at Heirs Holding on Friday.",
    createdAt: "2024-05-15T09:15:00Z",
    id: "2",
    isRead: false,
    title: "Interview Scheduled",
  },
  {
    content: "Savannah Rice has been shortlisted for the Data Analyst position at Heirs Technologies.",
    createdAt: "2024-05-14T18:45:00Z",
    id: "3",
    isRead: true,
    title: "Shortlisted",
  },
  {
    content: "Interview for Marketing Manager at BrandInc is tomorrow.",
    createdAt: "2024-05-14T08:00:00Z",
    id: "4",
    isRead: false,
    title: "Interview Reminder",
  },
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
          <PopoverContent align="end" className="relative w-75 space-y-6">
            <div className="flex w-full items-center justify-between">
              <p className="text-sm font-medium">Notifications</p>
              <Button size="xs" variant="outline">
                Mark all as read
              </Button>
            </div>
            <div className="w-full space-y-1">
              {notifications.map((notification) => (
                <div className="flex items-center gap-x-2" key={notification.id}>
                  <div className={`size-2 rounded-full ${notification.isRead ? "bg-gray-300" : "bg-red-500"}`}></div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="max-w-60 truncate text-xs text-gray-500">{notification.content}</p>
                  </div>
                </div>
              ))}
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
