"use client"

import { useMemo, useState } from "react"
import { useAppContext } from "@/context/app-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "./ui/button"
import { Trash2, Undo2 } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"

export function CompletedProjectsTab() {
  const { projects, updateProject, deleteProject } = useAppContext()
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const completedProjects = useMemo(() => {
    return projects.filter(p => p.status === 'completed');
  }, [projects]);
  
  const handleDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      setProjectToDelete(null);
    }
  };

  return (
     <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>完了した物件一覧</CardTitle>
            <CardDescription>これまでに{completedProjects.length}件のプロジェクトが完了しました。</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>物件名</TableHead>
                  <TableHead>納期</TableHead>
                  <TableHead>担当営業</TableHead>
                  <TableHead>担当デザイナー</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedProjects.length > 0 ? (
                  completedProjects.map(project => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.deadline}</TableCell>
                      <TableCell>{project.salesRep}</TableCell>
                      <TableCell>{project.designer}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateProject(project.id, { status: 'in-progress' })}
                        >
                          <Undo2 className="mr-2 h-4 w-4" />
                          進行中に戻す
                        </Button>
                         <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setProjectToDelete(project.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          削除
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">完了した物件はありません。</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
