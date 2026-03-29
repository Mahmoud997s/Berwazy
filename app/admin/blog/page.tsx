"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  FileText, 
  Eye, 
  Globe, 
  Calendar,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { MediaLibrary } from "@/components/media-library";
import { format } from "date-fns";

export default function AdminBlogPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  const { data: posts, isLoading } = useQuery<any[]>({
    queryKey: ["/api/v1/blog/admin/all"],
    queryFn: async () => {
      const res = await fetch("/api/v1/blog/admin/all");
      return res.json();
    }
  });

  const savePostMutation = useMutation({
    mutationFn: async (post: any) => {
      const url = post.id ? `/api/v1/blog/admin/${post.id}` : "/api/v1/blog/admin";
      const res = await fetch(url, {
        method: post.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/blog/admin/all"] });
      setIsEditorOpen(false);
      setEditingPost(null);
      toast({ title: "Article Saved", description: "The blog post has been saved successfully." });
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/v1/blog/admin/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Deletion failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/blog/admin/all"] });
      toast({ title: "Article Deleted", variant: "destructive" });
    }
  });

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  const handleTitleChange = (title: string) => {
    if (!editingPost?.id) { // Only auto-gen slug for new posts
      setEditingPost({ ...editingPost, title, slug: slugify(title) });
    } else {
      setEditingPost({ ...editingPost, title });
    }
  };

  const openCreate = () => {
    setEditingPost({ 
      title: "", 
      slug: "", 
      content: "", 
      excerpt: "", 
      imageUrl: "", 
      isPublished: false,
      seoTitle: "",
      seoDescription: ""
    });
    setIsEditorOpen(true);
  };

  const openEdit = (post: any) => {
    setEditingPost(post);
    setIsEditorOpen(true);
  };

  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(search.toLowerCase()) || 
    post.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Blog <span className="text-primary">Management</span></h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">{posts?.length || 0} articles in your library.</p>
        </div>
        <Button onClick={openCreate} className="rounded-full gap-2 px-8 h-12 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4" /> New Article
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search articles..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-12 rounded-xl bg-card border-none shadow-sm"
        />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-20"></TableHead>
              <TableHead>Article</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts?.map((post) => (
              <TableRow key={post.id} className="group hover:bg-muted/30">
                <TableCell>
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt="" className="w-12 h-12 object-cover rounded-lg border border-border" />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground/30" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-bold text-sm">{post.title}</p>
                    <p className="text-xs text-muted-foreground">/{post.slug}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {post.isPublished ? (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1.5 rounded-full px-3">
                      <CheckCircle2 className="w-3 h-3" /> Published
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1.5 rounded-full px-3">
                      <Clock className="w-3 h-3" /> Draft
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : 'No date'}
                   </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(post)} className="rounded-xl">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-red-500/10 rounded-xl">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl border-2 bg-card">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-black uppercase italic">Delete Post?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently remove the article. This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl uppercase font-black text-[10px]">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deletePostMutation.mutate(post.id)}
                            className="bg-destructive text-white rounded-xl uppercase font-black text-[10px]"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredPosts?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center text-muted-foreground italic">
                  No articles found...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 border-none shadow-3xl bg-background rounded-3xl overflow-hidden flex flex-col">
          <DialogHeader className="p-8 pb-4 border-b">
            <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">
              {editingPost?.id ? "Edit" : "Create"} <span className="text-primary">Article</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-10 space-y-12">
            {/* Top Grid: Main Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title</label>
                  <Input 
                    value={editingPost?.title || ""} 
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="The future of football posters..."
                    className="rounded-xl border-2 bg-muted/20 h-14 px-5 focus-visible:ring-0 focus-visible:border-primary font-bold text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL Slug</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      value={editingPost?.slug || ""} 
                      onChange={(e) => setEditingPost({...editingPost, slug: slugify(e.target.value)})}
                      placeholder="future-of-football-posters"
                      className="rounded-xl border-2 bg-muted/20 h-12 pl-12 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Summary (Excerpt)</label>
                  <Textarea 
                    value={editingPost?.excerpt || ""} 
                    onChange={(e) => setEditingPost({...editingPost, excerpt: e.target.value})}
                    placeholder="Short description for the blog list..."
                    className="rounded-xl border-2 bg-muted/20 p-4 focus-visible:ring-0 focus-visible:border-primary min-h-[100px] resize-none font-medium"
                  />
                </div>
              </div>

              {/* Featured Image Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Featured Image</label>
                <div 
                  onClick={() => setIsMediaLibraryOpen(true)}
                  className="aspect-video rounded-3xl border-4 border-dashed border-border group hover:border-primary/50 transition-all cursor-pointer overflow-hidden relative flex flex-col items-center justify-center bg-muted/10"
                >
                  {editingPost?.imageUrl ? (
                    <>
                      <img src={editingPost.imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" className="rounded-full font-black uppercase text-[10px] tracking-widest gap-2">
                          <ImageIcon className="w-4 h-4" /> Change Image
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground group-hover:text-primary transition-colors">
                      <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center">
                        <Plus className="w-8 h-8" />
                      </div>
                      <p className="font-black uppercase text-[10px] tracking-widest">Select Post Image</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Editor Area */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Article Content (Markdown/HTML)</label>
                 <div className="flex gap-2">
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest">Rich Text Support</Badge>
                 </div>
              </div>
              <Textarea 
                value={editingPost?.content || ""} 
                onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                placeholder="Start writing your amazing story..."
                className="min-h-[500px] rounded-3xl border-2 bg-muted/20 p-8 focus-visible:ring-0 focus-visible:border-primary font-medium text-lg leading-relaxed shadow-inner"
              />
            </div>

            {/* SEO Section */}
            <div className="pt-12 border-t border-border space-y-8">
              <h3 className="text-xl font-black italic uppercase italic tracking-tighter flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" /> SEO Settings
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Meta Title</label>
                  <Input 
                    value={editingPost?.seoTitle || ""} 
                    onChange={(e) => setEditingPost({...editingPost, seoTitle: e.target.value})}
                    placeholder="Post title for Google search..."
                    className="rounded-xl border-2 bg-muted/5 h-12 focus-visible:ring-0 focus-visible:border-primary font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Meta Description</label>
                  <Input 
                    value={editingPost?.seoDescription || ""} 
                    onChange={(e) => setEditingPost({...editingPost, seoDescription: e.target.value})}
                    placeholder="Brief summary for search results..."
                    className="rounded-xl border-2 bg-muted/5 h-12 focus-visible:ring-0 focus-visible:border-primary font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 border-t bg-card/50 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={editingPost?.isPublished} 
                    onChange={(e) => setEditingPost({...editingPost, isPublished: e.target.checked})}
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors border-2 ${editingPost?.isPublished ? 'bg-primary border-primary' : 'bg-muted border-border'}`}></div>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${editingPost?.isPublished ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${editingPost?.isPublished ? 'text-primary' : 'text-muted-foreground'}`}>
                  {editingPost?.isPublished ? 'Ready to Publish' : 'Safe as Draft'}
                </span>
              </label>
            </div>
            
            <div className="flex gap-4">
              <Button variant="ghost" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-8" onClick={() => setIsEditorOpen(false)}>
                Discard
              </Button>
              <Button 
                onClick={() => savePostMutation.mutate(editingPost)} 
                disabled={savePostMutation.isPending}
                className="rounded-xl font-black uppercase text-[10px] tracking-widest px-12 h-12 shadow-xl shadow-primary/20"
              >
                {savePostMutation.isPending ? <Loader2 className="animate-spin" /> : "Save Article"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Library Selector */}
      <Dialog open={isMediaLibraryOpen} onOpenChange={setIsMediaLibraryOpen}>
        <DialogContent className="max-w-5xl p-0 border-none rounded-3xl overflow-hidden overflow-y-auto">
          <MediaLibrary 
            onSelect={(media) => {
              setEditingPost({ ...editingPost, imageUrl: media.url });
              setIsMediaLibraryOpen(false);
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
