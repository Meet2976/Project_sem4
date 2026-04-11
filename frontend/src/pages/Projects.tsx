import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Users,
  Calendar,
  FolderKanban,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Projects: React.FC = () => {
  const { projects, createProject, updateProject, deleteProject, getProjectTasks } = useData();
  const { isAdmin, users } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as Project['status'],
    dueDate: '',
    assignedMembers: [] as string[],
  });

  const employees = users.filter(u => u.role === 'employee');

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active',
      dueDate: '',
      assignedMembers: [],
    });
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Project name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createProject({
        name: formData.name,
        description: formData.description,
        status: formData.status,
        assignedMembers: formData.assignedMembers,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      });

      toast({
        title: 'Project Created',
        description: `"${formData.name}" has been created successfully.`,
      });

      setIsCreateOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create project',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      dueDate: project.dueDate ? format(new Date(project.dueDate), 'yyyy-MM-dd') : '',
      assignedMembers: project.assignedMembers || [],
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedProject || !formData.name.trim()) return;

    try {
      await updateProject(selectedProject.id, {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        assignedMembers: formData.assignedMembers,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      });

      toast({
        title: 'Project Updated',
        description: `"${formData.name}" has been updated.`,
      });

      setIsEditOpen(false);
      setSelectedProject(null);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update project',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteProjectId) return;
    
    try {
      const project = projects.find(p => p.id === deleteProjectId);
      await deleteProject(deleteProjectId);
      
      toast({
        title: 'Project Deleted',
        description: `"${project?.name}" has been deleted.`,
      });
      
      setDeleteProjectId(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete project',
        variant: 'destructive',
      });
    }
  };

  const toggleEmployee = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedMembers: prev.assignedMembers.includes(employeeId)
        ? prev.assignedMembers.filter(id => id !== employeeId)
        : [...prev.assignedMembers, employeeId],
    }));
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return 'status-progress';
      case 'completed': return 'status-completed';
      case 'on-hold': return 'status-todo';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? 'Manage all projects and team assignments.' : 'View your assigned projects.'}
          </p>
        </div>
        
        {isAdmin && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Add a new project and assign team members.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter project name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the project"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as Project['status'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Assign Employees</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                    {employees.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No employees available</p>
                    ) : (
                      employees.map((employee) => (
                        <div key={employee.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`emp-${employee.id}`}
                            checked={formData.assignedMembers.includes(employee.id)}
                            onCheckedChange={() => toggleEmployee(employee.id)}
                          />
                          <Label htmlFor={`emp-${employee.id}`} className="text-sm font-normal cursor-pointer">
                            {employee.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No projects found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery ? 'Try a different search term.' : isAdmin ? 'Create your first project to get started.' : 'No projects have been assigned to you yet.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const projectTasks = getProjectTasks(project.id);
            const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
            
            return (
              <Card 
                key={project.id} 
                className="card-interactive cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                      <span className={`status-badge mt-2 ${getStatusClass(project.status)}`}>
                        {project.status.replace('-', ' ')}
                      </span>
                    </div>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(project); }}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); setDeleteProjectId(project.id); }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {project.description || 'No description'}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{project.assignedMembers?.length || 0}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <span>{completedTasks}/{projectTasks.length} tasks</span>
                    </div>
                    
                    {project.dueDate && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(project.dueDate), 'MMM d')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project details and assignments.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Project Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Project['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Assign Employees</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-emp-${employee.id}`}
                      checked={formData.assignedMembers.includes(employee.id)}
                      onCheckedChange={() => toggleEmployee(employee.id)}
                    />
                    <Label htmlFor={`edit-emp-${employee.id}`} className="text-sm font-normal cursor-pointer">
                      {employee.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project and all its tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Projects;
