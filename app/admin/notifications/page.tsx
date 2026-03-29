"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Variable
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  const { data: templates, isLoading } = useQuery<any[]>({
    queryKey: ["/api/v1/admin/email-templates"],
    queryFn: async () => {
      const res = await fetch("/api/v1/admin/email-templates");
      return res.json();
    }
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async (template: any) => {
      const res = await fetch("/api/v1/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/email-templates"] });
      setIsDialogOpen(false);
      setEditingTemplate(null);
      toast({ title: "Template Saved", description: "The email template has been updated successfully." });
    }
  });

  const seedTemplatesMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/admin/email-templates/seed", { method: "POST" });
      if (!res.ok) throw new Error("Seeding failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/email-templates"] });
      toast({ title: "Templates Restored", description: "Default email templates have been restored." });
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/v1/admin/email-templates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Deletion failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/email-templates"] });
      toast({ title: "Template Deleted", variant: "destructive" });
    }
  });

  const openEdit = (template: any) => {
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingTemplate({ name: "", subject: "", body: "", description: "" });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto font-sans">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Email <span className="text-primary">Templates</span></h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Craft your store's voice with custom automated notifications.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => seedTemplatesMutation.mutate()} 
            disabled={seedTemplatesMutation.isPending}
            className="rounded-full gap-2 px-6 h-12 text-[10px] font-black uppercase tracking-widest border-2"
          >
            {seedTemplatesMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Variable className="w-4 h-4" />}
            Reset to Defaults
          </Button>
          <Button onClick={openCreate} className="rounded-full gap-2 px-8 h-12 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/25">
            <Plus className="w-4 h-4" /> New Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(templates) && templates.map((template) => (
          <Card key={template.id} className="border-2 border-border/50 bg-card/40 backdrop-blur-xl group hover:border-primary/30 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg font-black italic uppercase tracking-tighter">{template.name.replace('_', ' ')}</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-widest line-clamp-1">{template.description || "System Automated Email"}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-muted/30 p-4 rounded-xl mb-6">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Subject</p>
                <p className="text-xs font-bold line-clamp-1">{template.subject}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => openEdit(template)} className="flex-1 rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest h-10">
                  <Edit3 className="w-3 h-3" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPreviewTemplate(template)} className="w-10 rounded-lg p-0 h-10 border-2">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => deleteTemplateMutation.mutate(template.id)} className="w-10 rounded-lg p-0 h-10 border-2 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!Array.isArray(templates) || templates.length === 0) && (
        <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
          <Mail className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            {Array.isArray(templates) ? "No Templates Found" : "Error Loading Templates"}
          </h3>
          <p className="text-xs text-muted-foreground/60 mt-2">
            {Array.isArray(templates) 
              ? "Start by creating your first automated notification." 
              : ((templates as any)?.message || "Authentication required or server error. Please try logging in again.")}
          </p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-3xl bg-background rounded-3xl">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
              {editingTemplate?.id ? "Edit" : "Create"} Template
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            saveTemplateMutation.mutate(editingTemplate);
          }} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Name</label>
                <Input 
                  value={editingTemplate?.name || ""} 
                  onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                  placeholder="registration_welcome"
                  className="rounded-xl border-2 bg-muted/20 h-12 px-4 focus-visible:ring-0 focus-visible:border-primary font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</label>
                <Input 
                  value={editingTemplate?.description || ""} 
                  onChange={(e) => setEditingTemplate({...editingTemplate, description: e.target.value})}
                  placeholder="Sent after user registration"
                  className="rounded-xl border-2 bg-muted/20 h-12 px-4 focus-visible:ring-0 focus-visible:border-primary font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Subject</label>
              <Input 
                value={editingTemplate?.subject || ""} 
                onChange={(e) => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                placeholder="Welcome to {{store_name}}!"
                className="rounded-xl border-2 bg-muted/20 h-12 px-4 focus-visible:ring-0 focus-visible:border-primary font-bold"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">HTML Body</label>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-primary/5 rounded border text-[9px] font-bold text-primary">HTML Content</span>
                  <span className="px-2 py-1 bg-muted rounded border text-[9px] font-bold text-muted-foreground">Variables: {"{{user_name}}, {{store_name}}"}</span>
                </div>
              </div>
              <Textarea 
                value={editingTemplate?.body || ""} 
                onChange={(e) => setEditingTemplate({...editingTemplate, body: e.target.value})}
                placeholder="<h1>Hello {{user_name}}</h1>..."
                className="min-h-[300px] rounded-2xl border-2 bg-muted/20 p-6 focus-visible:ring-0 focus-visible:border-primary font-mono text-sm leading-relaxed"
              />
            </div>

            <DialogFooter className="pt-6 border-t border-border flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl px-8 h-12 text-[10px] font-black uppercase tracking-widest">
                Cancel
              </Button>
              <Button type="submit" disabled={saveTemplateMutation.isPending} className="rounded-xl px-12 h-12 text-[10px] font-black uppercase tracking-widest">
                {saveTemplateMutation.isPending ? <Loader2 className="animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-3xl rounded-3xl">
          <div className="bg-primary/5 p-6 border-b flex justify-between items-center">
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Preview of <span className="text-primary">{previewTemplate?.name}</span></h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="rounded-lg text-[9px] font-black uppercase tracking-[0.2em] h-8">
                Send Test
              </Button>
            </div>
          </div>
          <div className="p-10 bg-white dark:bg-zinc-950 overflow-y-auto max-h-[70vh]">
            <div className="max-w-xl mx-auto border border-border/50 rounded-2xl overflow-hidden shadow-inner">
               <div className="bg-muted p-4 border-b border-border/50">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">Subject</p>
                  <p className="text-sm font-bold">{previewTemplate?.subject.replace('{{store_name}}', 'BRAWEZZ.')}</p>
               </div>
               <div className="p-8" dangerouslySetInnerHTML={{ __html: previewTemplate?.body.replace(/{{user_name}}/g, 'Valued Customer').replace(/{{store_name}}/g, 'BRAWEZZ.') || "" }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
