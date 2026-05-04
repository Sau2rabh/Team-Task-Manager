"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle2, Shield, Zap, X } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import NebulaBackground from "@/components/ui/NebulaBackground";
import { useState } from "react";

export default function LandingPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const modalContent: Record<string, { title: string; content: React.ReactNode }> = {
    privacy: {
      title: "Privacy Policy",
      content: (
        <div className="space-y-4">
          <p>At Team Task Manager, we take your privacy seriously. This policy outlines how we handle your data.</p>
          <h4 className="font-bold">Data Collection</h4>
          <p>We collect minimal data required to provide our AI-powered task management services, including your name, email, and project metadata.</p>
          <h4 className="font-bold">Security</h4>
          <p>All data is encrypted at rest and in transit. We use industry-standard security protocols to protect your information.</p>
        </div>
      )
    },
    terms: {
      title: "Terms of Service",
      content: (
        <div className="space-y-4">
          <p>By using Team Task Manager, you agree to these terms.</p>
          <h4 className="font-bold">Usage</h4>
          <p>Our platform is intended for professional team collaboration. Misuse of AI features or unauthorized access is prohibited.</p>
          <h4 className="font-bold">Subscription</h4>
          <p>We offer various tiers of service. By subscribing, you agree to the billing cycles and terms associated with your plan.</p>
        </div>
      )
    },
    docs: {
      title: "Documentation",
      content: (
        <div className="space-y-4">
          <p>Welcome to the Team Task Manager guide.</p>
          <h4 className="font-bold">Getting Started</h4>
          <p>1. Create an account and set up your workspace.<br />2. Create your first project.<br />3. Use the AI suggestions to populate your task list.</p>
          <h4 className="font-bold">AI Features</h4>
          <p>Our AI analyzes your project description to suggest relevant tasks and optimize your workflow.</p>
        </div>
      )
    },
    features: {
      title: "Core Features",
      content: (
        <div className="space-y-4">
          <p>Discover what makes Team Task Manager the ultimate workspace for modern teams.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <h4 className="font-bold text-primary mb-1">AI Task Intelligence</h4>
              <p className="text-sm">Automated task suggestions based on project context using smart analysis.</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10">
              <h4 className="font-bold text-purple-500 mb-1">Project RBAC</h4>
              <p className="text-sm">Advanced role-based access control managed at the individual project level.</p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
              <h4 className="font-bold text-blue-500 mb-1">Real-time Collaboration</h4>
              <p className="text-sm">Instant updates and live chat powered by socket technology.</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <h4 className="font-bold text-emerald-500 mb-1">Interactive Kanban</h4>
              <p className="text-sm">Premium drag-and-drop workflow with persistence and smooth animations.</p>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="min-h-screen selection:bg-primary/30 selection:text-primary overflow-hidden font-sans">
      <NebulaBackground />
      
      {/* Noise Overlay for Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E')]" />
      
      {/* Modal Overlay */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-background/40"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass max-w-2xl w-full p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 p-6">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <h2 className="text-3xl font-black font-outfit mb-6 text-gradient inline-block">
                {modalContent[activeModal].title}
              </h2>
              <div className="text-muted-foreground leading-relaxed">
                {modalContent[activeModal].content}
              </div>
              <div className="mt-10 pt-6 border-t border-border/50">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all"
                >
                  Got it, thanks!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Zap className="text-white" size={22} fill="currentColor" />
            </div>
            <span className="text-xs sm:text-xl font-bold tracking-tight font-outfit">Team Task Manager</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-6">
            <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            <ThemeToggle />
            <Link href="/signup" className="bg-foreground text-background px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:opacity-90 transition-all shadow-xl shadow-foreground/10 active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border/50 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary"
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>AI-Powered Task Intelligence</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight font-outfit leading-[1.1]"
          >
            One Workspace. <br className="hidden md:block" /> 
            <span className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Infinite Intelligence.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed"
          >
            Team Task Manager is the ultimate workspace for modern teams. Organize projects, 
            automate workflows, and collaborate seamlessly with project-specific RBAC.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/signup" className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-2xl font-bold text-xl hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 group">
              Join the Future
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-xl border-2 border-border/80 hover:border-primary hover:bg-secondary transition-all shadow-sm">
              Live Demo
            </Link>
          </motion.div>

          {/* App Preview Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              const rotateX = (y - centerY) / 25;
              const rotateY = (centerX - x) / 25;
              e.currentTarget.style.setProperty("--rotate-x", `${rotateX}deg`);
              e.currentTarget.style.setProperty("--rotate-y", `${rotateY}deg`);
              e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
              e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.setProperty("--rotate-x", `0deg`);
              e.currentTarget.style.setProperty("--rotate-y", `0deg`);
            }}
            className="relative mt-24 group perspective-2000"
            style={{
              transform: "rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))",
              transition: "transform 0.2s ease-out",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Interactive Background Glow */}
            <div 
              className="absolute -inset-20 opacity-0 group-hover:opacity-40 transition-opacity duration-700 blur-[100px] pointer-events-none -z-10"
              style={{
                background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(var(--primary-rgb), 0.3), transparent 50%)`,
              }}
            />

            <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-500 rounded-4xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            
            <div className="relative glass rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] transform-gpu transition-all duration-500 group-hover:shadow-[0_0_80px_-12px_rgba(var(--primary-rgb),0.3)]">
              <div className="h-10 bg-muted/50 border-b border-border/50 flex items-center px-5 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="mx-auto bg-foreground/5 px-4 py-1 rounded-md text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
                  team-task-manager.ai/dashboard
                </div>
              </div>
              <div className="relative overflow-hidden">
                {/* Screen Scanline Effect */}
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/5 to-transparent h-[200%] -translate-y-full group-hover:animate-scanline pointer-events-none z-10" />
                
                <Image 
                  src="https://images.unsplash.com/photo-1540350394557-8d14678e7f91?q=80&w=2000&auto=format&fit=crop" 
                  alt="Team Task Manager Dashboard Preview" 
                  width={2000}
                  height={1200}
                  className="w-full h-auto opacity-95 transition-transform duration-700 group-hover:scale-[1.01]"
                  priority
                  loading="eager"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-32 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "AI Task suggestions", desc: "Our engine analyzes project intent to suggest the best starting tasks.", color: "from-blue-500 to-cyan-500", glow: "rgba(6, 182, 212, 0.15)" },
            { icon: Shield, title: "Project RBAC", desc: "Advanced role-based access control managed at the project level.", color: "from-purple-500 to-indigo-500", glow: "rgba(139, 92, 246, 0.15)" },
            { icon: CheckCircle2, title: "Kanban Mastery", desc: "Seamless drag-and-drop workflow with real-time state persistence.", color: "from-emerald-500 to-teal-500", glow: "rgba(16, 185, 129, 0.15)" },
          ].map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                y: {
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                },
                opacity: { delay: i * 0.1, duration: 0.6 },
                default: { delay: i * 0.1, duration: 0.6, ease: "easeOut" }
              }}
              animate={{
                y: [0, -10, 0],
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
                e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
              }}
              className="group relative glass p-8 sm:p-10 rounded-[2.5rem] space-y-6 overflow-hidden border border-white/10 hover:border-primary/30 transition-all duration-500 cursor-default shadow-xl hover:shadow-primary/5"
            >
              {/* Interactive Spotlight Effect (Desktop) / Subtle Static Glow (Mobile) */}
              <div 
                className="pointer-events-none absolute -inset-px opacity-20 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${f.glow}, transparent 40%)`,
                }}
              />

              {/* Animated Gradient Border */}
              <div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              
              <div className={`w-16 h-16 bg-linear-to-br ${f.color} rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 relative`}>
                <div className="absolute inset-0 rounded-2xl bg-white/40 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <f.icon className="text-white relative z-10" size={32} />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-black font-outfit tracking-tight group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium text-base sm:text-lg">
                  {f.desc}
                </p>
              </div>

              {/* Bottom Decorative Line */}
              <div className="pt-4">
                <div className="h-1.5 w-16 bg-linear-to-r from-primary/50 via-primary/20 to-transparent rounded-full group-hover:w-full transition-all duration-700" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="max-w-5xl mx-auto px-4 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
            e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
          }}
          className="group relative glass p-12 sm:p-24 rounded-[4rem] space-y-12 overflow-hidden border border-white/10"
        >
          {/* Spotlight Effect */}
          <div 
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: `radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(var(--primary-rgb), 0.15), transparent 40%)`,
            }}
          />
          
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-purple-500/5 -z-10" />
          
          <h2 className="text-5xl md:text-7xl font-black font-outfit tracking-tight leading-[1.1]">
            Ready to transform your <br /> 
            <span className="bg-linear-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              team's workflow?
            </span>
          </h2>
          
          <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed">
            Join thousands of teams already using Team Task Manager to build the future of collaboration.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <Link href="/signup" className="w-full sm:w-auto bg-foreground text-background px-12 py-6 rounded-2xl font-black text-2xl hover:scale-105 transition-all shadow-2xl shadow-foreground/20 active:scale-95 flex items-center gap-3">
              Join the Future
              <ArrowRight size={24} />
            </Link>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />
        </motion.div>
      </section>

      <footer className="border-t border-border/50 py-20 bg-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-primary/5 -z-10" />
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shadow-inner">
                <Zap className="text-primary" size={20} fill="currentColor" />
              </div>
              <span className="text-xl font-black text-foreground font-outfit tracking-tight">Team Task Manager</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground max-w-xs text-center md:text-left leading-relaxed">
              Empowering modern teams with intelligent workflows and seamless collaboration.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-8 text-muted-foreground w-full md:w-auto">
            <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-4 text-[10px] sm:text-sm font-bold tracking-wide uppercase">
              <button onClick={() => setActiveModal('privacy')} className="hover:text-primary transition-colors whitespace-nowrap">Privacy Policy</button>
              <button onClick={() => setActiveModal('terms')} className="hover:text-primary transition-colors whitespace-nowrap">Terms of Service</button>
              <button onClick={() => setActiveModal('features')} className="hover:text-primary transition-colors whitespace-nowrap">Features</button>
              <button onClick={() => setActiveModal('docs')} className="hover:text-primary transition-colors whitespace-nowrap">Documentation</button>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
              <p className="text-[11px] sm:text-sm font-semibold italic text-center md:text-right order-2 md:order-1">© 2026 Team Task Manager. Built for the future.</p>
              <div className="h-4 w-px bg-border/50 hidden md:block order-2" />
              <div className="flex gap-5 order-1 md:order-3">
                <a href="https://github.com/Sau2rabh" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="https://www.linkedin.com/in/saurabh-anand-113271249/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
