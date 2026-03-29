"use client";

import { MediaLibrary } from "@/components/media-library";

export default function AdminMediaPage() {
  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Media <span className="text-primary">Library</span></h1>
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Manage your assets, images, and documents.</p>
      </div>

      <MediaLibrary allowSelection={false} />
    </div>
  );
}
