
"use client"

import { useAppContext } from "@/context/app-context"
import type { Project } from "@/lib/types"
import { CalendarBase } from "./calendar-base"
import { Badge } from "./ui/badge";
import { ProjectLegend } from "./project-legend";
import { useMemo, useCallback } from "react";
import { Checkbox } from "./ui/checkbox";
import { cn } from "@/lib/utils";
import { useDrag } from "react-dnd";

type DraggableItem = {
    id: string;
    type: 'deadline';
};

const DraggableDeadline = ({ project, onCompleteToggle }: { project: Project; onCompleteToggle: (project: Project) => void; }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'deadline',
    item: { id: project.id, type: 'deadline' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [project.id]);
  
  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }} className="flex items-center gap-2">
      <Checkbox
        id={`deadline-check-${project.id}`}
        checked={project.status === 'completed'}
        onCheckedChange={() => onCompleteToggle(project)}
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
  )
}

export function DeadlineCalendarTab() {
  const { projects, updateProject, getDeadlinesForDate } = useAppContext()

  const handleDeadlineDrop = useCallback((item: DraggableItem, newDate: string) => {
    updateProject(item.id, { deadline: newDate });
  }, [updateProject]);

  const handleProjectCompleteToggle = (project: Project) => {
    const newStatus = project.status === 'in-progress' ? 'completed' : 'in-progress';
    updateProject(project.id, { status: newStatus });
  };


  const renderDeadline = useCallback((project: Project) => (
    <DraggableDeadline key={project.id} project={project} onCompleteToggle={handleProjectCompleteToggle} />
  ), [handleProjectCompleteToggle]);
  
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
          itemTypes={['deadline']}
        />
      </div>
      <div className="w-full md:w-64">
        <ProjectLegend projects={inProgressProjects} />
      </div>
    </div>
  );
}
