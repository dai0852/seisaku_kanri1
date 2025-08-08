"use client"

import { useAppContext } from "@/context/app-context"
import type { Project } from "@/lib/types"
import { CalendarBase } from "./calendar-base"
import { Badge } from "./ui/badge";
import { ProjectLegend } from "./project-legend";
import { useMemo } from "react";

export function DeadlineCalendarTab() {
  const { projects, updateProject, getDeadlinesForDate } = useAppContext()

  const handleDeadlineDrop = (projectId: string, _: string | undefined, newDate: string) => {
    updateProject(projectId, { deadline: newDate });
  };

  const renderDeadline = (project: Project) => (
    <Badge 
        variant="default" 
        className="w-full justify-start truncate cursor-grab active:cursor-grabbing text-white"
        style={{ backgroundColor: project.color }}
    >
      {project.name}
    </Badge>
  );
  
  const inProgressProjects = useMemo(() => {
    return projects.filter(p => p.status === 'in-progress');
  }, [projects]);


  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-grow">
        <CalendarBase
          getItemsForDate={getDeadlinesForDate}
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
