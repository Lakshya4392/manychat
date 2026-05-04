"use client";

import { useEffect, useState } from "react";
import { onGetInstagramMedia } from "@/actions/instagram";
import { onUpdateAutomationPosts } from "@/actions/automations";
import { toast } from "sonner";
import { Loader2, Check, Save, Zap, Monitor, PlayCircle } from "lucide-react";
import Image from "next/image";

interface Post {
  id: string;
  postid: string;
  caption?: string;
  media: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROSEL_ALBUM";
}

export default function PostSelector({ 
  automationId, 
  initialPosts 
}: { 
  automationId: string; 
  initialPosts: any[] 
}) {
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialPosts.map(p => p.postid)
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchMedia = async () => {
      const res = await onGetInstagramMedia();
      if (res.status === 200) {
        setMedia(res.data || []);
      } else {
        toast.error("Failed to load Instagram media");
      }
      setLoading(false);
    };
    fetchMedia();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const selectedPosts = media
      .filter(m => selectedIds.includes(m.id))
      .map(m => ({
        postid: m.id,
        caption: m.caption,
        media: m.media_url,
        mediaType: m.media_type === "CAROUSEL_ALBUM" ? "CAROSEL_ALBUM" : m.media_type
      }));

    const res = await onUpdateAutomationPosts(automationId, selectedPosts as any);
    if (res.status === 200) {
      toast.success("Posts linked successfully!");
    } else {
      toast.error("Failed to link posts");
    }
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Scanning Your Feed...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 text-zinc-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Your Recent Content ({media.length})</span>
        </div>
        <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-50"
        >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Attach Content
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {media.map((post) => {
          const isSelected = selectedIds.includes(post.id);
          return (
            <div 
              key={post.id}
              onClick={() => toggleSelect(post.id)}
              className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                isSelected ? "border-white scale-[0.98] shadow-2xl" : "border-transparent hover:border-white/20"
              }`}
            >
              <Image 
                src={post.media_url} 
                alt={post.caption || "Instagram Post"} 
                fill
                className={`object-cover transition-transform duration-700 ${isSelected ? "scale-110 opacity-50" : "group-hover:scale-105"}`}
              />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-[9px] text-white font-medium line-clamp-2 leading-tight uppercase tracking-tighter">{post.caption || "No Caption"}</p>
              </div>

              <div className="absolute top-2 right-2 flex gap-1">
                  {post.media_type === "VIDEO" && <PlayCircle className="w-3 h-3 text-white fill-white" />}
                  {post.media_type === "CAROUSEL_ALBUM" && <Monitor className="w-3 h-3 text-white" />}
              </div>

              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20 backdrop-blur-[2px]">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-2xl animate-in zoom-in duration-300">
                        <Check className="w-5 h-5 text-black stroke-[4px]" />
                    </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {media.length === 0 && (
        <div className="text-center p-10 border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">No media found in your account</p>
        </div>
      )}
    </div>
  );
}
