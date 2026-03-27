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
    href: "/pipelines",
    name: "Pipelines",
    icon: Workflow,
  },
  {
    href: "/reports",
    name: "Reports",
    icon: BarChart,
  },
];
