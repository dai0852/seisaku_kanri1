"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Project, Task } from '@/lib/types';
import { initialProjects } from '@/lib/data';
import { useToast } from "@/hooks/use-toast"

interface AppContextType {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  addProject: (project: Omit<Project, 'id' | 'status'>) => void;
  updateProject: (projectId: string, updatedData: Partial<Project>) => void;
  updateTask: (projectId: string, taskId: string, updatedData: Partial<Task>) => void;
  getTasksForDate: (date: string) => { project: Project; task: Task }[];
  getDeadlinesForDate: (date: string) => Project[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const { toast } = useToast();

  const addProject = useCallback((projectData: Omit<Project, 'id' | 'status'>) => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      status: 'in-progress',
    };
    setProjects(prev => [...prev, newProject]);
    toast({
      title: "プロジェクトが追加されました",
      description: newProject.name,
    })
  }, [toast]);

  const updateProject = useCallback((projectId: string, updatedData: Partial<Project>) => {
    setProjects(prev =>
      prev.map(p => (p.id === projectId ? { ...p, ...updatedData } : p))
    );
     toast({
      title: "プロジェクトが更新されました",
      description: updatedData.status === 'in-progress' ? "ステータスを「進行中」に変更しました。" : "",
    })
  }, [toast]);

  const updateTask = useCallback((projectId: string, taskId: string, updatedData: Partial<Task>) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          const updatedTasks = p.tasks.map(t =>
            t.id === taskId ? { ...t, ...updatedData } : t
          );
          
          // Allow manual status change back to in-progress, so only auto-complete.
          const allTasksCompleted = updatedTasks.every(t => t.completed);
          const newStatus = allTasksCompleted && updatedTasks.length > 0 ? 'completed' : p.status;
          
          // If the project is being completed, but the user manually set it to in-progress, respect that.
          const finalStatus = p.status === 'in-progress' && newStatus === 'completed' ? 'completed' : p.status;

          return {
            ...p,
            tasks: updatedTasks,
            status: finalStatus,
          };
        }
        return p;
      })
    );
    if(updatedData.completed !== undefined) {
         toast({
            title: updatedData.completed ? "タスク完了" : "タスクを未完了に戻しました",
        });
    } else {
        toast({
            title: "タスクが更新されました",
        });
    }
  }, [toast]);

  const getTasksForDate = useCallback((date: string): { project: Project; task: Task }[] => {
    return projects.flatMap(project => 
        project.tasks
            .filter(task => task.dueDate === date)
            .map(task => ({project, task}))
    );
  }, [projects]);

  const getDeadlinesForDate = useCallback((date: string): Project[] => {
    return projects.filter(project => project.deadline === date);
  }, [projects]);


  return (
    <AppContext.Provider value={{ projects, setProjects, addProject, updateProject, updateTask, getTasksForDate, getDeadlinesForDate }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
