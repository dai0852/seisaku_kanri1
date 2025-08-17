"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, Firestore } from "firebase/firestore";
import { getFirebaseInstances } from "@/lib/firebase";
import { useAuth } from "./auth-context";
import type { Project, Task } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { PROJECT_COLORS } from '@/lib/colors';

interface AppContextType {
  projects: Project[];
  allProjects: Project[];
  addProject: (project: Omit<Project, 'id' | 'status' | 'color'>) => Promise<void>;
  updateProject: (projectId: string, updatedData: Partial<Omit<Project, 'id' | 'color'>>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  updateTask: (projectId: string, taskId: string, updatedData: Partial<Task>) => Promise<void>;
  getTasksForDate: (date: string) => { project: Project; task: Task }[];
  getDeadlinesForDate: (date: string) => Project[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const assignColorsToProjects = (projects: Omit<Project, 'color'>[]): Project[] => {
    const sortedProjects = [...projects].sort((a, b) => a.name.localeCompare(b.name));
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
  const [dbInstance, setDbInstance] = useState<Firestore | null>(null);

  useEffect(() => {
    getFirebaseInstances().then(instances => setDbInstance(instances.db)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!user || !dbInstance) return;

    const q = query(collection(dbInstance, "projects"));
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
  }, [user, dbInstance, toast]);

  const allProjects = useMemo(() => assignColorsToProjects(internalProjects), [internalProjects]);
  const projects = useMemo(() => allProjects.filter(p => p.status !== 'deleted'), [allProjects]);


  const addProject = useCallback(async (projectData: Omit<Project, 'id' | 'status' | 'color'>) => {
    if (!user || !dbInstance) return;
    try {
      const newProjectData = {
        ...projectData,
        status: 'in-progress' as const,
        link: projectData.link || '',
        notes: projectData.notes || '',
      };
      const docRef = await addDoc(collection(dbInstance, "projects"), newProjectData);
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
  }, [user, dbInstance, toast]);

  const updateProject = useCallback(async (projectId: string, updatedData: Partial<Omit<Project, 'id'|'color'>>) => {
    if (!user || !dbInstance) return;
    const projectDoc = doc(dbInstance, "projects", projectId);
    try {
      const dataToUpdate: Partial<Project> = { ...updatedData };
      
      // If deadline is being updated, also update the "納品" task's due date.
      if (updatedData.deadline) {
        const projectToUpdate = internalProjects.find(p => p.id === projectId);
        if (projectToUpdate) {
            const deliveryTaskIndex = projectToUpdate.tasks.findIndex(t => t.name === '納品');
            if (deliveryTaskIndex > -1) {
                const updatedTasks = [...projectToUpdate.tasks];
                updatedTasks[deliveryTaskIndex] = {
                    ...updatedTasks[deliveryTaskIndex],
                    dueDate: updatedData.deadline,
                };
                dataToUpdate.tasks = updatedTasks;
            }
        }
      }

      if (updatedData.tasks) {
        dataToUpdate.tasks = updatedData.tasks;
      }
      if ('link' in updatedData) {
        dataToUpdate.link = updatedData.link || '';
      }
      if ('notes' in updatedData) {
        dataToUpdate.notes = updatedData.notes || '';
      }

      await updateDoc(projectDoc, dataToUpdate);
      toast({
        title: "プロジェクトが更新されました",
        description: "プロジェクト情報が正常に更新されました。",
      });
    } catch (error) {
      console.error("Error updating project: ", error);
      toast({
        title: "エラー",
        description: "プロジェクトの更新に失敗しました。",
        variant: "destructive",
      });
    }
  }, [user, dbInstance, toast, internalProjects]);

  const deleteProject = useCallback(async (projectId: string) => {
    if (!user || !dbInstance) return;
    const projectToDelete = allProjects.find(p => p.id === projectId);
    try {
      await updateDoc(doc(dbInstance, "projects", projectId), { status: 'deleted' });
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
  }, [user, dbInstance, allProjects, toast]);

  const updateTask = useCallback(async (projectId: string, taskId: string, updatedData: Partial<Task>) => {
    if (!user || !dbInstance) return;
    
    const project = internalProjects.find(p => p.id === projectId);
    if (!project) return;

    const updatedTasks = project.tasks.map(t => 
      t.id === taskId ? { ...t, ...updatedData } : t
    );
    
    const updates: Partial<Project> = { tasks: updatedTasks };

    const taskBeingUpdated = project.tasks.find(t => t.id === taskId);
    if (taskBeingUpdated?.name === '納品' && updatedData.dueDate) {
        updates.deadline = updatedData.dueDate;
    }

    const deliveryTask = updatedTasks.find(t => t.name === '納品');
    if (deliveryTask?.completed && project.status !== 'completed') {
      updates.status = 'completed';
    } else if (deliveryTask && !deliveryTask.completed && project.status === 'completed') {
      updates.status = 'in-progress';
    }
    
    const projectDoc = doc(dbInstance, "projects", projectId);
    try {
      await updateDoc(projectDoc, updates);
      
      const updatedProject = projects.find(p => p.id === projectId);
      const updatedTask = updatedProject?.tasks.find(t => t.id === taskId);
      
      if (updatedData.completed !== undefined) {
        toast({
          title: updatedData.completed ? "タスク完了" : "タスクを未完了に戻しました",
          description: `${updatedProject?.name ?? ''} - ${updatedTask?.name ?? ''}`
        });
      } else if (updatedData.dueDate) {
        toast({
          title: "タスクの期日が変更されました",
        });
      }

      if (project.status !== 'completed' && updates.status === 'completed') {
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
  }, [user, dbInstance, internalProjects, projects, toast]);

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

  const contextValue = useMemo(() => ({
    projects,
    allProjects,
    addProject,
    updateProject,
    deleteProject,
    updateTask,
    getTasksForDate,
    getDeadlinesForDate,
  }), [projects, allProjects, addProject, updateProject, deleteProject, updateTask, getTasksForDate, getDeadlinesForDate]);

  if (!dbInstance) {
    return null; // Or a loading spinner, but AuthProvider should handle the main loading state
  }

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
  return context as AppContextType;
}
