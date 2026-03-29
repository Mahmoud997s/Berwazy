"use client";
import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  GripVertical, 
  Eye, 
  EyeOff, 
  ExternalLink,
  User,
  Palette,
  Megaphone,
  Share2,
  Code,
  Loader2,
  Save,
  CheckCircle2,
  Search,
  X,
  Store,
  Images,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MediaLibrary } from "@/components/media-library";
import { ImageIcon } from "lucide-react";

type Banner = {
  id: number;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkText: string | null;
  secondaryLinkUrl: string | null;
  secondaryLinkText: string | null;
  sort: number;
  isActive: boolean;
};

export default function GeneralDesignSettingsPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- Store Settings Data ---
  const { data: settings, isLoading: settingsLoading } = useQuery<any[]>({
    queryKey: ["/api/v1/admin/settings"],
    queryFn: async () => {
      const res = await fetch("/api/v1/admin/settings", { credentials: "include" });
      return res.json();
    }
  });

  const saveSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: string }) => {
      await fetch("/api/v1/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/settings"] });
      toast({ title: "Settings Updated", description: "Change saved successfully." });
    }
  });

  const getSetting = (key: string) => (Array.isArray(settings) ? settings.find(s => s.key === key)?.value : "") || "";

  // --- Banner Management Logic ---
  const fetchBanners = useCallback(() => {
    fetch("/api/v1/admin/banners", { credentials: "include" })
      .then((r) => r.json())
      .then(setBanners)
      .catch(console.error);
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (selectedImageUrl) {
      form.append("imageUrl", selectedImageUrl);
    }
    const url = editing ? `/api/v1/admin/banners/${editing.id}` : "/api/v1/admin/banners";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, body: form, credentials: "include" });
    if (res.ok) {
      toast({ title: editing ? "Banner updated" : "Banner created" });
      setIsDialogOpen(false);
      setEditing(null);
      fetchBanners();
    } else {
      toast({ title: "Error", description: "Failed to save banner", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/v1/admin/banners/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      toast({ title: "Banner deleted" });
      fetchBanners();
    }
  };

  const handleToggle = async (banner: Banner) => {
    const form = new FormData();
    form.append("isActive", String(!banner.isActive));
    await fetch(`/api/v1/admin/banners/${banner.id}`, { method: "PATCH", body: form, credentials: "include" });
    fetchBanners();
  };

  const openEdit = (banner: Banner) => {
    setEditing(banner);
    setSelectedImageUrl(null);
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setSelectedImageUrl(null);
    setIsDialogOpen(true);
  };

  if (settingsLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic">General Design Settings</h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest">Master control for store branding, style, and announcements.</p>
      </div>

      <Card className="border-2 border-border/50 bg-card/40 backdrop-blur-xl">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle className="text-sm uppercase tracking-[0.3em] flex items-center gap-2">
            <div className="w-2 h-2 bg-primary animate-pulse" />
            Core Identity & Aesthetic
          </CardTitle>
          <CardDescription className="text-[10px] uppercase tracking-widest">Control how your store looks and feels to visitors.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-12">
          
          {/* Branding Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary border-b border-primary/20 pb-2">
              <User className="w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Store Branding</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Store Name</label>
                <Input 
                  defaultValue={getSetting("store_name") || "BRAWEZZ."} 
                  onBlur={(e) => saveSettingMutation.mutate({ key: "store_name", value: e.target.value })}
                  className="h-10 font-black italic uppercase tracking-tighter"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Store Slogan</label>
                <Input 
                  defaultValue={getSetting("store_slogan") || "Premium quality posters for the modern home."} 
                  onBlur={(e) => saveSettingMutation.mutate({ key: "store_slogan", value: e.target.value })}
                  className="h-10 text-xs"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Logo URL (Image)</label>
                <Input 
                  placeholder="e.g. /logo.png"
                  defaultValue={getSetting("logo_url")} 
                  onBlur={(e) => saveSettingMutation.mutate({ key: "logo_url", value: e.target.value })}
                  className="h-10 text-xs font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Favicon URL</label>
                <Input 
                  placeholder="e.g. /favicon.ico"
                  defaultValue={getSetting("favicon_url") || "/favicon.ico"} 
                  onBlur={(e) => saveSettingMutation.mutate({ key: "favicon_url", value: e.target.value })}
                  className="h-10 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Visual Style Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary border-b border-primary/20 pb-2">
              <Palette className="w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Colors & Typography</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Primary Accent Color</label>
                <div className="flex gap-2">
                  <Input 
                    type="color"
                    defaultValue={getSetting("primary_color") || "#DAA520"} 
                    onChange={(e) => saveSettingMutation.mutate({ key: "primary_color", value: e.target.value })}
                    className="h-10 w-12 p-1 bg-transparent border-none cursor-pointer"
                  />
                  <Input 
                    defaultValue={getSetting("primary_color") || "#DAA520"} 
                    onBlur={(e) => saveSettingMutation.mutate({ key: "primary_color", value: e.target.value })}
                    className="h-10 text-xs font-mono uppercase"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">English Font</label>
                <select 
                  defaultValue={getSetting("font_family_en") || "Inter"}
                  onChange={(e) => saveSettingMutation.mutate({ key: "font_family_en", value: e.target.value })}
                  className="w-full flex h-10 rounded-md border border-input bg-background/50 px-3 py-2 text-xs font-bold uppercase tracking-widest"
                >
                  <option value="Inter">Inter (Clean)</option>
                  <option value="Outfit">Outfit (Display)</option>
                  <option value="Roboto">Roboto (Classic)</option>
                  <option value="Montserrat">Montserrat (Modern)</option>
                  <option value="Playfair Display">Playfair (Elegant)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Arabic Font</label>
                <select 
                  defaultValue={getSetting("font_family_ar") || "Inter"}
                  onChange={(e) => saveSettingMutation.mutate({ key: "font_family_ar", value: e.target.value })}
                  className="w-full flex h-10 rounded-md border border-input bg-background/50 px-3 py-2 text-xs font-bold uppercase tracking-widest"
                >
                  <option value="Inter">Default (Inter)</option>
                  <option value="Cairo">Cairo (Sharp)</option>
                  <option value="Almarai">Almarai (Soft)</option>
                  <option value="Tajawal">Tajawal (Elegant)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Navbar Icon Style</label>
                <select 
                  defaultValue={getSetting("navbar_icon_style") || "minimal"}
                  onChange={(e) => saveSettingMutation.mutate({ key: "navbar_icon_style", value: e.target.value })}
                  className="w-full flex h-10 rounded-md border border-input bg-background/50 px-3 py-2 text-xs font-bold uppercase tracking-widest"
                >
                  <option value="minimal">Minimal (Default)</option>
                  <option value="bold">Bold & Thick</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Navbar Animation</label>
                <select 
                  defaultValue={getSetting("navbar_animation") || "fade"}
                  onChange={(e) => saveSettingMutation.mutate({ key: "navbar_animation", value: e.target.value })}
                  className="w-full flex h-10 rounded-md border border-input bg-background/50 px-3 py-2 text-xs font-bold uppercase tracking-widest"
                >
                  <option value="none">None</option>
                  <option value="fade">Fade In</option>
                  <option value="slide">Slide Down</option>
                </select>
              </div>
            </div>
          </div>

          {/* Announcement Bar Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary border-b border-primary/20 pb-2">
              <Megaphone className="w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Announcement Bar (Small Banner)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Banner Message</label>
                <Input 
                  defaultValue={getSetting("announcement_text") || "Free worldwide shipping on orders over €100"} 
                  onBlur={(e) => saveSettingMutation.mutate({ key: "announcement_text", value: e.target.value })}
                  className="h-10 text-xs"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Link Text (Optional)</label>
                <Input 
                  placeholder="e.g. Shop Now"
                  defaultValue={getSetting("announcement_link_text")} 
                  onBlur={(e) => saveSettingMutation.mutate({ key: "announcement_link_text", value: e.target.value })}
                  className="h-10 text-xs"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Background Color</label>
                <div className="flex gap-2">
                  <Input 
                    type="color"
                    defaultValue={getSetting("announcement_bg_color") || "#000000"} 
                    onChange={(e) => saveSettingMutation.mutate({ key: "announcement_bg_color", value: e.target.value })}
                    className="h-10 w-12 p-1 bg-transparent border-none"
                  />
                  <Input 
                    defaultValue={getSetting("announcement_bg_color") || "#000000"} 
                    onBlur={(e) => saveSettingMutation.mutate({ key: "announcement_bg_color", value: e.target.value })}
                    className="h-10 text-xs font-mono uppercase"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Link URL</label>
                <Input 
                  placeholder="e.g. /collections/sale"
                  defaultValue={getSetting("announcement_link_url")} 
                  onBlur={(e) => saveSettingMutation.mutate({ key: "announcement_link_url", value: e.target.value })}
                  className="h-10 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary border-b border-primary/20 pb-2">
              <Share2 className="w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Social Media Links</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Facebook URL</label>
                <Input 
                  placeholder="https://facebook.com/yourstore"
                  defaultValue={getSetting("social_facebook")} 
                  onBlur={(e) => saveSettingMutation.mutate({ key: "social_facebook", value: e.target.value })}
                  className="h-10 text-xs font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Instagram URL</label>
                <Input 
                  placeholder="https://instagram.com/yourstore"
                  defaultValue={getSetting("social_instagram")} 
                  onBlur={(e) => saveSettingMutation.mutate({ key: "social_instagram", value: e.target.value })}
                  className="h-10 text-xs font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Twitter (X) URL</label>
                <Input 
                  placeholder="https://twitter.com/yourstore"
                  defaultValue={getSetting("social_twitter")} 
                  onBlur={(e) => saveSettingMutation.mutate({ key: "social_twitter", value: e.target.value })}
                  className="h-10 text-xs font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">TikTok URL</label>
                <Input 
                  placeholder="https://tiktok.com/@yourstore"
                  defaultValue={getSetting("social_tiktok")} 
                  onBlur={(e) => saveSettingMutation.mutate({ key: "social_tiktok", value: e.target.value })}
                  className="h-10 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Advanced Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary border-b border-primary/20 pb-2">
              <Code className="w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Tracking Scripts & Customs</h3>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Header Scripts (Pixel, Analysis, etc.)</label>
                <textarea 
                  placeholder="Injects into <head>"
                  defaultValue={getSetting("header_script")} 
                  onBlur={(e) => saveSettingMutation.mutate({ key: "header_script", value: e.target.value })}
                  className="w-full flex min-h-[100px] rounded-md border border-input bg-background/50 px-3 py-2 text-xs font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Footer Scripts</label>
                <textarea 
                  placeholder="Injects before </body>"
                  defaultValue={getSetting("footer_script")} 
                  onBlur={(e) => saveSettingMutation.mutate({ key: "footer_script", value: e.target.value })}
                  className="w-full flex min-h-[100px] rounded-md border border-input bg-background/50 px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hero Banners Section */}
      <div className="space-y-6 pt-10 border-t-4 border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <Images className="w-6 h-6 text-primary" />
              Home Page Hero Banners
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Manage large visual banners for the homepage slider.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(null)} className="rounded-none gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" /> Add New Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-black uppercase italic tracking-tighter">
                  {editing ? "Edit Banner" : "New Banner"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" defaultValue={editing?.title || ""} placeholder="e.g. Summer Sale" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input id="subtitle" name="subtitle" defaultValue={editing?.subtitle || ""} placeholder="e.g. Up to 50% off" />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Banner Image</Label>
                  <div className="flex flex-col gap-4">
                    {/* Preview Area */}
                    {(selectedImageUrl || editing?.imageUrl) && (
                      <div className="relative group w-full h-48 rounded-2xl overflow-hidden border-2 border-border shadow-inner bg-muted">
                        <img 
                          src={selectedImageUrl || editing?.imageUrl} 
                          alt="Banner Preview" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <p className="text-[10px] font-black uppercase tracking-widest text-white">Current Selection</p>
                        </div>
                      </div>
                    )}

                    {/* Selector Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <Input 
                          id="image" 
                          name="image" 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={() => setSelectedImageUrl(null)} // Reset remote selection if local file picked
                        />
                        <Button type="button" variant="outline" className="w-full rounded-xl gap-2 h-12 border-dashed">
                          <Upload className="w-4 h-4" /> Upload New
                        </Button>
                      </div>
                      
                      <Dialog open={isMediaLibraryOpen} onOpenChange={setIsMediaLibraryOpen}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="secondary" className="w-full rounded-xl gap-2 h-12 bg-primary/10 text-primary hover:bg-primary/20">
                            <ImageIcon className="w-4 h-4" /> Media Library
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl p-0 overflow-hidden border-none shadow-3xl">
                           <MediaLibrary 
                            onSelect={(m) => {
                              setSelectedImageUrl(m.url);
                              setIsMediaLibraryOpen(false);
                            }} 
                           />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Primary Button</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkText">Button Text</Label>
                      <Input id="linkText" name="linkText" defaultValue={editing?.linkText || ""} placeholder="e.g. Shop Now" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkUrl">Button URL</Label>
                      <Input id="linkUrl" name="linkUrl" defaultValue={editing?.linkUrl || ""} placeholder="e.g. /collections/sale" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Secondary Button (Optional)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="secondaryLinkText">Button Text</Label>
                      <Input id="secondaryLinkText" name="secondaryLinkText" defaultValue={editing?.secondaryLinkText || ""} placeholder="e.g. Learn More" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryLinkUrl">Button URL</Label>
                      <Input id="secondaryLinkUrl" name="secondaryLinkUrl" defaultValue={editing?.secondaryLinkUrl || ""} placeholder="e.g. /about" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" className="rounded-none" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-none">
                    {editing ? "Save Changes" : "Create Banner"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Banners List */}
        <div className="grid grid-cols-1 gap-4">
          {banners.length === 0 ? (
            <Card className="border-dashed py-12">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <Images className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">No banners yet. Create your first banner!</p>
              </CardContent>
            </Card>
          ) : (
            banners.map((banner) => (
              <Card key={banner.id} className={`transition-all border-2 ${!banner.isActive ? "opacity-40 grayscale" : "border-border/50 hover:border-primary/50"}`}>
                <CardContent className="flex items-center gap-6 py-4">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab shrink-0" />
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || "Banner"}
                    className="w-40 h-24 object-cover rounded-lg border border-border shrink-0 shadow-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-black uppercase italic tracking-tighter text-lg truncate">{banner.title || "Untitled Banner"}</p>
                    <p className="text-sm text-muted-foreground truncate italic">{banner.subtitle || "No subtitle"}</p>
                    {banner.linkText && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded">
                          {banner.linkText}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-center gap-1 mr-4">
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{banner.isActive ? "ACTIVE" : "HIDDEN"}</span>
                      <Switch
                        checked={banner.isActive}
                        onCheckedChange={() => handleToggle(banner)}
                      />
                    </div>
                    <Button variant="outline" size="icon" onClick={() => openEdit(banner)} className="rounded-none">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive hover:text-white rounded-none border-destructive/50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this banner?</AlertDialogTitle>
                          <AlertDialogDescription>This action will permanently remove the hero banner from the homepage.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(banner.id)} className="bg-destructive text-destructive-foreground">
                            Delete Permanently
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
    </div>
  );
}
