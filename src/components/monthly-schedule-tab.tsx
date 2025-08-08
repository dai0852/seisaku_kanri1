"use client"

import { useState } from "react"
import { useAppContext } from "@/context/app-context"
import type { Project, Task } from "@/lib/types"
import { CalendarBase } from "./calendar-base"
import { Checkbox } from "./ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { format, parseISO } from "date-fns"
import { ja } from "date-fns/locale"

interface TaskItem {
    project: Project;
    task: Task;
}

export function MonthlyScheduleTab() {
  const { projects, updateTask, getTasksForDate } = useAppContext()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const tasksForSelectedDate = selectedDate ? getTasksForDate(selectedDate) : [];

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
      <div className="flex items-start gap-2 p-1.5 rounded-md bg-background border shadow-sm cursor-grab active:cursor-grabbing">
        <Checkbox
            id={`cal-task-${task.id}`}
            checked={task.completed}
            onCheckedChange={(checked) => updateTask(project.id, task.id, { completed: !!checked })}
            className="mt-0.5"
        />
        <div>
            <p className="font-medium leading-tight">{task.name}</p>
            <p className="text-muted-foreground text-[10px]">{project.name}</p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <CalendarBase
        getItemsForDate={getTasksForDate}
        renderItem={renderTask}
        onItemDrop={handleTaskDrop}
        onDateClick={handleDateClick}
        itemType="task"
      />
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
                    <div key={task.id} className="flex items-start gap-3 rounded-md border bg-muted/50 p-4">
                         <Checkbox 
                            id={`dialog-task-${task.id}`}
                            checked={task.completed}
                            onCheckedChange={(checked) => updateTask(project.id, task.id, { completed: !!checked })}
                            className="mt-1"
                        />
                        <div className="grid gap-0.5 w-full">
                            <label htmlFor={`dialog-task-${task.id}`} className="font-medium text-base">{task.name}</label>
                            <p className="text-sm text-primary font-semibold">{project.name}</p>
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
