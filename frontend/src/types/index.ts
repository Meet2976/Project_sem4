// User & Auth Types
export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  status?: 'active' | 'inactive';
  createdAt: Date;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  createdBy: string;
  assignedMembers: string[];
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}

// Task Types
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assignedTo: string[];
  createdBy: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Comment Types
export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

// Activity Types
export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: Date;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  teamMembers: number;
  recentActivities: Activity[];
}

