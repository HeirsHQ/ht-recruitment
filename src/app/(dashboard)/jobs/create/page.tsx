"use client";

import { useState } from "react";

import { CreateJob, Template } from "@/components/jobs";
import { TabPanel } from "@/components/shared";
import { cn } from "@/lib";

import { MOCK_JOB_TEMPLATES } from "@/__mock__/database";

const TABS = [
  { label: "Complete Form", value: "form" },
  { label: "Use Template", value: "templates" },
];

const Page = () => {
  const [view, setView] = useState("form");

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Create Job</h1>
        <p className="text-sm text-gray-500">Employee records, onboarding, leave, performance & talent management</p>
      </div>
      <div className="w-full rounded-xl border p-6">
        <div className="flex w-fit items-center rounded-md bg-gray-200 p-0.5">
          {TABS.map((tab) => (
            <button
              className={cn(
                "grid h-8 min-w-40 shrink-0 place-items-center rounded-md px-3 text-sm font-medium transition-all duration-300",
                view === tab.value ? "bg-white" : "",
              )}
              key={tab.value}
              onClick={() => setView(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <TabPanel selected={view} value="form">
          <CreateJob />
        </TabPanel>
        <TabPanel selected={view} value="templates">
          <Template templates={MOCK_JOB_TEMPLATES} />
        </TabPanel>
      </div>
    </div>
  );
};

export default Page;
