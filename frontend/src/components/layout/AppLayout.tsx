import React, { useState } from 'react';
import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppSidebar from './AppSidebar';
import { cn } from '@/lib/utils';
import {
  Loader2, Menu, Search, Bell, ChevronRight,
  LayoutDashboard, FolderKanban, CheckSquare, Users2, Settings, MoreHorizontal, LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/team': 'Team',
  '/settings': 'Settings',
};

const bottomNavItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Users2, label: 'Team', path: '/team' },
];

const AppLayout: React.FC = () => {
  const { user, isLoading, logout, isAdmin } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const currentLabel = routeLabels[location.pathname] || 'Page';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Top Header Bar */}
      <header
        className={cn(
          'fixed top-0 right-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 sm:px-6 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
          isMobile ? 'left-0' : sidebarCollapsed ? 'left-[88px]' : 'left-[280px]'
        )}
      >
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground font-medium">ProjectFlow</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span className="font-semibold text-foreground">{currentLabel}</span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 h-9 w-48 lg:w-64 text-sm bg-secondary/50 border-border/60 rounded-xl"
              readOnly
            />
          </div>

          {/* Notification Bell */}
          <Button variant="ghost" size="icon" className="h-9 w-9 relative rounded-xl">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </Button>

          {/* User avatar */}
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarFallback className="text-[10px] font-bold" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
              {user?.name ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main
        className={cn(
          'min-h-screen transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] pt-16 bg-background',
          isMobile ? 'ml-0 pb-20' : sidebarCollapsed ? 'ml-[88px]' : 'ml-[280px]'
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 h-16 bg-background/95 backdrop-blur-xl border-t border-border flex items-center justify-around px-2">
          {bottomNavItems.map(item => {
            if (item.path === '/team' && !isAdmin) return null;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => cn('bottom-nav-item', isActive && 'active')}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            );
          })}
          {/* More menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="bottom-nav-item">
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-[10px] font-medium">More</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mb-2">
              <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                <Settings className="h-4 w-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { logout(); window.location.href = '/auth'; }} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      )}
    </div>
  );
};

export default AppLayout;
