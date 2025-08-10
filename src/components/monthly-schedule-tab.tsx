
"use client"

import { useCallback, useMemo, useState } from "react"
import { useAppContext } from "@/context/app-context"
import { DEPARTMENTS, Department, type Project, type Task } from "@/lib/types"
import { CalendarBase } from "./calendar-base"
import { Checkbox } from "./ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { format, parseISO } from "date-fns"
import { ja } from "date-fns/locale"
import { ProjectLegend } from "./project-legend"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Card, CardContent, CardHeader } from "./ui/card"
import { useDrag } from "react-dnd"

interface TaskItem {
    project: Project;
    task: Task;
}

type DraggableItem = {
    id: string;
    projectId: string;
    type: 'task';
};

const DraggableTask = ({ project, task }: TaskItem) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'task',
        item: { id: task.id, projectId: project.id, type: 'task' },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [project.id, task.id]);
    
    return (
        <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
            <Badge
                className={cn(
                "w-full justify-start truncate cursor-grab active:cursor-grabbing text-white",
                task.completed && "line-through",
                task.name === '納品' && "rounded-md"
                )}
                style={{ backgroundColor: project.color }}
            >
                {task.name}
            </Badge>
        </div>
    );
};


export function MonthlyScheduleTab() {
  const { projects, updateTask, getTasksForDate } = useAppContext()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'all'>('all')
  const [selectedProjectId, setSelectedProjectId] = useState<string | 'all'>('all')

  const inProgressProjects = useMemo(() => {
    return projects.filter(p => p.status === 'in-progress').sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);
  
  const getFilteredTasksForDate = useCallback((date: string) => {
    let tasks = getTasksForDate(date);
    let inProgressTasks = tasks.filter(item => item.project.status === 'in-progress');
    
    if (selectedDepartment !== 'all') {
      inProgressTasks = inProgressTasks.filter(item => item.task.department === selectedDepartment);
    }
    if (selectedProjectId !== 'all') {
      inProgressTasks = inProgressTasks.filter(item => item.project.id === selectedProjectId);
    }
    return inProgressTasks;
  }, [getTasksForDate, selectedDepartment, selectedProjectId]);
  
  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return getFilteredTasksForDate(selectedDate);
  }, [selectedDate, getFilteredTasksForDate]);

  const projectsInCalendar = useMemo(() => {
    const projectIds = new Set<string>();
    inProgressProjects.forEach(p => {
        if (selectedProjectId !== 'all' && p.id !== selectedProjectId) return;
        p.tasks.forEach(t => {
            if (selectedDepartment === 'all' || t.department === selectedDepartment) {
                projectIds.add(p.id);
            }
        });
    });
    return inProgressProjects
      .filter(p => projectIds.has(p.id))
      .sort((a,b) => a.name.localeCompare(b.name));
  }, [inProgressProjects, selectedDepartment, selectedProjectId]);


  const handleTaskDrop = useCallback((item: DraggableItem, newDate: string) => {
    if (!item.projectId) return;
    updateTask(item.projectId, item.id, { dueDate: newDate });
  }, [updateTask]);
  
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const renderTask = useCallback((item: TaskItem) => {
    return <DraggableTask key={item.task.id} project={item.project} task={item.task} />;
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-grow space-y-4">
        <Card>
            <CardContent className="p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">担当部署で絞り込み</h3>
                    <Select value={selectedDepartment} onValueChange={(value) => setSelectedDepartment(value as Department | 'all')}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="部署を選択" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">すべての部署</SelectItem>
                            {DEPARTMENTS.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">プロジェクトで絞り込み</h3>
                    <Select value={selectedProjectId} onValueChange={(value) => setSelectedProjectId(value as string | 'all')}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="プロジェクトを選択" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">すべてのプロジェクト</SelectItem>
                            {inProgressProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
        <CalendarBase
          getItemsForDate={getFilteredTasksForDate}
          renderItem={renderTask}
          onItemDrop={handleTaskDrop}
          onDateClick={handleDateClick}
          itemTypes={['task']}
        />
      </div>
       <div className="w-full md:w-64">
        <ProjectLegend projects={projectsInCalendar} />
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? format(parseISO(selectedDate), "M月d日 (E)", { locale: ja }) : ""} のタスク
            </DialogTitle>
            <DialogDescription>
              この日のすべてのタスク一覧です。
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3 mt-4">
            {tasksForSelectedDate.length > 0 ? (
                tasksForSelectedDate.map(({project, task}) => (
                    <div key={task.id} className="flex items-start gap-3 rounded-md border-l-4 bg-muted/50 p-4" style={{borderLeftColor: project.color}}>
                         <Checkbox 
                            id={`dialog-task-${task.id}`}
                            checked={task.completed}
                            onCheckedChange={(checked) => updateTask(project.id, task.id, { completed: !!checked })}
                            className="mt-1"
                        />
                        <div className="grid gap-0.5 w-full">
                            <label htmlFor={`dialog-task-${task.id}`} className={cn("font-medium text-base", task.completed && "line-through")}>{task.name}</label>
                            <p className="text-sm font-semibold" style={{color: project.color}}>{project.name}</p>
                            {task.notes && <p className="text-sm text-muted-foreground mt-1">{task.notes}</p>}
                        </div>
                    </div>
                ))
            ) : (
                <p>この日にはタスクがありません。</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
