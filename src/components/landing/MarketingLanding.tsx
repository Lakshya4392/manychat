import React from "react";
import Link from "next/link";
import { MessageCircle, BarChart3, Users, Zap, ArrowRight, ShieldCheck, LayoutTemplate, Send, Activity, Lock, PlayCircle } from "lucide-react";
import Footer from "@/components/layout/Footer";

export default function MarketingLanding() {
  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Lifestyle Creator • 450k Followers",
      quote: "Inboxly has completely transformed my workflow. I used to spend 4 hours a day in DMs, now my 'Creator Soul' handles it all.",
      avatar: "SJ"
    },
    {
      name: "Marcus Thorne",
      role: "Tech Reviewer • 1.2M Followers",
      quote: "The Gemini-powered intent detection is scary good. It actually understands when someone is asking for a link vs just saying thanks.",
      avatar: "MT"
    },
    {
      name: "Elena Rodriguez",
      role: "Fitness Coach • 150k Followers",
      quote: "Comment-to-DM is a game changer for my coaching program. I just tell people to comment 'FIT' and Inboxly handles the rest.",
      avatar: "ER"
    },
    {
      name: "David Chen",
      role: "Business Consultant • 80k Followers",
      quote: "I was skeptical about AI, but Inboxly's voice matching is incredible. It sounds exactly like me.",
      avatar: "DC"
    },
    {
      name: "Aria Brooks",
      role: "Travel Blogger • 300k Followers",
      quote: "Inboxly is the most premium automation tool I've used. The interface is clean and it's 100% Meta compliant.",
      avatar: "AB"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-canvas font-abc-oracle text-ink-black overflow-x-hidden selection:bg-rose-quartz/30">
      
      {/* -------------------- HERO SECTION -------------------- */}
      <section className="relative w-full pb-32 overflow-hidden flex flex-col items-center">
        
        {/* Ambient spectrum glow */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] spectrum-glow -z-10 pointer-events-none rounded-full"></div>

        {/* Navbar */}
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-7xl mx-auto px-6 py-3 flex justify-between items-center z-50 bg-fog/80 backdrop-blur-[24px] rounded-[20px] border border-white/20 shadow-sm">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 bg-ink-black rounded-[8px] flex items-center justify-center group-hover:scale-105 transition-all">
                <Zap className="w-4 h-4 text-white" fill="currentColor" />
              </div>
              <span className="text-xl font-medium tracking-tighter text-ink-black">Inboxly.</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-[14px] font-regular text-slate">
              <Link href="#features" className="hover:text-ink-black transition-colors">Features</Link>
              <Link href="#flows" className="hover:text-ink-black transition-colors">Funnels</Link>
              <Link href="#privacy" className="hover:text-ink-black transition-colors">Privacy</Link>
              <Link href="#pricing" className="hover:text-ink-black transition-colors">Pricing</Link>
            </div>
 
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hidden sm:block text-[14px] font-medium text-slate hover:text-ink-black transition-colors">
                Sign in
              </Link>
              <Link href="/dashboard" className="btn-pebble text-[14px] flex items-center gap-2">
                Launch App
              </Link>
            </div>
        </nav>

        {/* Hero Content */}
        <div className="flex flex-col items-center text-center relative z-10 w-full max-w-5xl mx-auto pt-48 px-4 sm:px-6 mb-20">
          
          <div className="px-6 py-2 rounded-[16px] bg-ink-black/5 mb-10">
             <span className="text-[14px] font-medium text-ink-black">Inboxly 2.0: Now powered by Gemini 1.5 Pro</span>
          </div>

          <h1 className="text-display text-ink-black w-full mb-14 flex flex-col items-center justify-center">
            <span>Autonomous</span>
            <div className="mt-2 text-graphite">
              SALES FOR CREATORS
            </div>
          </h1>

          <p className="text-subheading text-graphite mb-20 max-w-2xl mx-auto leading-relaxed">
            Stop losing leads in your DMs. Deploy intent-aware AI personas that speak in your voice and close deals while you sleep.
          </p>

          <Link href="/dashboard" className="btn-pebble text-[16px] px-12 py-5 flex items-center gap-3 group">
            Start Automating
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Hero Mockup */}
        <div className="relative w-full max-w-5xl mx-auto px-6 pt-12">
            <div className="absolute inset-0 spectrum-glow opacity-[0.15] blur-[120px] -z-10 translate-y-12" />
            <div className="w-full aspect-[16/10] bg-white/90 frosted-card border border-white/40 overflow-hidden shadow-2xl">
              <div className="w-full h-8 bg-fog flex items-center px-4 gap-2 border-b border-black/5">
                 <div className="w-2.5 h-2.5 rounded-full bg-ink-black/10" />
                 <div className="w-2.5 h-2.5 rounded-full bg-ink-black/10" />
                 <div className="w-2.5 h-2.5 rounded-full bg-ink-black/10" />
              </div>
              <div className="p-8 h-full bg-canvas/50">
                 <div className="w-1/3 h-4 bg-ink-black/5 rounded mb-4" />
                 <div className="w-full h-[60%] bg-ink-black/5 rounded-xl border border-dashed border-ink-black/10 flex items-center justify-center">
                    <span className="text-slate text-sm">Product Dashboard Mockup</span>
                 </div>
              </div>
            </div>
        </div>
      </section>

      {/* -------------------- FEATURES GRID -------------------- */}
      <section className="max-page-width px-6 py-32 relative z-10" id="features">
         
         <div className="flex flex-col items-center text-center mb-24">
            <div className="bg-ink-black/5 px-4 py-2 rounded-full text-[14px] font-medium text-ink-black mb-8">Platform Core</div>
            <h2 className="text-heading text-ink-black mb-8">
              A premium solution<br/>for pro creators.
            </h2>
            <p className="text-subheading text-graphite max-w-2xl leading-relaxed">
              Connect your engaging content directly to the inbox of your followers, seamlessly and autonomously.
            </p>
         </div>
 
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="frosted-card group relative overflow-hidden transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 spectrum-glow pointer-events-none opacity-[0.05] group-hover:opacity-[0.1] transition-opacity" />
              <div className="w-14 h-14 rounded-2xl bg-ink-black/5 flex items-center justify-center mb-10 text-ink-black">
                 <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-heading-sm text-ink-black mb-5">Intent-Aware AI</h4>
              <p className="text-body text-graphite leading-relaxed">Our Gemini-powered engine understands follower intent, replying with context-aware responses that feel 100% human.</p>
            </div>
 
            <div className="frosted-card group relative overflow-hidden transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 spectrum-glow pointer-events-none opacity-[0.05] group-hover:opacity-[0.1] transition-opacity" />
              <div className="w-14 h-14 rounded-2xl bg-ink-black/5 flex items-center justify-center mb-10 text-ink-black">
                 <ShieldCheck className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <h4 className="text-heading-sm text-ink-black mb-5">Creator Soul</h4>
              <p className="text-body text-graphite leading-relaxed">Upload your content, voice, and values. Inboxly builds a 'Soul' knowledge base so AI replies exactly like you would.</p>
            </div>
 
            <div className="frosted-card group relative overflow-hidden transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 spectrum-glow pointer-events-none opacity-[0.05] group-hover:opacity-[0.1] transition-opacity" />
              <div className="w-14 h-14 rounded-2xl bg-ink-black/5 flex items-center justify-center mb-10 text-ink-black">
                 <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-heading-sm text-ink-black mb-5">Full-Funnel Tracking</h4>
              <p className="text-body text-graphite leading-relaxed">Track every comment, DM, and conversion. See exactly how much revenue your autonomous funnels are generating.</p>
            </div>
 
         </div>
      </section>

      {/* -------------------- WORKFLOWS SECTION -------------------- */}
      <section className="max-page-width px-6 py-32" id="flows">
         
         <div className="flex flex-col items-center text-center mb-24">
            <div className="bg-ink-black/5 px-5 py-2 rounded-full text-[14px] font-medium text-ink-black mb-8 w-max">Built-in Flows</div>
            <h2 className="text-heading text-ink-black">
              Explore Workflows
            </h2>
         </div>
 
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="frosted-card group cursor-pointer relative overflow-hidden transition-all duration-500">
               <div className="absolute inset-0 bg-ink-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <div className="relative z-10 flex items-start justify-between mb-20">
                 <div className="w-16 h-16 bg-ink-black/5 rounded-2xl flex items-center justify-center text-ink-black transform group-hover:scale-110 transition-transform duration-500">
                   <MessageCircle className="w-8 h-8" />
                 </div>
                 <div className="w-12 h-12 rounded-full border border-ink-black/10 flex items-center justify-center text-slate group-hover:bg-ink-black group-hover:text-white transition-all duration-500">
                   <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                 </div>
               </div>
               
               <div className="relative z-10 mt-auto">
                 <h3 className="text-heading-sm text-ink-black mb-5">Comment-to-DM</h3>
                 <p className="text-body text-graphite leading-relaxed max-w-[340px]">
                   Turn every "Link please!" comment into an instant sale. Automatically DM followers based on specific keywords.
                 </p>
               </div>
            </div>
 
            <div className="frosted-card group cursor-pointer relative overflow-hidden transition-all duration-500 border border-ink-black/5">
               <div className="absolute top-0 right-0 w-[400px] h-[400px] spectrum-glow rounded-full pointer-events-none opacity-[0.1]" />
               <div className="relative z-10 flex items-start justify-between mb-20">
                 <div className="w-16 h-16 bg-ink-black/5 rounded-2xl flex items-center justify-center text-ink-black transform group-hover:scale-110 transition-transform duration-500">
                   <Zap className="w-8 h-8" />
                 </div>
                 <div className="w-12 h-12 rounded-full border border-ink-black/10 flex items-center justify-center text-ink-black group-hover:bg-ink-black group-hover:text-white transition-all duration-500">
                   <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                 </div>
               </div>
               
               <div className="relative z-10 mt-auto">
                 <h3 className="text-heading-sm text-ink-black mb-5">Story Mentions</h3>
                 <p className="text-body text-graphite leading-relaxed max-w-[340px]">
                   Instantly reward followers who share your content. Send a thank you or a discount link the moment you're tagged.
                 </p>
               </div>
            </div>
 
            <div className="frosted-card group cursor-pointer relative overflow-hidden transition-all duration-500">
               <div className="absolute inset-0 bg-ink-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <div className="relative z-10 flex items-start justify-between mb-20">
                 <div className="w-16 h-16 bg-ink-black/5 rounded-2xl flex items-center justify-center text-ink-black transform group-hover:scale-110 transition-transform duration-500">
                   <Users className="w-8 h-8" />
                 </div>
                 <div className="w-12 h-12 rounded-full border border-ink-black/10 flex items-center justify-center text-slate group-hover:bg-ink-black group-hover:text-white transition-all duration-500">
                   <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                 </div>
               </div>
               
               <div className="relative z-10 mt-auto">
                 <h3 className="text-heading-sm text-ink-black mb-5">Lead Nurturing</h3>
                 <p className="text-body text-graphite leading-relaxed max-w-[340px]">
                   Our AI follows up with prospects who didn't buy. Re-engage leads with personalized value at the perfect time.
                 </p>
               </div>
            </div>
 
            <div className="frosted-card group cursor-pointer relative overflow-hidden transition-all duration-500">
               <div className="absolute inset-0 bg-ink-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <div className="relative z-10 flex items-start justify-between mb-20">
                 <div className="w-16 h-16 bg-ink-black/5 rounded-2xl flex items-center justify-center text-ink-black transform group-hover:scale-110 transition-transform duration-500">
                   <Activity className="w-8 h-8" strokeWidth={2} />
                 </div>
                 <div className="w-12 h-12 rounded-full border border-ink-black/10 flex items-center justify-center text-slate group-hover:bg-ink-black group-hover:text-white transition-all duration-500">
                   <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                 </div>
               </div>
               
               <div className="relative z-10 mt-auto">
                 <h3 className="text-heading-sm text-ink-black mb-5">Smart Triggers</h3>
                 <p className="text-body text-graphite leading-relaxed max-w-[340px]">
                   Complex automation made simple. Trigger flows based on link clicks, replies, or even profile follows.
                 </p>
               </div>
            </div>
 
         </div>
      </section>

      {/* -------------------- TESTIMONIALS (AUTO MARQUEE) -------------------- */}
      <section className="w-full py-48 bg-canvas overflow-hidden">
          <div className="max-page-width px-6 mb-24 text-center">
             <div className="bg-ink-black/5 px-4 py-2 rounded-full text-[14px] font-medium text-ink-black mb-8 w-max mx-auto">Social Proof</div>
             <h2 className="text-heading text-ink-black mb-6">What our users say.</h2>
             <div className="flex justify-center gap-3">
                <div className="w-12 h-1.5 rounded-full bg-ink-black" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate/20" />
             </div>
          </div>
          
          <div className="flex gap-10 overflow-hidden relative group">
             <div className="animate-marquee flex gap-10">
                {/* Original Items */}
                {testimonials.map((t, i) => (
                   <div key={i} className="min-w-[420px] frosted-card flex flex-col justify-between">
                      <p className="text-[18px] text-ink-black mb-10 leading-relaxed font-regular italic">
                        "{t.quote}"
                      </p>
                      <div className="flex items-center gap-5 pt-6 border-t border-ink-black/5">
                         <div className="w-12 h-12 rounded-full bg-ink-black text-white flex items-center justify-center font-medium text-sm">
                            {t.avatar}
                         </div>
                         <div>
                            <p className="text-[15px] font-medium text-ink-black">{t.name}</p>
                            <p className="text-[13px] text-slate font-regular">{t.role}</p>
                         </div>
                      </div>
                   </div>
                ))}
                {/* Duplicate for seamless loop */}
                {testimonials.map((t, i) => (
                   <div key={`dup-${i}`} className="min-w-[420px] frosted-card flex flex-col justify-between">
                      <p className="text-[18px] text-ink-black mb-10 leading-relaxed font-regular italic">
                        "{t.quote}"
                      </p>
                      <div className="flex items-center gap-5 pt-6 border-t border-ink-black/5">
                         <div className="w-12 h-12 rounded-full bg-ink-black text-white flex items-center justify-center font-medium text-sm">
                            {t.avatar}
                         </div>
                         <div>
                            <p className="text-[15px] font-medium text-ink-black">{t.name}</p>
                            <p className="text-[13px] text-slate font-regular">{t.role}</p>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
             
             {/* Fade Overlays */}
             <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-canvas to-transparent z-10" />
             <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-canvas to-transparent z-10" />
          </div>
      </section>

      {/* -------------------- PRIVACY SECTION -------------------- */}
      <section className="max-page-width px-6 py-64 text-center flex flex-col items-center" id="privacy">
          <div className="w-20 h-20 bg-ink-black rounded-full flex items-center justify-center mb-16">
             <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-heading-lg text-ink-black mb-12 max-w-4xl">
            Instagram-Official.<br />Creator-Secure.
          </h2>
          <p className="text-subheading text-graphite mb-16 max-w-2xl leading-relaxed">
            Inboxly is built on the official Meta Graph API. We never ask for your password, and we follow 100% of Instagram's terms of service to keep your account safe.
          </p>
          <Link href="#" className="text-ink-black font-medium underline underline-offset-4 decoration-slate/30 hover:decoration-ink-black transition-all">
             Read our security commitment
          </Link>
      </section>

      {/* -------------------- FOOTER CTA -------------------- */}
      <section className="bg-canvas text-ink-black py-48 text-center relative overflow-hidden w-full border-t border-ink-black/5">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] spectrum-glow -z-10 pointer-events-none rounded-full"></div>
        
        <div className="relative z-10 max-w-[1000px] mx-auto px-6">
           <div className="w-20 h-20 bg-ink-black rounded-[2rem] flex items-center justify-center mx-auto mb-12 border border-white/20">
             <Send className="w-8 h-8 text-white -mr-1 mt-1" />
           </div>
           
           <h2 className="text-display text-ink-black mb-10">
             Ready to stop ghosting leads?
           </h2>
           
           <p className="text-subheading text-graphite mb-16 max-w-2xl mx-auto leading-relaxed">
             Connect your Instagram in two clicks and build your first auto-reply funnel today. Join the top 1% of performing creators.
           </p>
           
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             <Link href="/dashboard" className="btn-pebble text-[16px] inline-flex items-center justify-center gap-3">
               Start Automating <ArrowRight className="w-5 h-5" />
             </Link>
           </div>
         </div>
      </section>
 
       <Footer />
     </div>
  );
}
