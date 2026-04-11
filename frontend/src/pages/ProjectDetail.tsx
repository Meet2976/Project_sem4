import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  MessageSquare,
  Calendar,
  Send,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, getProjectTasks, createTask, updateTask, deleteTask, updateTaskStatus, getTaskComments, addComment } = useData();
  const { isAdmin, user, users } = useAuth();
  const { toast } = useToast();

  const project = getProject(id || '');
  const tasks = getProjectTasks(id || '');
  const employees = users.filter(u => u.role === 'employee');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    dueDate: '',
    assignedTo: [] as string[],
  });

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Project not found</h2>
        <Button variant="link" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      assignedTo: [],
    });
  };

  const handleCreateTask = async () => {
    if (!formData.title.trim()) {
      toast({ title: 'Error', description: 'Task title is required', variant: 'destructive' });
      return;
    }

    try {
      await createTask({
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        projectId: project.id,
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      });

      toast({ title: 'Task Created', description: `"${formData.title}" has been added.` });
      setIsCreateOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to create task', variant: 'destructive' });
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      assignedTo: task.assignedTo || [],
    });
    setIsEditOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    try {
      await updateTask(selectedTask.id, {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      });

      toast({ title: 'Task Updated' });
      setIsEditOpen(false);
      setSelectedTask(null);
      resetForm();
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update task', variant: 'destructive' });
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;
    try {
      await deleteTask(deleteTaskId);
      toast({ title: 'Task Deleted' });
      setDeleteTaskId(null);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete task', variant: 'destructive' });
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, status);
      toast({ title: 'Status Updated' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
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
      toast({ title: 'Error', description: 'Failed to add comment', variant: 'destructive' });
    }
  };

  const toggleEmployee = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(employeeId)
        ? prev.assignedTo.filter(id => id !== employeeId)
        : [...prev.assignedTo, employeeId],
    }));
  };

  const getStatusClass = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'status-todo';
      case 'in-progress': return 'status-progress';
      case 'completed': return 'status-completed';
    }
  };

  const getPriorityClass = (priority: TaskPriority) => {
    switch (priority) {
      case 'low': return 'priority-low';
      case 'medium': return 'priority-medium';
      case 'high': return 'priority-high';
      case 'urgent': return 'priority-urgent';
    }
  };

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Unknown';
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
  };

  const taskComments = selectedTask ? getTaskComments(selectedTask.id) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <p className="text-muted-foreground mt-1">{project.description}</p>
        </div>
        {isAdmin && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Add a task to this project.</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Task title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Task description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as TaskStatus })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as TaskPriority })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                    {employees.map((emp) => (
                      <div key={emp.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`task-emp-${emp.id}`}
                          checked={formData.assignedTo.includes(emp.id)}
                          onCheckedChange={() => toggleEmployee(emp.id)}
                        />
                        <Label htmlFor={`task-emp-${emp.id}`} className="text-sm font-normal cursor-pointer">
                          {emp.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateTask}>Create Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-lg font-medium">No tasks yet</h3>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? 'Add the first task to get started.' : 'No tasks have been assigned yet.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id} className="card-interactive">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-foreground">{task.title}</h3>
                      <span className={`status-badge ${getStatusClass(task.status)}`}>
                        {task.status.replace('-', ' ')}
                      </span>
                      <span className={`status-badge ${getPriorityClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {getTaskComments(task.id).length}
                      </div>
                      
                      {task.assignedTo.length > 0 && (
                        <div className="flex -space-x-2">
                          {task.assignedTo.slice(0, 3).map((userId) => (
                            <Avatar key={userId} className="h-6 w-6 border-2 border-card">
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {getInitials(getUserName(userId))}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {task.assignedTo.length > 3 && (
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-card">
                              +{task.assignedTo.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Status Update - for employees */}
                    {!isAdmin && task.assignedTo.includes(user?.id || '') && (
                      <Select
                        value={task.status}
                        onValueChange={(v) => handleStatusChange(task.id, v as TaskStatus)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    
                    <Button variant="ghost" size="icon" onClick={() => handleOpenComments(task)}>
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditTask(task)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteTaskId(task.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Task Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as TaskStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as TaskPriority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Assign To</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                {employees.map((emp) => (
                  <div key={emp.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-task-emp-${emp.id}`}
                      checked={formData.assignedTo.includes(emp.id)}
                      onCheckedChange={() => toggleEmployee(emp.id)}
                    />
                    <Label htmlFor={`edit-task-emp-${emp.id}`} className="text-sm font-normal cursor-pointer">
                      {emp.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateTask}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Comments - {selectedTask?.title}</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-64 pr-4">
            {taskComments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-4">
                {taskComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {getInitials(comment.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comment.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <div className="flex gap-2 pt-4 border-t">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <Button onClick={handleAddComment} disabled={!newComment.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectDetail;
