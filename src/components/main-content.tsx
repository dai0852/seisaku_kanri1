"use client";

import { FolderKanban, CalendarClock, LogOut, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthlyScheduleTab } from "@/components/monthly-schedule-tab";
import { DeadlineCalendarTab } from "@/components/deadline-calendar-tab";
import { OverallManagementTab } from "./overall-management-tab";
import { Card } from "./ui/card";
import { useAuth } from "@/context/auth-context";
import { Button } from "./ui/button";
import { getFirebaseInstances } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { FullPageLoader } from "./full-page-loader";
import { AppProvider, useAppContext } from "@/context/app-context";
import { DndWrapper } from "@/context/dnd-provider";
import type { Project } from "@/lib/types";
import { parseISO, compareAsc } from "date-fns";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

const CsvDownloadButton = () => {
    const { allProjects } = useAppContext();

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
        <Button variant="destructive" onClick={handleDownloadCSV} size="sm">
            <Download className="mr-0 md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">全物件データをCSVダウンロード</span>
        </Button>
    )
}

export function MainContent() {
  const { user, approved, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const { auth } = await getFirebaseInstances();
    await auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    // This case should be handled by the AuthProvider redirect, but as a fallback
    return <FullPageLoader />;
  }

  if (!approved) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-muted/40 gap-6 p-4 text-center">
        <div className="h-16 w-16 rounded-lg bg-primary flex items-center justify-center shadow-md">
            <FolderKanban className="h-8 w-8 text-primary-foreground" />
        </div>
        <div className="space-y-2">
            <h1 className="text-2xl font-bold">承認待ちです</h1>
            <p className="text-muted-foreground">
            アカウントは管理者の承認後に有効になります。
            <br />
            承認されるまで、しばらくお待ちください。
            </p>
        </div>
        <Button onClick={handleLogout}>ログインページに戻る</Button>
      </div>
    );
  }

  return (
    <AppProvider>
        <DndWrapper>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <main className="flex-1 space-y-4 md:space-y-8 p-4 md:p-8 lg:p-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center shadow-md shrink-0">
                        <FolderKanban className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold tracking-tight text-foreground">制作工程管理マネージャー</h1>
                        <p className="text-muted-foreground text-sm md:text-base">生産タスクとスケジュールを管理するためのアプリケーション</p>
                    </div>
                    </div>
                    <div className="flex items-center gap-2 self-end">
                        <CsvDownloadButton />
                        <Button variant="outline" onClick={handleLogout} size="sm">
                            <LogOut className="mr-0 md:mr-2 h-4 w-4" />
                           <span className="hidden md:inline">ログアウト</span>
                        </Button>
                    </div>
                </div>
                <Tabs defaultValue="overall" className="w-full">
                    <ScrollArea className="w-full whitespace-nowrap">
                        <TabsList className="grid-cols-none inline-grid">
                        <TabsTrigger value="overall" className="py-2">
                            <FolderKanban className="mr-2 h-4 w-4" />
                            全体管理
                        </TabsTrigger>
                        <TabsTrigger value="schedule" className="py-2">
                            <CalendarClock className="mr-2 h-4 w-4" />
                            月間スケジュール
                        </TabsTrigger>
                        <TabsTrigger value="deadline" className="py-2">
                            <CalendarClock className="mr-2 h-4 w-4" />
                            納期カレンダー
                        </TabsTrigger>
                        </TabsList>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                    <Card className="mt-6">
                    <TabsContent value="overall" className="m-0 p-4 md:p-6">
                        <OverallManagementTab />
                    </TabsContent>
                    <TabsContent value="schedule" className="m-0 p-4 md:p-6">
                        <MonthlyScheduleTab />
                    </TabsContent>
                    <TabsContent value="deadline" className="m-0 p-4 md:p-6">
                        <DeadlineCalendarTab />
                    </TabsContent>
                    </Card>
                </Tabs>
                </main>
            </div>
      </DndWrapper>
    </AppProvider>
  );
}
