import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  FolderKanban, Shield, User, Loader2, ArrowRight, Sparkles,
  Eye, EyeOff, CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({ title: 'Missing fields', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const result = await login(loginEmail, loginPassword);
    setIsLoading(false);
    if (result.success) {
      toast({ title: 'Welcome back!', description: 'Logged in successfully.' });
      navigate('/');
    } else {
      toast({ title: 'Login Failed', description: result.error, variant: 'destructive' });
    }
  };



  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden items-center justify-center"
        style={{ background: 'linear-gradient(135deg, hsl(239 84% 67%), hsl(280 65% 55%), hsl(239 84% 50%))' }}>
        {/* Decorative shapes */}
        <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-white/5 blur-sm" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[450px] h-[450px] rounded-full bg-white/5 blur-sm" />
        <div className="absolute top-[30%] right-[5%] w-[250px] h-[250px] rounded-full bg-white/10 blur-md" />
        <div className="absolute bottom-[20%] left-[10%] w-[150px] h-[150px] rounded-3xl bg-white/5 rotate-45" />

        <div className="relative z-10 px-14 max-w-lg">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-sm">
              <FolderKanban className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">ProjectFlow</span>
          </div>
          <h1 className="text-[42px] font-extrabold text-white leading-[1.15] mb-5">
            Manage your projects<br />efficiently.
          </h1>
          <p className="text-white/65 text-lg leading-relaxed mb-10">
            Track tasks, collaborate with your team, and deliver projects on time — all in one beautiful workspace.
          </p>
          <div className="space-y-4">
            {['Role-based access control', 'Kanban task management', 'Real-time team collaboration'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-white/70" />
                <span className="text-white/80 text-[15px] font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px] animate-fade-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10">
            <div className="p-2.5 rounded-xl" style={{ background: 'var(--gradient-primary)' }}>
              <FolderKanban className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">ProjectFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {mode === 'login' ? 'Welcome back' : 'Get started'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {mode === 'login'
                ? 'Sign in to continue to your workspace'
                : 'Create your account in seconds'}
            </p>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@company.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="h-12 bg-secondary/50 border-border/60 rounded-xl focus:bg-background transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                  <button type="button" className="text-xs text-primary font-medium hover:underline underline-offset-4">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="h-12 bg-secondary/50 border-border/60 rounded-xl focus:bg-background transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 font-semibold gap-2 rounded-xl text-[15px]" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
                ) : (
                  <>Login <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>


            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Auth;
