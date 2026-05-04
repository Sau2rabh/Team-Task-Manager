"use client";

import React, { useState, useRef, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Mail, 
  Camera, 
  Globe, 
  Link, 
  Share2, 
  Save, 
  Plus, 
  X,
  Trophy,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Calendar, UserCircle } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    github: user?.socialLinks?.github || '',
    linkedin: user?.socialLinks?.linkedin || '',
    twitter: user?.socialLinks?.twitter || '',
    gender: user?.gender || 'Prefer not to say',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
  });

  // Sync user data when it's loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        skills: user.skills || [],
        github: user.socialLinks?.github || '',
        linkedin: user.socialLinks?.linkedin || '',
        twitter: user.socialLinks?.twitter || '',
        gender: user.gender || 'Prefer not to say',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      });
    }
  }, [user]);

  const [newSkill, setNewSkill] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [liveStats, setLiveStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/users/profile-stats');
        setLiveStats(data);
      } catch (error) {
        console.error('Failed to fetch profile stats', error);
      }
    };
    fetchStats();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploading(true);
    try {
      const { data } = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser({ profilePicture: data.avatarUrl });
      toast.success('Profile picture updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatePayload = {
        name: formData.name,
        bio: formData.bio,
        skills: formData.skills,
        socialLinks: {
          github: formData.github,
          linkedin: formData.linkedin,
          twitter: formData.twitter
        },
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth
      };

      const { data } = await api.put('/users/profile', updatePayload);
      updateUser(data);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const ensureAbsoluteUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.includes('github.com') || url.includes('linkedin.com')) return `https://${url}`;
    return '#';
  };

  const stats = [
    { label: 'Tasks Completed', value: liveStats?.completedTasks || '0', icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Active Projects', value: liveStats?.activeProjects || '0', icon: Briefcase, color: 'text-blue-500' },
    { label: 'On-time Rate', value: liveStats?.onTimeRate || '0%', icon: Clock, color: 'text-amber-500' },
    { label: 'Points Earned', value: liveStats?.pointsEarned || '0', icon: Trophy, color: 'text-purple-500' },
  ];

  const genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Transgender', value: 'Transgender' },
    { label: 'Other', value: 'Other' },
    { label: 'Prefer not to say', value: 'Prefer not to say' },
  ];

  const profileImageUrl = user?.profilePicture 
    ? (user.profilePicture.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${user.profilePicture}` : user.profilePicture)
    : null;

  return (
    <MainLayout>
      <div className="space-y-8 pb-10">
        <div>
          <h1 className="text-3xl font-bold text-gradient">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Avatar and Quick Info */}
          <div className="space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl relative">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <Camera size={18} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>

              <h2 className="mt-6 text-2xl font-bold">{user?.name}</h2>
              <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold mt-1">{user?.role}</p>
              
              <div className="mt-6 flex items-center gap-2 text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full text-sm">
                <Mail size={14} />
                {user?.email}
              </div>

              <div className="w-full mt-8 grid grid-cols-2 gap-4">
                <a 
                  href={ensureAbsoluteUrl(formData.github)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={cn(
                    "p-4 glass rounded-3xl transition-all flex flex-col items-center gap-2 group/link",
                    formData.github ? "hover:border-primary/50 hover:bg-primary/5 cursor-pointer" : "opacity-30 cursor-not-allowed"
                  )}
                >
                  <Globe size={20} className="group-hover/link:text-primary transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">GitHub</span>
                </a>
                <a 
                  href={ensureAbsoluteUrl(formData.linkedin)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={cn(
                    "p-4 glass rounded-3xl transition-all flex flex-col items-center gap-2 group/link",
                    formData.linkedin ? "hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer" : "opacity-30 cursor-not-allowed"
                  )}
                >
                  <Link size={20} className="group-hover/link:text-blue-500 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="glass-card p-6 rounded-[2.5rem] space-y-6">
              <h3 className="text-lg font-bold">Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, idx) => (
                  <div key={idx} className="p-4 glass rounded-3xl space-y-2">
                    <stat.icon size={20} className={stat.color} />
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Edit Profile */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Edit Profile</h3>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                      <input 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-secondary/20 backdrop-blur-sm border border-border/80 focus:border-primary/50 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:ring-4 ring-primary/5 font-medium"
                        placeholder="Your Name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Email Address</label>
                    <div className="relative opacity-60">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <input 
                        value={user?.email}
                        disabled
                        className="w-full bg-secondary/10 border border-border/40 rounded-2xl py-4 pl-12 pr-4 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">About Bio</label>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full bg-secondary/20 backdrop-blur-sm border border-border/80 focus:border-primary/50 rounded-3xl py-4 px-5 outline-none transition-all focus:ring-4 ring-primary/5 min-h-[160px] resize-none text-sm leading-relaxed"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Gender</label>
                  <div className="relative group">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10" size={18} />
                    <CustomSelect 
                      options={genderOptions}
                      value={formData.gender}
                      onChange={(val) => setFormData(prev => ({ ...prev, gender: val }))}
                      className="w-full pl-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Date of Birth</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full bg-secondary/20 backdrop-blur-sm border border-border/80 focus:border-primary/50 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:ring-4 ring-primary/5 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Expertise & Skills</label>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {formData.skills.map((skill) => (
                      <motion.div 
                        key={skill}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex items-center gap-1.5 bg-linear-to-br from-primary/10 to-indigo-500/10 text-primary px-4 py-2 rounded-2xl text-xs font-bold border border-primary/20 shadow-sm"
                      >
                        {skill}
                        <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-500 transition-colors ml-1">
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <form onSubmit={handleAddSkill} className="relative">
                    <input 
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="bg-secondary/20 backdrop-blur-sm border border-border/80 rounded-2xl py-2 pl-4 pr-10 text-xs font-bold outline-none w-36 focus:w-56 transition-all focus:border-primary/50"
                      placeholder="Add new skill..."
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:scale-125 transition-transform">
                      <Plus size={18} />
                    </button>
                  </form>
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-white/5">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Social Networks</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-2">
                      <Globe size={14} /> GitHub Profile
                    </label>
                    <div className="relative group">
                      <input 
                        name="github"
                        value={formData.github}
                        onChange={handleInputChange}
                        className="w-full bg-secondary/20 backdrop-blur-sm border border-border/80 focus:border-primary/50 rounded-2xl py-4 px-5 outline-none transition-all font-medium text-sm"
                        placeholder="https://github.com/username"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-2">
                      <Link size={14} /> LinkedIn Profile
                    </label>
                    <div className="relative group">
                      <input 
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleInputChange}
                        className="w-full bg-secondary/20 backdrop-blur-sm border border-border/80 focus:border-primary/50 rounded-2xl py-4 px-5 outline-none transition-all font-medium text-sm"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
