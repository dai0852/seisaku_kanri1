"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import type { Project, Task } from '@/lib/types';
import { initialProjects } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";
import { PROJECT_COLORS } from '@/lib/colors';

interface AppContextType {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  addProject: (project: Omit<Project, 'id' | 'status' | 'color'>) => void;
  updateProject: (projectId: string, updatedData: Partial<Omit<Project, 'id' | 'color'>>) => void;
  updateTask: (projectId: string, taskId: string, updatedData: Partial<Task>) => void;
  getTasksForDate: (date: string) => { project: Project; task: Task }[];
  getDeadlinesForDate: (date: string) => Project[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const assignColorsToProjects = (projects: Omit<Project, 'color'>[]): Project[] => {
    // Sort projects by ID to maintain consistent coloring
    const sortedProjects = [...projects].sort((a, b) => a.id.localeCompare(b.id));
    const colorMap = new Map<string, string>();
    
    sortedProjects.forEach((project, index) => {
        colorMap.set(project.id, PROJECT_COLORS[index % PROJECT_COLORS.length]);
    });

    return projects.map(project => ({
        ...project,
        color: colorMap.get(project.id)!,
    }));
};


export function AppProvider({ children }: { children: ReactNode }) {
  const [internalProjects, setInternalProjects] = useState<Omit<Project, 'color'>[]>(initialProjects);
  const { toast } = useToast();

  const projects = useMemo(() => assignColorsToProjects(internalProjects), [internalProjects]);

  const setProjects = useCallback((newProjects: Project[] | ((prevState: Project[]) => Project[])) => {
    if (typeof newProjects === 'function') {
        setInternalProjects(prevInternal => {
            const currentProjects = assignColorsToProjects(prevInternal);
            const updatedProjects = newProjects(currentProjects);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return updatedProjects.map(({color, ...rest}) => rest);
        });
    } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setInternalProjects(newProjects.map(({color, ...rest}) => rest));
    }
  }, []);


  const addProject = useCallback((projectData: Omit<Project, 'id' | 'status' | 'color'>) => {
    const newProject: Omit<Project, 'color'> = {
      ...projectData,
      id: `proj-${Date.now()}`,
      status: 'in-progress',
    };
    setInternalProjects(prev => [...prev, newProject]);
    toast({
      title: "プロジェクトが追加されました",
      description: newProject.name,
    })
  }, [toast]);

  const updateProject = useCallback((projectId: string, updatedData: Partial<Omit<Project, 'id'|'color'>>) => {
    setInternalProjects(prev =>
      prev.map(p => (p.id === projectId ? { ...p, ...updatedData } : p))
    );
     toast({
      title: "プロジェクトが更新されました",
      description: updatedData.status ? `ステータスを「${updatedData.status === 'completed' ? '完了' : '進行中'}」に変更しました。` : "",
    })
  }, [toast]);

  const updateTask = useCallback((projectId: string, taskId: string, updatedData: Partial<Task>) => {
    let projectForToast: Omit<Project, 'color'> | undefined;
    let projectStatusChanged = false;
    
    setInternalProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          projectForToast = p;
          const updatedTasks = p.tasks.map(t =>
            t.id === taskId ? { ...t, ...updatedData } : t
          );
          
          let newStatus = p.status;
          
          const deliveryTask = updatedTasks.find(t => t.name === '納品');
          if (deliveryTask?.completed && p.status !== 'completed') {
            newStatus = 'completed';
            projectStatusChanged = true;
          }
          
          return {
            ...p,
            tasks: updatedTasks,
            status: newStatus,
          };
        }
        return p;
      })
    );

    const updatedProject = projects.find(p => p.id === projectId);
    const updatedTask = updatedProject?.tasks.find(t => t.id === taskId);

    if (updatedData.completed !== undefined) {
      toast({
          title: updatedData.completed ? "タスク完了" : "タスクを未完了に戻しました",
          description: `${updatedProject?.name} - ${updatedTask?.name ?? ''}`
      });
    } else if (updatedData.dueDate) {
        toast({
            title: "タスクの期日が変更されました",
        });
    } else {
        toast({
            title: "タスクが更新されました",
        });
    }
    
    if (projectForToast && projectStatusChanged) {
        toast({
            title: "プロジェクトが完了しました",
            description: projectForToast.name,
            variant: "default",
        });
    }
  }, [projects, toast]);

  const getTasksForDate = useCallback((date: string): { project: Project; task: Task }[] => {
    return projects
        .filter(p => p.status === 'in-progress')
        .flatMap(project => 
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
