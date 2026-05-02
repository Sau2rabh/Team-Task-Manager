"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { toast, Toaster } from 'sonner';
import { UserPlus, Mail, Lock, User, Loader2, Sparkles, ShieldCheck, UserCircle } from 'lucide-react';
import NebulaBackground from '@/components/ui/NebulaBackground';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/signup', formData);
      login(data);
      toast.success('Account created! Welcome to Team Task Manager.');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <NebulaBackground />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 glass p-10 rounded-[2.5rem] relative z-10 border-border/50 shadow-2xl"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-4 border border-primary/20">
            <Sparkles size={28} />
          </div>
          <h2 className="text-4xl font-black tracking-tight text-foreground">Join the Future</h2>
          <p className="text-muted-foreground font-medium">Create your Team Task Manager account today</p>
        </div>

        <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                type="text"
                required
                className="w-full bg-secondary/50 border border-border rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                type="email"
                required
                className="w-full bg-secondary/50 border border-border rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                type="password"
                required
                minLength={6}
                className="w-full bg-secondary/50 border border-border rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div className="flex gap-2 p-1 bg-secondary/50 border border-border rounded-2xl">
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'member'})}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${formData.role === 'member' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-foreground/5'}`}
              >
                <UserCircle size={18} />
                <span className="font-medium">Member</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'admin'})}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${formData.role === 'admin' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-muted-foreground hover:bg-foreground/5'}`}
              >
                <ShieldCheck size={18} />
                <span className="font-medium">Admin</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50 mt-8"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />}
            <span className="text-lg uppercase tracking-wider">Get Started</span>
          </button>
        </form>

        <div className="pt-6 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline transition-colors font-bold ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
      
      <Toaster position="bottom-right" />
    </div>
  );
}
