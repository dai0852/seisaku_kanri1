"use client"

import { useMemo } from "react"
import { useAppContext } from "@/context/app-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function CompletedProjectsTab() {
  const { projects } = useAppContext()

  const completedProjects = useMemo(() => {
    return projects.filter(p => p.status === 'completed');
  }, [projects]);

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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">完了した物件はありません。</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  );
}
