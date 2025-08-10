
"use client"

import { useAppContext } from "@/context/app-context"
import type { Project } from "@/lib/types"
import { CalendarBase } from "./calendar-base"
import { Badge } from "./ui/badge";
import { ProjectLegend } from "./project-legend";
import { useMemo, useCallback, useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { cn } from "@/lib/utils";
import { useDrag } from "react-dnd";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };
  
  const deadlinesForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return getDeadlinesForDate(selectedDate);
  }, [selectedDate, getDeadlinesForDate]);


  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-grow">
        <CalendarBase
          getItemsForDate={getInProgressDeadlinesForDate}
          renderItem={renderDeadline}
          onItemDrop={handleDeadlineDrop}
          onDateClick={handleDateClick}
          itemTypes={['deadline']}
        />
      </div>
      <div className="w-full md:w-64">
        <ProjectLegend projects={inProgressProjects} />
      </div>
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? format(parseISO(selectedDate), "M月d日 (E)", { locale: ja }) : ""} の納期
            </DialogTitle>
            <DialogDescription>
              この日が納期のプロジェクト一覧です。
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3 mt-4">
            {deadlinesForSelectedDate.length > 0 ? (
                deadlinesForSelectedDate.map((project) => (
                    <div key={project.id} className="flex items-start gap-3 rounded-md border-l-4 bg-muted/50 p-4" style={{borderLeftColor: project.color}}>
                        <div className="grid gap-0.5 w-full">
                            <p className={cn("font-medium text-base", project.status === 'completed' && "line-through")}>{project.name}</p>
                            <p className="text-sm">担当: {project.salesRep} / {project.designer}</p>
                        </div>
                         <Badge variant={project.status === 'completed' ? 'secondary' : 'outline'} className="border-primary text-primary whitespace-nowrap">
                            {project.status === 'in-progress' ? '進行中' : '完了'}
                        </Badge>
                    </div>
                ))
            ) : (
                <p>この日に納期のプロジェクトはありません。</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
