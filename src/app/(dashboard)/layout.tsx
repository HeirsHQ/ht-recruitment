import React from "react";

import { Header, Sidebar } from "@/components/shared";

interface Props {
  children: React.ReactNode;
}

function DashboardLayout({ children }: Props) {
  return (
    <div className="flex h-screen w-screen items-start">
      <Sidebar />
      <div className="h-full flex-1 overflow-hidden">
        <Header />
        <div className="h-[calc(100%-76px)] w-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default DashboardLayout;
