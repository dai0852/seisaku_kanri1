"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InProgressProjectsTab } from "./in-progress-projects-tab";
import { CompletedProjectsTab } from "./completed-projects-tab";
import { ListChecks, ListTodo } from "lucide-react";

export function OverallManagementTab() {
  return (
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
  );
}
