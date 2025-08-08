"use client";

import { InProgressProjectsTab } from "./in-progress-projects-tab";
import { CompletedProjectsTab } from "./completed-projects-tab";

export function OverallManagementTab() {
  return (
    <div className="space-y-8">
      <InProgressProjectsTab />
      <CompletedProjectsTab />
    </div>
  );
}
