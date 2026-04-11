import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, User, Sun, Moon, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('ProjectFlow Workspace');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSave = () => {
    toast({ title: 'Settings Saved', description: 'Your preferences have been updated.' });
  };

  const toggleTheme = (t: 'light' | 'dark') => {
    setTheme(t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and workspace preferences.</p>
      </div>

      {/* Profile Settings */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
          <User className="h-4 w-4 text-primary" /> Profile Settings
        </h2>
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg font-bold" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
              {user?.name ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base font-semibold text-foreground">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-1">
              {user?.role === 'admin' ? <Shield className="h-3.5 w-3.5 text-primary" /> : <User className="h-3.5 w-3.5 text-muted-foreground" />}
              <span className="text-xs text-muted-foreground capitalize font-medium">{user?.role}</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Name</Label>
            <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="h-10 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Email</Label>
            <Input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="h-10 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Password</Label>
            <Input type="password" value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} placeholder="Enter new password" className="h-10 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Workspace Settings */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" /> Workspace Settings
        </h2>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Workspace Name</Label>
            <Input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="h-10 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => toggleTheme('light')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-accent/50' : 'border-border hover:border-primary/30'}`}
              >
                <Sun className="h-5 w-5 text-warning" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">Light</p>
                  <p className="text-[11px] text-muted-foreground">Default theme</p>
                </div>
              </button>
              <button
                onClick={() => toggleTheme('dark')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-accent/50' : 'border-border hover:border-primary/30'}`}
              >
                <Moon className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">Dark</p>
                  <p className="text-[11px] text-muted-foreground">Easier on eyes</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <Button onClick={handleSave} className="h-11 px-6 rounded-xl gap-2">
        <Save className="h-4 w-4" /> Save Changes
      </Button>
    </div>
  );
};

export default Settings;
