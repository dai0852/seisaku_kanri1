
"use client"

import { useAppContext } from "@/context/app-context"
import type { Project } from "@/lib/types"
import { CalendarBase } from "./calendar-base"
import { Badge } from "./ui/badge";
import { ProjectLegend } from "./project-legend";
import { useMemo, useCallback } from "react";
import { Checkbox } from "./ui/checkbox";
import { cn } from "@/lib/utils";

export function DeadlineCalendarTab() {
  const { projects, updateProject, getDeadlinesForDate } = useAppContext()

  const handleDeadlineDrop = (projectId: string, _: string | undefined, newDate: string) => {
    updateProject(projectId, { deadline: newDate });
  };

  const handleProjectCompleteToggle = (project: Project) => {
    const newStatus = project.status === 'in-progress' ? 'completed' : 'in-progress';
    updateProject(project.id, { status: newStatus });
  };


  const renderDeadline = (project: Project) => (
    <div className="flex items-center gap-2">
      <Checkbox
        id={`deadline-check-${project.id}`}
        checked={project.status === 'completed'}
        onCheckedChange={() => handleProjectCompleteToggle(project)}
      />
      <Badge
        variant="default"
        className={cn(
            "w-full justify-start truncate cursor-grab active:cursor-grabbing text-white",
            project.status === 'completed' && "line-through"
        )}
        style={{ backgroundColor: project.color }}
      >
        {project.name}
      </Badge>
    </div>
  );
  
  const inProgressProjects = useMemo(() => {
    return projects.filter(p => p.status === 'in-progress');
  }, [projects]);

  const getInProgressDeadlinesForDate = useCallback((date: string) => {
    return getDeadlinesForDate(date).filter(p => p.status === 'in-progress');
  }, [getDeadlinesForDate]);


  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-grow">
        <CalendarBase
          getItemsForDate={getInProgressDeadlinesForDate}
          renderItem={renderDeadline}
          onItemDrop={handleDeadlineDrop}
          itemType="deadline"
        />
      </div>
      <div className="w-full md:w-64">
        <ProjectLegend projects={inProgressProjects} />
      </div>
    </div>
  );
}
