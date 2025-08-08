"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./auth-context";
import type { Project, Task } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { PROJECT_COLORS } from '@/lib/colors';

interface AppContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'status' | 'color'>) => Promise<void>;
  updateProject: (projectId: string, updatedData: Partial<Omit<Project, 'id' | 'color'>>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  updateTask: (projectId: string, taskId: string, updatedData: Partial<Task>) => Promise<void>;
  getTasksForDate: (date: string) => { project: Project; task: Task }[];
  getDeadlinesForDate: (date: string) => Project[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const assignColorsToProjects = (projects: Omit<Project, 'color'>[]): Project[] => {
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
  const [internalProjects, setInternalProjects] = useState<Omit<Project, 'color'>[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "projects"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsData: Omit<Project, 'color'>[] = [];
      querySnapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() } as Omit<Project, 'color'>);
      });
      setInternalProjects(projectsData);
    }, (error) => {
      console.error("Error fetching projects:", error);
      toast({
        title: "データの取得に失敗しました",
        description: "プロジェクト一覧を読み込めませんでした。",
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  }, [user, toast]);

  const projects = useMemo(() => assignColorsToProjects(internalProjects), [internalProjects]);

  const addProject = useCallback(async (projectData: Omit<Project, 'id' | 'status' | 'color'>) => {
    if (!user) return;
    try {
      const newProjectData = {
        ...projectData,
        status: 'in-progress' as const,
      };
      const docRef = await addDoc(collection(db, "projects"), newProjectData);
      console.log("Project added with ID: ", docRef.id);
      toast({
        title: "プロジェクトが追加されました",
        description: projectData.name,
      });
    } catch (error) {
      console.error("Error adding project: ", error);
      toast({
        title: "エラー",
        description: "プロジェクトの追加に失敗しました。",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const updateProject = useCallback(async (projectId: string, updatedData: Partial<Omit<Project, 'id'|'color'>>) => {
    if (!user) return;
    const projectDoc = doc(db, "projects", projectId);
    try {
      await updateDoc(projectDoc, updatedData);
      toast({
        title: "プロジェクトが更新されました",
        description: updatedData.status ? `ステータスを「${updatedData.status === 'completed' ? '完了' : '進行中'}」に変更しました。` : "プロジェクト情報が更新されました。",
      });
    } catch (error) {
      console.error("Error updating project: ", error);
      toast({
        title: "エラー",
        description: "プロジェクトの更新に失敗しました。",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const deleteProject = useCallback(async (projectId: string) => {
    if (!user) return;
    const projectToDelete = projects.find(p => p.id === projectId);
    try {
      await deleteDoc(doc(db, "projects", projectId));
      if (projectToDelete) {
        toast({
          title: "プロジェクトが削除されました",
          description: projectToDelete.name,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting project: ", error);
      toast({
        title: "エラー",
        description: "プロジェクトの削除に失敗しました。",
        variant: "destructive",
      });
    }
  }, [user, projects, toast]);

  const updateTask = useCallback(async (projectId: string, taskId: string, updatedData: Partial<Task>) => {
    if (!user) return;
    
    const project = internalProjects.find(p => p.id === projectId);
    if (!project) return;

    const updatedTasks = project.tasks.map(t => 
      t.id === taskId ? { ...t, ...updatedData } : t
    );
    
    let newStatus = project.status;
    const deliveryTask = updatedTasks.find(t => t.name === '納品');
    if (deliveryTask?.completed && project.status !== 'completed') {
      newStatus = 'completed';
    }
    
    const projectDoc = doc(db, "projects", projectId);
    try {
      await updateDoc(projectDoc, { tasks: updatedTasks, status: newStatus });
      
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

      if (project.status !== 'completed' && newStatus === 'completed') {
        toast({
            title: "プロジェクトが完了しました",
            description: project.name,
            variant: "default",
        });
      }

    } catch(error) {
      console.error("Error updating task: ", error);
      toast({
        title: "エラー",
        description: "タスクの更新に失敗しました。",
        variant: "destructive",
      });
    }
  }, [user, internalProjects, projects, toast]);

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

  const contextValue = {
    projects,
    addProject,
    updateProject,
    deleteProject,
    updateTask,
    getTasksForDate,
    getDeadlinesForDate,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  // This is a temporary solution to satisfy the type checker where we haven't implemented all methods.
  return context as AppContextType;
}
