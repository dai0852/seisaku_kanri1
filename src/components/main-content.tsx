"use client";

import { FolderKanban, CalendarClock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthlyScheduleTab } from "@/components/monthly-schedule-tab";
import { DeadlineCalendarTab } from "@/components/deadline-calendar-tab";
import { OverallManagementTab } from "./overall-management-tab";
import { Card } from "./ui/card";

export function MainContent() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex-1 space-y-8 p-4 md:p-8 lg:p-10">
        <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <FolderKanban className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Seisaku Manager</h1>
              <p className="text-muted-foreground">生産タスクとスケジュールを管理するためのアプリケーション</p>
            </div>
        </div>
        <Tabs defaultValue="overall" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 md:w-auto h-auto">
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
           <Card className="mt-6">
            <TabsContent value="overall" className="m-0 p-6">
              <OverallManagementTab />
            </TabsContent>
            <TabsContent value="schedule" className="m-0 p-6">
              <MonthlyScheduleTab />
            </TabsContent>
            <TabsContent value="deadline" className="m-0 p-6">
              <DeadlineCalendarTab />
            </TabsContent>
          </Card>
        </Tabs>
      </main>
    </div>
  );
}
