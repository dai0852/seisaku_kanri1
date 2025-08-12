"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InProgressProjectsTab } from "./in-progress-projects-tab";
import { CompletedProjectsTab } from "./completed-projects-tab";
import { ListChecks, ListTodo, FolderKanban, PlusCircle, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { useAppContext } from "@/context/app-context";
import { AddProjectDialog } from "./add-project-dialog";
import { Button } from "./ui/button";
import type { Project } from "@/lib/types";
import { parseISO, compareAsc } from "date-fns";

export function OverallManagementTab() {
  const { projects, allProjects } = useAppContext()
  
  const inProgressProjects = useMemo(() => {
    return projects.filter(p => p.status === 'in-progress');
  }, [projects]);

  const escapeCSV = (value: any) => {
    const strValue = String(value ?? ''); // Handle null/undefined
    if (/[",\n]/.test(strValue)) {
      return `"${strValue.replace(/"/g, '""')}"`;
    }
    return strValue;
  };

  const convertToCSV = (projects: Project[]) => {
    const maxTasks = Math.max(0, ...projects.map(p => p.tasks?.length || 0));

    const baseHeader = [
      "物件ID", "物件名", "納期", "担当営業", "担当デザイナー", 
      "リンク", "プロジェクト備考", "ステータス"
    ];
    
    const taskHeaders: string[] = [];
    for (let i = 1; i <= maxTasks; i++) {
        taskHeaders.push(`工程タスク${i}`);
        taskHeaders.push(`工程タスク${i}期日`);
        taskHeaders.push(`工程タスク${i}担当部署`);
        taskHeaders.push(`工程タスク${i}完了`);
        taskHeaders.push(`工程タスク${i}備考`);
    }

    const header = [...baseHeader, ...taskHeaders];

    const rows = projects.map(p => {
        const projectRow = [
            p.id, p.name, p.deadline, p.salesRep, p.designer,
            p.link, p.notes, p.status
        ];

        const taskRowItems: (string | boolean | undefined)[] = [];
        const sortedTasks = [...(p.tasks || [])].sort((a, b) => compareAsc(parseISO(a.dueDate), parseISO(b.dueDate)));

        for (let i = 0; i < maxTasks; i++) {
            const task = sortedTasks[i];
            if (task) {
                taskRowItems.push(task.name);
                taskRowItems.push(task.dueDate);
                taskRowItems.push(task.department);
                taskRowItems.push(task.completed ? 'はい' : 'いいえ');
                taskRowItems.push(task.notes || '');
            } else {
                taskRowItems.push('', '', '', '', '');
            }
        }
        
        const fullRow = [...projectRow, ...taskRowItems];
        return fullRow.map(escapeCSV).join(',');
    });

    return [header.join(','), ...rows].join('\n');
  };

  const handleDownloadCSV = () => {
    const csvData = convertToCSV(allProjects);
    const blob = new Blob([`\uFEFF${csvData}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    link.setAttribute("download", `all_projects_with_tasks_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold tracking-tight">プロジェクト一覧</h2>
         <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownloadCSV}>
                <Download className="mr-2 h-4 w-4" />
                全物件データをCSVダウンロード
            </Button>
            <AddProjectDialog>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    新規物件を追加
                </Button>
            </AddProjectDialog>
        </div>
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
