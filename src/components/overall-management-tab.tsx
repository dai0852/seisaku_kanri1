"use client"

import { useMemo } from "react"
import { useAppContext } from "@/context/app-context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "./ui/button"
import { PlusCircle } from "lucide-react"
import { AddProjectDialog } from "./add-project-dialog"

export function OverallManagementTab() {
  const { projects, updateTask } = useAppContext()

  const { inProgressProjects, completedProjects } = useMemo(() => {
    const inProgressProjects = projects.filter(p => p.status === 'in-progress');
    const completedProjects = projects.filter(p => p.status === 'completed');
    return { inProgressProjects, completedProjects };
  }, [projects]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>進行中の物件</CardTitle>
            <CardDescription>{inProgressProjects.length}件のプロジェクトが進行中です。</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>完了した物件</CardTitle>
            <CardDescription>これまでに{completedProjects.length}件のプロジェクトが完了しました。</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">進行中の物件</h2>
            <AddProjectDialog>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    物件を追加
                </Button>
            </AddProjectDialog>
        </div>
        <Accordion type="multiple" className="w-full space-y-4">
          {inProgressProjects.map(project => (
            <AccordionItem key={project.id} value={project.id} className="border-0">
                <Card className="overflow-hidden">
                    <AccordionTrigger className="p-6 hover:no-underline">
                        <div className="flex w-full items-center justify-between">
                            <div className="text-left">
                                <p className="font-bold text-lg">{project.name}</p>
                                <p className="text-sm text-muted-foreground">納期: {project.deadline}</p>
                            </div>
                            <div className="text-right text-sm">
                                <p>営業: {project.salesRep}</p>
                                <p>デザイナー: {project.designer}</p>
                            </div>
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
                                            <label htmlFor={`task-${task.id}`} className="font-medium">{task.name}</label>
                                            <p className="text-sm text-muted-foreground">期限: {task.dueDate}</p>
                                            {task.notes && <p className="text-sm text-muted-foreground mt-1">{task.notes}</p>}
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
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">完了物件</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>物件名</TableHead>
                  <TableHead>納期</TableHead>
                  <TableHead>担当営業</TableHead>
                  <TableHead>担当デザイナー</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedProjects.map(project => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.deadline}</TableCell>
                    <TableCell>{project.salesRep}</TableCell>
                    <TableCell>{project.designer}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
