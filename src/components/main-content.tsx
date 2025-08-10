"use client";

import { FolderKanban, CalendarClock, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthlyScheduleTab } from "@/components/monthly-schedule-tab";
import { DeadlineCalendarTab } from "@/components/deadline-calendar-tab";
import { OverallManagementTab } from "./overall-management-tab";
import { Card } from "./ui/card";
import { useAuth } from "@/context/auth-context";
import { Button } from "./ui/button";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { FullPageLoader } from "./full-page-loader";
import { AppProvider } from "@/context/app-context";

export function MainContent() {
  const { user, approved, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
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
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <main className="flex-1 space-y-8 p-4 md:p-8 lg:p-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center shadow-md">
                <FolderKanban className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">制作工程管理マネージャー</h1>
                <p className="text-muted-foreground">生産タスクとスケジュールを管理するためのアプリケーション</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </Button>
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
    </AppProvider>
  );
}
