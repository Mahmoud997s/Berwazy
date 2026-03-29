"use client";

import { useState } from "react";
import { useMedia } from "@/hooks/use-media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Folder, File, Image as ImageIcon, Video, FileText, Plus, Trash2, ChevronRight, Search, Upload, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { Media, MediaFolder } from "@/shared/schema";
import { cn } from "@/lib/utils";

interface MediaLibraryProps {
  onSelect?: (media: Media) => void;
  allowSelection?: boolean;
}

export function MediaLibrary({ onSelect, allowSelection = true }: MediaLibraryProps) {
  const [currentFolderId, setCurrentFolderId] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState("");
  const { media, folders, isLoading, upload, createFolder, deleteMedia } = useMedia(currentFolderId);
  const [isCreateFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const filteredMedia = media.filter(m => 
    m.originalName.toLowerCase().includes(search.toLowerCase()) ||
    (m.altText && m.altText.toLowerCase().includes(search.toLowerCase()))
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      await upload({ file: files[i], folderId: currentFolderId });
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder({ name: newFolderName, parentId: currentFolderId });
    setNewFolderName("");
    setCreateFolderOpen(false);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (mimeType.startsWith("video/")) return <Video className="w-5 h-5 text-purple-500" />;
    if (mimeType === "application/pdf") return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="flex flex-col h-[600px] bg-background border border-border rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search media..." 
              className="pl-9 h-9 bg-muted/50 border-none rounded-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCreateFolderOpen(true)} className="gap-2 rounded-full px-4">
            <Plus className="w-4 h-4" /> New Folder
          </Button>
          <div className="relative">
            <Input 
              type="file" 
              multiple 
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileUpload}
            />
            <Button size="sm" className="gap-2 rounded-full px-6 bg-primary hover:bg-primary/90">
              <Upload className="w-4 h-4" /> Upload
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
          <button 
            onClick={() => setCurrentFolderId(undefined)}
            className={cn("hover:text-primary transition-colors", !currentFolderId && "text-primary")}
          >
            Root
          </button>
          {currentFolderId && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-primary">Folder {currentFolderId}</span>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {/* Folders */}
          {folders.map(folder => (
            <div 
              key={folder.id}
              className="group flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-muted/50 transition-all cursor-pointer border border-transparent hover:border-border"
              onClick={() => setCurrentFolderId(folder.id)}
            >
              <div className="w-14 h-14 flex items-center justify-center bg-amber-500/10 rounded-2xl group-hover:bg-amber-500/20 transition-colors">
                <Folder className="w-8 h-8 text-amber-500 fill-amber-500/20" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-center truncate w-full">{folder.name}</span>
            </div>
          ))}

          {/* Files */}
          {filteredMedia.map(item => (
            <div 
              key={item.id}
              className="group relative flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-muted/50 transition-all cursor-pointer border border-transparent hover:border-border"
              onClick={() => onSelect?.(item)}
            >
              <div className="relative w-full aspect-square bg-muted rounded-2xl overflow-hidden shadow-inner">
                {item.mimeType.startsWith("image/") ? (
                  <img 
                    src={item.url} 
                    alt={item.altText || item.originalName} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getFileIcon(item.mimeType)}
                  </div>
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                   {allowSelection && (
                     <Button size="sm" variant="secondary" className="h-8 rounded-full text-[10px] font-bold uppercase tracking-widest">
                       Select
                     </Button>
                   )}
                   <Button 
                    size="icon" 
                    variant="destructive" 
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMedia(item.id);
                    }}
                  >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 w-full">
                <span className="text-[10px] font-black uppercase tracking-widest text-center truncate w-full group-hover:text-primary transition-colors">
                  {item.originalName}
                </span>
                <span className="text-[8px] font-bold text-muted-foreground/60 uppercase">
                  {(item.size / 1024).toFixed(0)} KB
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredMedia.length === 0 && folders.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/40">
            <Upload className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">No files found</p>
          </div>
        )}
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Folder Name</label>
              <Input 
                placeholder="Marketing Assets..." 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="bg-muted/50 border-none h-12 rounded-xl text-foreground"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="ghost" className="flex-1 rounded-xl uppercase text-[10px] font-black tracking-widest" onClick={() => setCreateFolderOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1 rounded-xl uppercase text-[10px] font-black tracking-widest bg-primary hover:bg-primary/90" onClick={handleCreateFolder}>
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
