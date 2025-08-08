
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
import { Card, CardHeader } from "./ui/card"

interface TaskItem {
    project: Project;
    task: Task;
}

export function MonthlyScheduleTab() {
  const { projects, updateTask, getTasksForDate } = useAppContext()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'all'>('all')

  const inProgressProjects = useMemo(() => {
    return projects.filter(p => p.status === 'in-progress');
  }, [projects]);
  
  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const allTasks = getTasksForDate(selectedDate);
    const filteredByProjectStatus = allTasks.filter(item => item.project.status === 'in-progress');

    if (selectedDepartment === 'all') {
        return filteredByProjectStatus;
    }
    return filteredByProjectStatus.filter(item => item.task.department === selectedDepartment);
  }, [selectedDate, getTasksForDate, selectedDepartment]);


  const handleTaskDrop = (taskId: string, projectId: string | undefined, newDate: string) => {
    if (!projectId) return;
    updateTask(projectId, taskId, { dueDate: newDate });
  };
  
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const renderTask = (item: TaskItem) => {
    const { project, task } = item;
    return (
      <Badge
        className={cn(
          "w-full justify-start truncate cursor-grab active:cursor-grabbing text-white",
          task.completed && "line-through"
        )}
        style={{ backgroundColor: project.color }}
      >
        {task.name}
      </Badge>
    );
  };

  const getFilteredTasksForDate = useCallback((date: string) => {
    const tasks = getTasksForDate(date);
    const inProgressTasks = tasks.filter(item => item.project.status === 'in-progress');
    if (selectedDepartment === 'all') {
      return inProgressTasks;
    }
    return inProgressTasks.filter(item => item.task.department === selectedDepartment);
  }, [getTasksForDate, selectedDepartment]);


  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-grow space-y-4">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <h3 className="text-sm font-medium">担当部署で絞り込み</h3>
                    <Select value={selectedDepartment} onValueChange={(value) => setSelectedDepartment(value as Department | 'all')}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="部署を選択" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">すべての部署</SelectItem>
                            {DEPARTMENTS.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
        </Card>
        <CalendarBase
          getItemsForDate={getFilteredTasksForDate}
          renderItem={renderTask}
          onItemDrop={handleTaskDrop}
          onDateClick={handleDateClick}
          itemType="task"
        />
      </div>
       <div className="w-full md:w-64">
        <ProjectLegend projects={inProgressProjects} />
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
