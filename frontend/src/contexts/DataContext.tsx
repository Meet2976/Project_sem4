import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, Task, Comment, DashboardStats, TaskStatus, TaskPriority } from '@/types';
import { useAuth } from './AuthContext';
import { projectAPI, taskAPI, dashboardAPI } from '@/services/api';

interface DataContextType {
  projects: Project[];
  getProject: (id: string) => Project | undefined;
  createProject: (data: any) => Promise<Project>;
  updateProject: (id: string, updates: any) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  tasks: Task[];
  getTask: (id: string) => Task | undefined;
  getProjectTasks: (projectId: string) => Task[];
  createTask: (data: any) => Promise<Task>;
  updateTask: (id: string, updates: any) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  comments: Comment[]; // Keeping for now, but backend lacks comment API yet
  getTaskComments: (taskId: string) => Comment[];
  addComment: (taskId: string, content: string) => Promise<Comment>;
  getDashboardStats: () => Promise<DashboardStats>;
  searchProjects: (query: string) => Project[];
  filterTasksByStatus: (status: TaskStatus | 'all') => Task[];
  filterTasksByPriority: (priority: TaskPriority | 'all') => Task[];
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [projRes, taskRes] = await Promise.all([
        projectAPI.getProjects(),
        taskAPI.getTasks(),
      ]);
      
      const mappedProjects = projRes.data.map((p: any) => ({
        ...p,
        id: p._id,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        dueDate: p.dueDate ? new Date(p.dueDate) : undefined
      }));
      
      const mappedTasks = taskRes.data.map((t: any) => ({
        ...t,
        id: t._id,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
        dueDate: t.dueDate ? new Date(t.dueDate) : undefined
      }));
      
      setProjects(mappedProjects);
      setTasks(mappedTasks);
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setProjects([]);
      setTasks([]);
    }
  }, [user]);

  const getProject = (id: string) => projects.find(p => p.id === id);

  const createProject = async (data: any): Promise<Project> => {
    const res = await projectAPI.createProject(data);
    const newProject = { 
      ...res.data, 
      id: res.data._id,
      createdAt: new Date(res.data.createdAt),
      updatedAt: new Date(res.data.updatedAt)
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = async (id: string, updates: any) => {
    const res = await projectAPI.updateProject(id, updates);
    const updated = {
      ...res.data,
      id: res.data._id,
      createdAt: new Date(res.data.createdAt),
      updatedAt: new Date(res.data.updatedAt)
    };
    setProjects(prev => prev.map(p => p.id === id ? updated : p));
  };

  const deleteProject = async (id: string) => {
    await projectAPI.deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
  };

  const getTask = (id: string) => tasks.find(t => t.id === id);
  const getProjectTasks = (projectId: string) => tasks.filter(t => t.projectId === projectId);

  const createTask = async (data: any): Promise<Task> => {
    const res = await taskAPI.createTask(data);
    const newTask = {
      ...res.data,
      id: res.data._id,
      createdAt: new Date(res.data.createdAt),
      updatedAt: new Date(res.data.updatedAt)
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = async (id: string, updates: any) => {
    const res = await taskAPI.updateTask(id, updates);
    const updated = {
      ...res.data,
      id: res.data._id,
      createdAt: new Date(res.data.createdAt),
      updatedAt: new Date(res.data.updatedAt)
    };
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
  };

  const deleteTask = async (id: string) => {
    await taskAPI.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    await updateTask(id, { status });
  };

  const getTaskComments = (taskId: string) => comments.filter(c => c.taskId === taskId);

  const addComment = async (taskId: string, content: string): Promise<Comment> => {
    // Current backend doesn't have comments, just mock locally for UI
    const c: Comment = { id: crypto.randomUUID(), content, taskId, userId: user?.id || '', userName: user?.name || 'Unknown', createdAt: new Date() };
    setComments(prev => [...prev, c]);
    return c;
  };

  const getDashboardStats = async (): Promise<DashboardStats> => {
    const res = await dashboardAPI.getStats();
    return {
      ...res.data,
      recentActivities: res.data.recentActivities.map((a: any) => ({
        ...a,
        id: a._id,
        timestamp: new Date(a.timestamp)
      }))
    };
  };

  const searchProjects = (query: string): Project[] => {
    if (!query) return projects;
    const lower = query.toLowerCase();
    return projects.filter(p => p.name.toLowerCase().includes(lower) || p.description.toLowerCase().includes(lower));
  };

  const filterTasksByStatus = (status: TaskStatus | 'all'): Task[] => {
    return status === 'all' ? tasks : tasks.filter(t => t.status === status);
  };

  const filterTasksByPriority = (priority: TaskPriority | 'all'): Task[] => {
    return priority === 'all' ? tasks : tasks.filter(t => t.priority === priority);
  };

  return (
    <DataContext.Provider value={{
      projects, getProject, createProject, updateProject, deleteProject,
      tasks, getTask, getProjectTasks, createTask, updateTask, deleteTask, updateTaskStatus,
      comments, getTaskComments, addComment,
      getDashboardStats, searchProjects, filterTasksByStatus, filterTasksByPriority,
      refreshData, isLoading
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};

