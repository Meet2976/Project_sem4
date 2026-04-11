import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/services/api';
import { User, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus, Search, Pencil, Trash2, Shield, Users2, MoreVertical, Mail, Phone,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const USERS_STORAGE_KEY = 'pm_users';

const Team: React.FC = () => {
  const { isAdmin, users, refreshUsers } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'employee' as UserRole, password: 'password123' });

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
  const resetForm = () => setFormData({ name: '', email: '', phone: '', role: 'employee', password: 'password123' });

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({ title: 'Missing fields', variant: 'destructive' }); return;
    }
    try {
      await userAPI.addEmployee(formData);
      await refreshUsers();
      toast({ title: 'Member added', description: `${formData.name} has been added.` });
      setIsAddOpen(false); resetForm();
    } catch (error: any) {
      toast({ 
        title: 'Error adding member', 
        description: error.response?.data?.message || 'Failed to add member',
        variant: 'destructive' 
      });
    }
  };

  const handleEditOpen = (u: User) => {
    setEditUser(u);
    setFormData({ name: u.name, email: u.email, phone: u.phone || '', role: u.role, password: '' });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    try {
      // Backend lacks explicit user update API in current routes, using addEmployee logic or assuming PUT /api/users/:id
      // For now, let's just show a toast or implement the PUT route in backend if needed.
      // Given the user request, I'll stick to what I implemented.
      toast({ title: 'Update not implemented', description: 'Backend update API for users not yet requested.' });
      setIsEditOpen(false); setEditUser(null); resetForm();
    } catch (error) {
      toast({ title: 'Error updating member', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    try {
      // Backend lacks explicit user delete API in current routes.
      toast({ title: 'Deletenot implemented', description: 'Backend delete API for users not yet requested.' });
      setDeleteUserId(null);
    } catch (error) {
      toast({ title: 'Error removing member', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? 'Manage team members and roles.' : 'View your team members.'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsAddOpen(true)} className="h-10 gap-1.5 rounded-xl">
            <Plus className="h-4 w-4" /> Add Member
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search members..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10 text-sm rounded-xl" />
      </div>

      {/* Team Cards */}
      {filteredUsers.length === 0 ? (
        <div className="p-12 rounded-2xl border border-border text-center bg-card">
          <Users2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No team members found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUsers.map(u => (
            <div key={u.id} className="bg-card rounded-2xl border border-border p-5 hover:border-primary/20 hover:shadow-sm transition-all relative group">
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditOpen(u)}><Pencil className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteUserId(u.id)} className="text-destructive focus:text-destructive">
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <div className="flex flex-col items-center text-center">
                <Avatar className="h-16 w-16 mb-3">
                  <AvatarFallback className="text-lg font-bold" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
                    {getInitials(u.name)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-semibold text-foreground">{u.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">{u.email}</p>
                </div>
                <span className={`mt-3 inline-flex items-center gap-1.5 status-badge ${u.role === 'admin' ? 'status-review' : 'status-completed'}`}>
                  {u.role === 'admin' && <Shield className="h-3 w-3" />}
                  {u.role === 'admin' ? 'Admin' : 'Employee'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full name" className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@company.com" className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Phone Number</Label>
              <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 000-0000" className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Role</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleAdd} className="rounded-xl">Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Member</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Role</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleUpdate} className="rounded-xl">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Team;
