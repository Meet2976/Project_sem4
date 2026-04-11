import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Calendar, ArrowRight, Clock, FolderKanban, CheckSquare,
  Users2, TrendingUp, Zap, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isTomorrow, isPast, addDays, isBefore } from 'date-fns';
import { DashboardStats } from '@/types';

const Dashboard: React.FC = () => {
  const { user, isAdmin, users } = useAuth();
  const { tasks, projects, getDashboardStats, getProject } = useData();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [getDashboardStats]);

  if (loading || !stats) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name: string) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
  
  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  const focusTasks = tasks
    .filter(t => {
      if (t.status === 'completed') return false;
      if (t.status === 'in-progress') return true;
      if (t.dueDate) {
        const d = new Date(t.dueDate);
        return isPast(d) || isToday(d) || isTomorrow(d) || isBefore(d, addDays(new Date(), 3));
      }
      return t.priority === 'urgent' || t.priority === 'high';
    })
    .sort((a, b) => {
      const po: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      return po[a.priority] - po[b.priority];
    })
    .slice(0, 6);

  const activeProjects = projects
    .filter(p => p.status === 'active')
    .map(p => {
      const pTasks = tasks.filter(t => t.projectId === p.id);
      const completed = pTasks.filter(t => t.status === 'completed').length;
      const progress = pTasks.length > 0 ? Math.round((completed / pTasks.length) * 100) : 0;
      return { ...p, progress, totalTasks: pTasks.length, completedTasks: completed };
    });

  const activities = stats.recentActivities;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'status-todo';
      case 'in-progress': return 'status-progress';
      case 'review': return 'status-review';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive';
      case 'high': return 'bg-priority-high';
      case 'medium': return 'bg-priority-medium';
      case 'low': return 'bg-success';
      default: return 'bg-muted-foreground';
    }
  };

  const formatDueLabel = (date: Date) => {
    const d = new Date(date);
    if (isPast(d) && !isToday(d)) return 'Overdue';
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'MMM d');
  };

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: FolderKanban, color: 'text-primary', bg: 'bg-accent' },
    { label: 'Active Tasks', value: stats.totalTasks - stats.completedTasks, icon: CheckSquare, color: 'text-warning', bg: 'bg-warning-bg' },
    { label: 'Team Members', value: stats.teamMembers, icon: Users2, color: 'text-success', bg: 'bg-success-bg' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp, color: 'text-info', bg: 'bg-info-bg' },
  ];

  // Employee simplified view
  if (!isAdmin) {
    const myTasks = tasks.filter(t => t.status !== 'completed');
    const myUpcoming = tasks
      .filter(t => t.dueDate && t.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
    const myProjects = projects.filter(p => p.status === 'active');

    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Here's what needs your attention.</p>
        </div>

        {/* My Tasks */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> My Tasks
            </h2>
            <button onClick={() => navigate('/tasks')} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2.5">
            {myTasks.slice(0, 5).map(task => {
              const project = getProject(task.projectId);
              return (
                <div key={task.id} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => navigate(`/projects/${task.projectId}`)}>
                  <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${getPriorityDot(task.priority)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{project?.name}</p>
                  </div>
                  <span className={`status-badge ${getStatusColor(task.status)}`}>{task.status.replace('-', ' ')}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Upcoming Deadlines */}
        <section>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Upcoming Deadlines
          </h2>
          <div className="space-y-2.5">
            {myUpcoming.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                </div>
                <span className={`text-xs font-semibold ${isPast(new Date(task.dueDate!)) ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {formatDueLabel(task.dueDate!)}
                </span>
              </div>
            ))}
            {myUpcoming.length === 0 && <p className="text-sm text-muted-foreground p-4">No upcoming deadlines.</p>}
          </div>
        </section>

        {/* Assigned Projects */}
        <section>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-primary" /> Assigned Projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myProjects.map(p => {
              const pTasks = tasks.filter(t => t.projectId === p.id);
              const completed = pTasks.filter(t => t.status === 'completed').length;
              const progress = pTasks.length > 0 ? Math.round((completed / pTasks.length) * 100) : 0;
              return (
                <div key={p.id} className="p-5 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => navigate(`/projects/${p.id}`)}>
                  <p className="text-sm font-semibold text-foreground">{p.name}</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>{completed}/{pTasks.length} tasks</span>
                      <span className="font-semibold text-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {stats.totalTasks - stats.completedTasks} tasks remaining across {stats.totalProjects} projects.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center justify-between mb-3">
              <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Today's Focus */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Today's Focus
          </h2>
          <button onClick={() => navigate('/tasks')} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
            All tasks <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        {focusTasks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-card border border-border text-center">
            <p className="text-sm text-muted-foreground">🎉 All caught up! No urgent tasks.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {focusTasks.map(task => {
              const project = getProject(task.projectId);
              return (
                <div key={task.id}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group"
                  onClick={() => navigate(`/projects/${task.projectId}`)}>
                  <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${getPriorityDot(task.priority)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{task.title}</p>
                    <span className="text-xs text-muted-foreground">{project?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`status-badge ${getStatusColor(task.status)}`}>{task.status.replace('-', ' ')}</span>
                    {task.dueDate && (
                      <span className={`text-xs font-semibold hidden sm:block ${isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {formatDueLabel(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Project Progress */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-primary" /> Project Progress
          </h2>
          <button onClick={() => navigate('/projects')} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
            All projects <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProjects.map(p => (
            <div key={p.id}
              className="p-5 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group"
              onClick={() => navigate(`/projects/${p.id}`)}>
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{p.name}</p>
                <span className="text-sm font-bold text-primary">{p.progress}%</span>
              </div>
              <Progress value={p.progress} className="h-2 mb-4" />
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {p.assignedMembers?.slice(0, 4).map(uid => (
                    <Avatar key={uid} className="h-7 w-7 border-2 border-card">
                      <AvatarFallback className="text-[9px] font-bold bg-accent text-accent-foreground">
                        {getInitials(getUserName(uid))}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {p.assignedMembers && p.assignedMembers.length > 4 && (
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[9px] font-semibold border-2 border-card text-muted-foreground">
                      +{p.assignedMembers.length - 4}
                    </div>
                  )}
                </div>
                {p.dueDate && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(p.dueDate), 'MMM d')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Activity Feed */}
      <section>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" /> Activity
        </h2>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="relative">
            <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border" />
            <div className="space-y-1">
              {activities.map(act => (
                <div key={act.id} className="flex gap-4 py-3 relative">
                  <Avatar className="h-[34px] w-[34px] flex-shrink-0 z-10 border-2 border-card">
                    <AvatarFallback className="text-[9px] font-bold bg-secondary text-foreground">
                      {getInitials(act.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{act.userName.split(' ')[0]}</span>
                      {' '}<span className="text-muted-foreground">{act.action}</span>{' '}
                      <span className="font-semibold">{act.target}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{format(act.timestamp, 'MMM d, h:mm a')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
