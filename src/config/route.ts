import { BarChart, Briefcase, LayoutDashboard, LucideIcon, Users, Workflow } from "lucide-react";

type RouteConfig = {
  href: string;
  name: string;
  icon: LucideIcon;
};

export const ROUTES: RouteConfig[] = [
  {
    href: "/dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/jobs",
    name: "Jobs",
    icon: Briefcase,
  },
  {
    href: "/candidates",
    name: "Candidates",
    icon: Users,
  },
  {
    href: "/workflows",
    name: "Pipeline",
    icon: Workflow,
  },
  {
    href: "/reports",
    name: "Reports",
    icon: BarChart,
  },
];
