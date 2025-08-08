"use client"

import { useAppContext } from "@/context/app-context"
import type { Project } from "@/lib/types"
import { CalendarBase } from "./calendar-base"
import { Badge } from "./ui/badge";

export function DeadlineCalendarTab() {
  const { projects, updateProject, getDeadlinesForDate } = useAppContext()

  const handleDeadlineDrop = (projectId: string, _: string | undefined, newDate: string) => {
    updateProject(projectId, { deadline: newDate });
  };

  const renderDeadline = (project: Project) => (
    <Badge variant="default" className="w-full justify-start truncate cursor-grab active:cursor-grabbing">
      {project.name}
    </Badge>
  );

  return (
    <CalendarBase
      getItemsForDate={getDeadlinesForDate}
      renderItem={renderDeadline}
      onItemDrop={handleDeadlineDrop}
      itemType="deadline"
    />
  );
}
