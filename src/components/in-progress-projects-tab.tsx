"use client"

import { useMemo, useState } from "react"
import { useAppContext } from "@/context/app-context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "./ui/button"
import { PlusCircle, Trash2 } from "lucide-react"
import { AddProjectDialog } from "./add-project-dialog"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"

export function InProgressProjectsTab() {
  const { projects, updateTask, deleteProject } = useAppContext()
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const inProgressProjects = useMemo(() => {
    return projects.filter(p => p.status === 'in-progress');
  }, [projects]);

  const handleDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Card>
                <CardHeader>
                    <CardTitle>進行中の物件</CardTitle>
                    <CardDescription>{inProgressProjects.length}件のプロジェクトが進行中です。</CardDescription>
                </CardHeader>
            </Card>
            <AddProjectDialog>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    新規物件を追加
                </Button>
            </AddProjectDialog>
        </div>
        
        <Accordion type="multiple" className="w-full space-y-4">
          {inProgressProjects.map(project => (
            <AccordionItem key={project.id} value={project.id} className="border-0">
                <Card className="overflow-hidden">
                    <AccordionTrigger className="p-6 hover:no-underline group">
                        <div className="flex w-full items-center justify-between gap-4">
                            <div className="text-left flex-grow">
                                <p className="font-bold text-lg">{project.name}</p>
                                <p className="text-sm text-muted-foreground">納期: {project.deadline}</p>
                            </div>
                            <div className="text-right text-sm flex-shrink-0">
                                <p>営業: {project.salesRep}</p>
                                <p>デザイナー: {project.designer}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                e.stopPropagation();
                                setProjectToDelete(project.id);
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-muted/30">
                        <div className="p-6 pt-0">
                            <h4 className="font-semibold mb-2">工程タスク</h4>
                            <div className="space-y-2">
                                {project.tasks.length > 0 ? project.tasks.map(task => (
                                    <div key={task.id} className="flex items-start gap-3 rounded-md bg-background p-3">
                                        <Checkbox 
                                            id={`task-${task.id}`}
                                            checked={task.completed}
                                            onCheckedChange={(checked) => updateTask(project.id, task.id, { completed: !!checked })}
                                            className="mt-1"
                                        />
                                        <div className="grid gap-0.5 w-full">
                                            <div className="flex items-center justify-between">
                                                <label htmlFor={`task-${task.id}`} className={cn("font-medium", task.completed && "line-through")}>{task.name}</label>
                                                <Badge variant="secondary">{task.department}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">期限: {task.dueDate}</p>
                                            {task.notes && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{task.notes}</p>}
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-muted-foreground">このプロジェクトにはタスクがありません。</p>}
                            </div>
                        </div>
                    </AccordionContent>
                </Card>
            </AccordionItem>
          ))}
        </Accordion>
        <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                    この操作は元に戻すことはできません。プロジェクトと関連するすべてのタスクが完全に削除されます。
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setProjectToDelete(null)}>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>削除</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
