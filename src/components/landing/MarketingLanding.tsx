import React from "react";
import Link from "next/link";
import { Zap, Shield, Rocket, Globe, ArrowRight, Play, CheckCircle2 } from "lucide-react";

export default function MarketingLanding() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Zap className="text-white w-6 h-6 fill-white" />
              </div>
              <span className="text-2xl font-bold font-heading italic tracking-tighter">Slide</span>
            </div>
            
            <div className="hidden md:flex items-center gap-10">
              <Link href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Features</Link>
              <Link href="#solutions" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Solutions</Link>
              <Link href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Pricing</Link>
              <Link href="/dashboard" className="text-sm font-bold text-white bg-white/5 px-6 py-2.5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                Sign In
              </Link>
              <Link href="/dashboard" className="text-sm font-bold bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-2xl transition-all shadow-lg shadow-primary/20">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        {/* Glow Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] animate-pulse-slow" />
          <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-primary text-sm font-bold mb-8 animate-float">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
            Now Powered by Smart AI 2.0
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold font-heading tracking-tight mb-8 leading-[0.9]">
            Automate <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-primary/50">Everything.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-zinc-400 leading-relaxed mb-12">
            The next-generation automation platform for modern teams.
            Streamline your workflows, connect your tools, and grow faster with <span className="text-white font-semibold italic">Slide.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
             <Link href="/dashboard" className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-5 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 transform hover:scale-105 active:scale-95">
               Start Building for Free
               <ArrowRight className="w-5 h-5" />
             </Link>
             <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-5 bg-white/5 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all border border-white/10 group">
                <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                Watch Demo
             </button>
          </div>
          
          {/* Dashboard Preview Mockup */}
          <div className="mt-24 relative max-w-5xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-[#0c0c0e] rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden p-2">
                <img 
                  src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200&h=600" 
                  alt="Slide Dashboard Preview" 
                  className="rounded-[1.5rem] opacity-80"
                />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-zinc-500">
              <div>
                <p className="text-4xl font-bold text-white mb-2">10M+</p>
                <p className="text-sm font-medium">Automations Executed</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white mb-2">50k+</p>
                <p className="text-sm font-medium">Global Teams</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white mb-2">99.9%</p>
                <p className="text-sm font-medium">Uptime Guarantee</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white mb-2">24/7</p>
                <p className="text-sm font-medium">Expert Support</p>
              </div>
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4 font-heading">Powerful features for power users.</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">Everything you need to build scalable, reliable automations without touching a single line of code.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Lighting Fast", desc: "Built for speed. Trigger actions in milliseconds with our high-performance infrastructure." },
              { icon: Shield, title: "Enterprise Grade", desc: "Security is baked in. Bank-level encryption and full compliance with SOC2 & GDPR." },
              { icon: Rocket, title: "Scale Seamlessly", desc: "From one user to millions. Our platform scales automatically with your business growth." },
              { icon: Globe, title: "Go Global", desc: "Deploy automations in any region. Ultra-low latency connectivity across the globe." },
              { icon: CheckCircle2, title: "Smart Error Handling", desc: "Never lose an execution. Automatic retries and smart debugging built-in." },
              { icon: Zap, title: "100+ Integrations", desc: "Connect Slack, Discord, Instagram, and more with just a few clicks." },
            ].map((f, idx) => (
              <div key={idx} className="p-8 rounded-[2rem] bg-zinc-900 border border-white/5 hover:border-primary/50 transition-all group">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <div className="flex justify-center items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                <Zap className="text-primary w-5 h-5 fill-primary" />
              </div>
              <span className="text-xl font-bold font-heading italic tracking-tighter">Slide</span>
           </div>
           
           <div className="flex flex-wrap justify-center gap-8 text-sm text-zinc-500 font-medium mb-12">
              <Link href="#" className="hover:text-white transition-colors">Documentation</Link>
              <Link href="#" className="hover:text-white transition-colors">API Reference</Link>
              <Link href="#" className="hover:text-white transition-colors">Blog</Link>
              <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
           </div>
           
           <p className="text-xs text-zinc-600">
             © {new Date().getFullYear()} Slide Automation Inc. Built with love in San Francisco.
           </p>
        </div>
      </footer>
    </div>
  );
}
