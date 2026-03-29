"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Pencil, FolderOpen, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Category = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  sort: number;
  isActive: boolean;
  productCount: number;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const { toast } = useToast();

  const fetchCategories = useCallback(() => {
    fetch("/api/v1/admin/categories", { credentials: "include" })
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    // Auto-generate slug from title if not editing
    if (!editing) {
      const title = form.get("title") as string;
      form.set("slug", generateSlug(title));
    }

    const url = editing
      ? `/api/v1/admin/categories/${editing.id}`
      : "/api/v1/admin/categories";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, { method, body: form, credentials: "include" });
    if (res.ok) {
      toast({ title: editing ? "Category updated" : "Category created" });
      setIsDialogOpen(false);
      setEditing(null);
      fetchCategories();
    } else {
      toast({ title: "Error", description: "Failed to save category", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/v1/admin/categories/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      toast({ title: "Category deleted" });
      fetchCategories();
    }
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage product categories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="rounded-none gap-2">
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-black uppercase italic tracking-tighter">
                {editing ? "Edit Category" : "New Category"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={editing?.title || ""} placeholder="e.g. Football Posters" required />
              </div>

              {editing && (
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" name="slug" defaultValue={editing.slug} placeholder="football-posters" />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editing?.description || ""} placeholder="A brief description of this category" rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Category Image</Label>
                <Input id="image" name="image" type="file" accept="image/*" />
                {editing?.imageUrl && (
                  <img src={editing.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-border mt-2" />
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" className="rounded-none" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-none">
                  {editing ? "Save Changes" : "Create Category"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <Card className="border-dashed col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="w-10 h-10 text-muted-foreground mb-4 opacity-30" />
              <p className="text-muted-foreground">No categories yet. Create your first category!</p>
            </CardContent>
          </Card>
        ) : (
          categories.map((cat) => (
            <Card key={cat.id} className="overflow-hidden group hover:border-primary/30 transition-all">
              {cat.imageUrl ? (
                <img src={cat.imageUrl} alt={cat.title} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-muted flex items-center justify-center">
                  <FolderOpen className="w-10 h-10 text-muted-foreground opacity-30" />
                </div>
              )}
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{cat.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">/{cat.slug}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    <Package className="w-3 h-3" />
                    {cat.productCount}
                  </div>
                </div>
                {cat.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{cat.description}</p>
                )}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(cat)} className="gap-1">
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
                        <Trash2 className="w-3 h-3" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{cat.title}"?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove the category and unlink all associated products. This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(cat.id)} className="bg-destructive text-destructive-foreground">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
