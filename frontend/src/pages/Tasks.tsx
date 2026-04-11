import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search, MessageSquare, Calendar, Send, GripVertical, Plus,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-muted-foreground' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-warning' },
  { id: 'review', label: 'Review', color: 'bg-primary' },
  { id: 'completed', label: 'Completed', color: 'bg-success' },
];

const Tasks: React.FC = () => {
  const { tasks, projects, getTaskComments, addComment, updateTaskStatus, getProject, createTask } = useData();
  const { user, isAdmin, users } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', projectId: '', priority: 'medium' as TaskPriority,
    status: 'todo' as TaskStatus, dueDate: '', assignedTo: [] as string[],
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getColumnTasks = (status: TaskStatus) => filteredTasks.filter(t => t.status === status);
  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown';
  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const handleDragStart = (taskId: string) => setDraggedTask(taskId);
  const handleDrop = async (status: TaskStatus) => {
    if (!draggedTask) return;
    try {
      await updateTaskStatus(draggedTask, status);
      toast({ title: 'Task moved', description: `Moved to ${status.replace('-', ' ')}` });
    } catch (error) {
      toast({ title: 'Error moving task', variant: 'destructive' });
    }
    setDraggedTask(null);
  };

  const handleOpenComments = (task: Task) => {
    setSelectedTask(task);
    setIsCommentsOpen(true);
  };

  const handleAddComment = async () => {
    if (!selectedTask || !newComment.trim()) return;
    try {
      await addComment(selectedTask.id, newComment);
      setNewComment('');
      toast({ title: 'Comment Added' });
    } catch (error) {
      toast({ title: 'Error adding comment', variant: 'destructive' });
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.title.trim() || !taskForm.projectId) {
      toast({ title: 'Missing fields', description: 'Title and project are required.', variant: 'destructive' });
      return;
    }
    try {
      await createTask({
        title: taskForm.title, description: taskForm.description, projectId: taskForm.projectId,
        priority: taskForm.priority, status: taskForm.status,
        assignedTo: taskForm.assignedTo,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate) : undefined,
      });
      toast({ title: 'Task Created', description: `"${taskForm.title}" has been added.` });
      setIsAddOpen(false);
      setTaskForm({ title: '', description: '', projectId: '', priority: 'medium', status: 'todo', dueDate: '', assignedTo: [] });
    } catch (error: any) {
      toast({ 
        title: 'Error Creating Task', 
        description: error.response?.data?.message || 'Failed to create task',
        variant: 'destructive' 
      });
    }
  };

  const taskComments = selectedTask ? getTaskComments(selectedTask.id) : [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? 'Manage all tasks across projects.' : 'View and update your assigned tasks.'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsAddOpen(true)} className="rounded-xl h-10 gap-1.5">
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10 text-sm rounded-xl" />
        </div>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | 'all')}>
          <SelectTrigger className="w-36 h-10 text-sm rounded-xl"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
        {COLUMNS.map(col => {
          const colTasks = getColumnTasks(col.id);
          return (
            <div key={col.id} className="kanban-column"
              onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(col.id)}>
              <div className="flex items-center gap-2.5 mb-4 px-1">
                <div className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">{col.label}</span>
                <span className="ml-auto h-5 w-5 rounded-full bg-secondary text-[10px] font-bold flex items-center justify-center text-muted-foreground">{colTasks.length}</span>
              </div>
              <div className="space-y-3 min-h-[200px] p-2 rounded-2xl bg-secondary/40">
                {colTasks.map(task => {
                  const project = getProject(task.projectId);
                  return (
                    <div key={task.id} className="kanban-card" draggable onDragStart={() => handleDragStart(task.id)}>
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-snug">{task.title}</p>
                          {project && <p className="text-[11px] text-muted-foreground mt-1">{project.name}</p>}
                          <div className="flex items-center gap-2 mt-3">
                            <span className={`status-badge text-[10px] px-2 py-0.5 ${getPriorityClass(task.priority)}`}>{task.priority}</span>
                            {task.dueDate && (
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(task.dueDate), 'MMM d')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                            <div className="flex -space-x-1.5">
                              {task.assignedTo.slice(0, 2).map(uid => (
                                <Avatar key={uid} className="h-6 w-6 border-2 border-card">
                                  <AvatarFallback className="text-[8px] font-bold bg-accent text-accent-foreground">
                                    {getInitials(getUserName(uid))}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleOpenComments(task); }}
                              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span className="text-[11px] font-medium">{getTaskComments(task.id).length}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">Drop tasks here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Create New Task</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Task Title</Label>
              <Input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Enter task title" className="rounded-xl h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Description</Label>
              <Textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Describe the task" rows={3} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Project</Label>
                <Select value={taskForm.projectId} onValueChange={(v) => setTaskForm({ ...taskForm, projectId: v })}>
                  <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Priority</Label>
                <Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v as TaskPriority })}>
                  <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Status</Label>
                <Select value={taskForm.status} onValueChange={(v) => setTaskForm({ ...taskForm, status: v as TaskStatus })}>
                  <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Due Date</Label>
                <Input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="rounded-xl h-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Assign Members</Label>
              <div className="space-y-2 max-h-28 overflow-y-auto p-2 border rounded-xl">
                {users.map(u => (
                  <div key={u.id} className="flex items-center space-x-2">
                    <Checkbox id={`task-user-${u.id}`} checked={taskForm.assignedTo.includes(u.id)}
                      onCheckedChange={() => setTaskForm(f => ({ ...f, assignedTo: f.assignedTo.includes(u.id) ? f.assignedTo.filter(id => id !== u.id) : [...f.assignedTo, u.id] }))} />
                    <Label htmlFor={`task-user-${u.id}`} className="text-sm font-normal cursor-pointer">{u.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleCreateTask} className="rounded-xl">Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh]">
          <DialogHeader><DialogTitle className="text-base">{selectedTask?.title}</DialogTitle></DialogHeader>
          <ScrollArea className="h-56 pr-4">
            {taskComments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No comments yet.</p>
            ) : (
              <div className="space-y-4">
                {taskComments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-[10px] font-bold bg-secondary text-foreground">{getInitials(c.userName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{c.userName}</span>
                        <span className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                      </div>
                      <p className="text-sm text-foreground mt-1">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="flex gap-2 pt-3 border-t">
            <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..."
              className="text-sm h-10 rounded-xl" onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} />
            <Button onClick={handleAddComment} disabled={!newComment.trim()} size="sm" className="h-10 px-4 rounded-xl">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
