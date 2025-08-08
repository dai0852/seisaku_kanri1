"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InProgressProjectsTab } from "./in-progress-projects-tab";
import { CompletedProjectsTab } from "./completed-projects-tab";
import { ListChecks, ListTodo, CheckCircle, AlertTriangle, FolderKanban, PlusCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { useAppContext } from "@/context/app-context";
import { AddProjectDialog } from "./add-project-dialog";
import { Button } from "./ui/button";

export function OverallManagementTab() {
  const { projects } = useAppContext()
  
  const inProgressProjects = useMemo(() => {
    return projects.filter(p => p.status === 'in-progress');
  }, [projects]);
  
  const completedProjects = useMemo(() => {
    return projects.filter(p => p.status === 'completed');
  }, [projects]);


  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              進行中プロジェクト
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressProjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了プロジェクト</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects.length}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">遅延・要確認</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
             <p className="text-xs text-muted-foreground">
              今後のアップデートで実装予定
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">プロジェクト一覧</h2>
         <AddProjectDialog>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                新規物件を追加
            </Button>
        </AddProjectDialog>
      </div>

      <Tabs defaultValue="in-progress">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="in-progress">
              <ListTodo className="mr-2 h-4 w-4" />
              進行中
          </TabsTrigger>
          <TabsTrigger value="completed">
              <ListChecks className="mr-2 h-4 w-4" />
              完了
          </TabsTrigger>
        </TabsList>
        <TabsContent value="in-progress" className="mt-6">
          <InProgressProjectsTab />
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <CompletedProjectsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
