import React from "react";
import { HelpCircle, BookOpen, MessageCircle, FileText, ExternalLink, Search, ChevronRight } from "lucide-react";

export default function HelpPage() {
  const categories = [
    {
      title: "Getting Started",
      icon: BookOpen,
      color: "text-primary",
      links: ["Setting up your first automation", "Connecting Instagram", "Understanding Triggers", "Keywords Guide"]
    },
    {
      title: "Integrations",
      icon: ExternalLink,
      color: "text-indigo-500",
      links: ["Meta Developer Setup", "OpenAI API integration", "Stripe Checkout guide", "Webhook verification"]
    },
    {
      title: "Automation Builder",
      icon: FileText,
      color: "text-amber-500",
      links: ["Smart AI Prompts", "Comment reply logic", "Keyword matching rules", "Flow builder tips"]
    }
  ];

  return (
    <div className="flex flex-col gap-12">
      {/* Header Section */}
      <div className="flex flex-col gap-6 items-center text-center max-w-2xl mx-auto">
        <div className="flex flex-col gap-2 items-center">
            <div className="p-4 bg-primary/10 rounded-[2rem] border border-primary/20 mb-2">
                <HelpCircle className="w-8 h-8 text-primary shadow-[0_0_20px_rgba(61,90,254,0.3)]" />
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">How can we help?</h1>
            <p className="text-sm text-zinc-500 font-medium">
                Search our knowledge base or browse categories below to find what you need.
            </p>
        </div>

        <div className="w-full relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="w-5 h-5 text-zinc-600 group-focus-within:text-primary transition-colors" />
            </div>
            <input 
                type="text" 
                placeholder="Search for articles, guides, or troubleshooting..." 
                className="w-full bg-[#121215] border border-white/5 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-primary/30 focus:bg-white/5 transition-all placeholder:text-zinc-700"
            />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
            <div key={cat.title} className="bg-[#121215] border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 group hover:border-white/10 transition-all">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/5 rounded-2xl group-hover:bg-primary/5 transition-all">
                        <cat.icon className={`w-5 h-5 ${cat.color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{cat.title}</h3>
                </div>

                <div className="flex flex-col gap-1">
                    {cat.links.map((link) => (
                        <div key={link} className="flex items-center justify-between py-3 group/link cursor-pointer border-b border-white/[0.02] last:border-0 hover:bg-white/[0.01] px-2 -mx-2 rounded-xl transition-all">
                            <span className="text-xs text-zinc-500 group-hover/link:text-zinc-300 transition-colors font-medium">
                                {link}
                            </span>
                            <ChevronRight className="w-4 h-4 text-zinc-800 group-hover/link:text-primary transition-all transform group-hover/link:translate-x-1" />
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>

      {/* Support Card */}
      <div className="bg-gradient-to-r from-primary to-accent rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl shadow-primary/20">
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] -mr-48 -mt-24" />
         
         <div className="flex flex-col gap-3 relative z-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Still Need Help?</h2>
            <p className="text-blue-100/70 text-sm font-bold max-w-md leading-relaxed">
                Connect with our support team for personalized assistance. We&apos;re available 24/7 to help you succeed.
            </p>
         </div>

         <button className="px-10 py-5 bg-white text-primary rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-2xl shadow-black/10 hover:scale-105 active:scale-95 transition-all relative z-10 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 fill-primary" />
            <span>Chat with Support</span>
         </button>
      </div>
    </div>
  );
}
