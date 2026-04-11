import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users2,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Users2, label: 'Team', path: '/team' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const AppSidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, isMobileOpen, onMobileClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleNavClick = () => {
    if (isMobile && onMobileClose) onMobileClose();
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const renderNav = (collapsed: boolean) => (
    <div className="flex flex-col h-full bg-white dark:bg-sidebar/95 backdrop-blur-xl relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-black/5 dark:before:from-white/5 before:to-transparent before:pointer-events-none">
      {/* Logo */}
      <div className={cn(
        'flex items-center h-20 px-6 relative z-10',
        collapsed ? 'justify-center px-4' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20" style={{ background: 'var(--gradient-primary)' }}>
              <FolderKanban className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-white/70">ProjectFlow</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/10 rounded-xl transition-all duration-300",
            collapsed && "h-10 w-10 bg-slate-50 dark:bg-white/5"
          )}
          onClick={isMobile ? onMobileClose : onToggle}
        >
          {isMobile ? <X className="h-4 w-4" /> : collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto no-scrollbar relative z-10">
        {navItems.map((item) => {
          if (item.path === '/team' && !isAdmin) return null;
          return (
            <Tooltip key={item.path} delayDuration={0}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    cn(
                      'relative flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-medium transition-all duration-300 group overflow-hidden',
                      isActive 
                        ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-white font-semibold' 
                        : 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] dark:hover:shadow-[0_4px_12px_rgba(255,255,255,0.02)]',
                      collapsed && 'justify-center px-0 h-12 w-12 mx-auto'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Hover Background Slide */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-transparent dark:from-white/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0" />
                      )}

                      <div className={cn(
                        "flex items-center justify-center transition-transform duration-300 relative z-10 group-hover:-translate-y-0.5",
                        collapsed ? "h-full w-full" : ""
                      )}>
                        <item.icon className={cn(
                          "flex-shrink-0 transition-all duration-300 group-hover:scale-110",
                          isActive ? "text-primary dark:text-white" : "text-slate-500 group-hover:text-slate-900 dark:text-white/60 dark:group-hover:text-white",
                          collapsed ? "h-6 w-6" : "h-[20px] w-[20px]"
                        )} />
                      </div>
                      {!collapsed && <span className={cn("text-[14px] tracking-wide transition-colors relative z-10", isActive ? "text-primary dark:text-white font-semibold" : "text-slate-600 font-medium group-hover:text-slate-900 dark:text-white/60 dark:group-hover:text-white")}>{item.label}</span>}
                    </>
                  )}
                </NavLink>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" sideOffset={20} className="text-xs font-medium rounded-xl px-3 py-1.5 bg-white dark:bg-sidebar border-border text-slate-900 dark:text-sidebar-foreground hidden md:block">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 mt-auto relative z-10">
        <div className={cn(
          'flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-white/5 dark:border-white/5 backdrop-blur-md transition-all duration-300 hover:shadow-md hover:-translate-y-0.5',
          collapsed && 'justify-center p-2'
        )}>
          <Avatar className={cn(
            "flex-shrink-0 ring-2 ring-primary/20 ring-offset-2 ring-offset-white dark:ring-offset-sidebar transition-transform duration-300 hover:scale-110",
            collapsed ? "h-10 w-10" : "h-10 w-10"
          )}>
            <AvatarFallback className="text-sm font-bold shadow-inner" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
              {user?.name ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-slate-800 dark:text-white truncate transition-colors hover:text-primary">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isAdmin ? <Shield className="h-3 w-3 text-primary" /> : <div className="h-1.5 w-1.5 rounded-full bg-primary/80" />}
                <p className="text-[12px] text-slate-500 dark:text-white/50 capitalize font-medium">{user?.role}</p>
              </div>
            </div>
          )}
        </div>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                'w-full mt-3 h-11 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:text-white/50 dark:hover:text-red-400 dark:hover:bg-red-900/10 rounded-2xl text-[13px] font-medium transition-all duration-300 group overflow-hidden relative',
                collapsed && 'px-0 h-12 w-12 mx-auto'
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0" />
              <LogOut className={cn("relative z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5 group-hover:scale-110", collapsed ? "h-5 w-5" : "h-4 w-4")} />
              {!collapsed && <span className="ml-2 relative z-10 transition-transform duration-300 group-hover:translate-x-1">Logout account</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" sideOffset={20} className="text-xs rounded-xl px-3 py-1.5 bg-red-500/10 border-red-500/20 text-red-500 hidden md:block">Logout</TooltipContent>
          )}
        </Tooltip>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {isMobileOpen && (
          <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md" onClick={onMobileClose} />
        )}
        <aside
          className={cn(
            'fixed left-0 top-0 z-50 h-screen w-[280px] text-slate-900 dark:text-sidebar-foreground transition-all duration-500 ease-out flex flex-col shadow-2xl',
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {renderNav(false)}
        </aside>
      </>
    );
  }

  return (
    <aside
      className={cn(
        'fixed left-4 top-4 z-40 h-[calc(100vh-32px)] text-slate-900 dark:text-sidebar-foreground transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex flex-col rounded-3xl overflow-hidden glass-sidebar shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
        isCollapsed ? 'w-[88px]' : 'w-[280px]'
      )}
    >
      {renderNav(isCollapsed)}
    </aside>
  );
};

export default AppSidebar;
