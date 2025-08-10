"use client"

import { useMemo, useState } from "react"
import { useAppContext } from "@/context/app-context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "./ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"
import { Progress } from "./ui/progress"
import type { Project, Task } from "@/lib/types"
import { EditProjectDialog } from "./edit-project-dialog"
import { compareAsc, parseISO } from "date-fns"
import { EditTaskDialog } from "./edit-task-dialog"

const ProjectCard = ({ project }: { project: Project }) => {
    const { updateTask, deleteProject } = useAppContext()
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

    const progress = useMemo(() => {
        if (project.tasks.length === 0) return 0;
        const completedTasks = project.tasks.filter(t => t.completed).length;
        return (completedTasks / project.tasks.length) * 100;
    }, [project.tasks]);

    const sortedTasks = useMemo(() => {
      return [...project.tasks].sort((a, b) => compareAsc(parseISO(a.dueDate), parseISO(b.dueDate)));
    }, [project.tasks]);

    const handleEditTask = (task: Task) => {
        setTaskToEdit(task);
    }

    return (
        <>
            <AccordionItem value={project.id} className="border-b-0">
                <Card className="overflow-hidden shadow-subtle border-l-4" style={{borderColor: project.color}}>
                    <div className="flex items-center group p-4">
                        <AccordionTrigger className="flex-grow hover:no-underline p-0">
                            <div className="flex flex-col w-full text-left gap-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-base">{project.name}</h3>
                                    <Badge variant={project.status === 'completed' ? 'secondary' : 'outline'} className="border-primary text-primary">
                                        {project.status === 'in-progress' ? '進行中' : '完了'}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{project.salesRep} / {project.designer}</p>
                                <p className="text-sm text-muted-foreground">納期: {project.deadline}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Progress value={progress} className="h-2 flex-grow" />
                                    <span className="text-xs font-mono text-muted-foreground">{Math.round(progress)}%</span>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <div className="flex flex-col shrink-0 ml-2 self-start opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-primary"
                                onClick={() => setIsEditDialogOpen(true)}
                                >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDeleteDialogOpen(true);
                                }}
                                >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <AccordionContent>
                        <div className="px-4 pb-4 pt-0">
                            <h4 className="font-semibold mb-2 text-sm">工程タスク</h4>
                            <div className="space-y-2">
                                {sortedTasks.length > 0 ? sortedTasks.map(task => (
                                    <div key={task.id} className="flex items-start gap-3 rounded-md bg-muted/50 p-3 group/task">
                                        <Checkbox 
                                            id={`task-${task.id}`}
                                            checked={task.completed}
                                            onCheckedChange={(checked) => updateTask(project.id, task.id, { completed: !!checked })}
                                            className="mt-1"
                                        />
                                        <div className="grid gap-0.5 w-full">
                                            <div className="flex items-center justify-between">
                                                <label htmlFor={`task-${task.id}`} className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>{task.name}</label>
                                                <Badge variant="secondary">{task.department}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">期限: {task.dueDate}</p>
                                            {task.notes && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{task.notes}</p>}
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7 self-center opacity-0 group-hover/task:opacity-100 transition-opacity"
                                            onClick={() => handleEditTask(task)}
                                            disabled={task.name === '納品'}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )) : <p className="text-sm text-muted-foreground">このプロジェクトにはタスクがありません。</p>}
                            </div>
                        </div>
                    </AccordionContent>
                </Card>
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                            この操作は元に戻すことはできません。プロジェクトと関連するすべてのタスクが完全に削除されます。
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteProject(project.id)}>削除</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AccordionItem>
            {isEditDialogOpen && <EditProjectDialog project={project} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />}
            {taskToEdit && <EditTaskDialog project={project} task={taskToEdit} open={!!taskToEdit} onOpenChange={(open) => !open && setTaskToEdit(null)} />}
        </>
    )
}


export function InProgressProjectsTab() {
  const { projects } = useAppContext()

  const inProgressProjects = useMemo(() => {
    return projects.filter(p => p.status === 'in-progress');
  }, [projects]);

  return (
    <div className="space-y-4">
        <Accordion type="multiple" className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inProgressProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </Accordion>
    </div>
  );
}
