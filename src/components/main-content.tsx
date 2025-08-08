"use client";

import { FolderKanban, CalendarClock, CheckCircle, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthlyScheduleTab } from "@/components/monthly-schedule-tab";
import { DeadlineCalendarTab } from "@/components/deadline-calendar-tab";
import { OverallManagementTab } from "./overall-management-tab";

export function MainContent() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Seisaku Manager</h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <Tabs defaultValue="overall" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="overall">
              <FolderKanban className="mr-2 h-4 w-4" />
              全体管理
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <CalendarClock className="mr-2 h-4 w-4" />
              月間スケジュール
            </TabsTrigger>
            <TabsTrigger value="deadline">
              <CalendarClock className="mr-2 h-4 w-4" />
              納期カレンダー
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overall" className="mt-6">
            <OverallManagementTab />
          </TabsContent>
          <TabsContent value="schedule" className="mt-6">
            <MonthlyScheduleTab />
          </TabsContent>
          <TabsContent value="deadline" className="mt-6">
            <DeadlineCalendarTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
