"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, ArrowLeft, ImagePlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type VariantRow = {
  id?: number;
  material: string;
  size: string;
  priceCents: string;
  sku: string;
  inStock: boolean;
};

function ProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { toast } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [relatedProductIds, setRelatedProductIds] = useState<number[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [variants, setVariants] = useState<VariantRow[]>([
    { material: "Premium Paper", size: "30x40cm", priceCents: "2900", sku: "", inStock: true },
  ]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    orientation: "portrait",
    color: "black",
    isSale: false,
    salePct: 0,
  });

  // Fetch categories and products
  useEffect(() => {
    fetch("/api/v1/admin/categories", { credentials: "include" })
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);

    fetch("/api/v1/admin/products", { credentials: "include" })
      .then((r) => r.json())
      .then(setAllProducts)
      .catch(console.error);
  }, []);

  // Fetch product data if editing
  useEffect(() => {
    if (!editId) return;
    fetch(`/api/v1/admin/products/${editId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((p) => {
        setForm({
          title: p.title,
          slug: p.slug,
          description: p.description || "",
          orientation: p.orientation,
          color: p.color,
          isSale: p.isSale || false,
          salePct: p.salePct || 0,
        });
        setSelectedCategoryIds(p.collections?.map((c: any) => c.id) || []);
        setRelatedProductIds(p.relatedProducts?.map((rp: any) => rp.id) || []);
        setTags(p.tags || []);
        setImageUrls(p.images?.length ? p.images.map((img: any) => img.url) : [""]);
        setVariants(p.variants?.length
          ? p.variants.map((v: any) => ({
              id: v.id,
              material: v.material,
              size: v.size,
              priceCents: String(v.priceCents),
              sku: v.sku,
              inStock: v.inStock,
            }))
          : [{ material: "Premium Paper", size: "30x40cm", priceCents: "2900", sku: "", inStock: true }]
        );
      })
      .catch(console.error);
  }, [editId]);

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: editId ? f.slug : generateSlug(title),
    }));
  };

  // Variants helpers
  const addVariant = () => {
    setVariants((v) => [...v, { material: "Premium Paper", size: "", priceCents: "2900", sku: "", inStock: true }]);
  };

  const removeVariant = (index: number) => {
    setVariants((v) => v.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof VariantRow, value: any) => {
    setVariants((v) => v.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  // Images helpers
  const addImageUrl = () => setImageUrls((urls) => [...urls, ""]);
  const removeImageUrl = (index: number) => setImageUrls((urls) => urls.filter((_, i) => i !== index));
  const updateImageUrl = (index: number, value: string) =>
    setImageUrls((urls) => urls.map((u, i) => (i === index ? value : u)));

  // Category toggle
  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  // Related product toggle
  const toggleRelatedProduct = (id: number) => {
    setRelatedProductIds((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    );
  };

  // Submit
  const handleSubmit = async () => {
    const body = {
      ...form,
      salePct: form.isSale ? form.salePct : 0,
      collectionIds: selectedCategoryIds,
      relatedProductIds,
      tags,
      variants: variants.map((v) => ({
        ...v,
        priceCents: parseInt(v.priceCents) || 0,
        sku: v.sku || `${generateSlug(form.title)}-${v.size?.toLowerCase().replace(/\s/g, "")}`,
      })),
      imageUrls: imageUrls.filter((u) => u.trim()),
    };

    const url = editId ? `/api/v1/admin/products/${editId}` : "/api/v1/admin/products";
    const method = editId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });

    if (res.ok) {
      toast({ title: editId ? "Product updated" : "Product created" });
      router.push("/admin/products");
    } else {
      const err = await res.json().catch(() => null);
      toast({ title: "Error", description: err?.message || "Failed to save product", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/products")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">
            {editId ? "Edit Product" : "New Product"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {editId ? "Update product details" : "Add a new product to your store"}
          </p>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold uppercase tracking-wider">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Stadium Lights Poster"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="stadium-lights-poster"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="A brief description of this product..."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Orientation</Label>
              <Select value={form.orientation} onValueChange={(v) => setForm((f) => ({ ...f, orientation: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                placeholder="e.g. blue, black, gold"
              />
            </div>
          </div>
          
          <div className="space-y-2 pt-2 border-t border-border">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="gap-1 rounded-none px-2 py-1">
                  {tag}
                  <button type="button" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagsInput.trim()) {
                  e.preventDefault();
                  if (!tags.includes(tagsInput.trim())) setTags([...tags, tagsInput.trim()]);
                  setTagsInput("");
                }
              }}
              placeholder="Type a tag and press Enter"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Discount */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold uppercase tracking-wider">Pricing & Discount</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Switch
              checked={form.isSale}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isSale: v }))}
            />
            <Label>Enable Discount</Label>
          </div>
          {form.isSale && (
            <div className="space-y-2 max-w-xs">
              <Label>Discount Percentage (%)</Label>
              <Input
                type="number"
                min={1}
                max={99}
                value={form.salePct}
                onChange={(e) => setForm((f) => ({ ...f, salePct: parseInt(e.target.value) || 0 }))}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold uppercase tracking-wider">Sizes & Materials (Variants)</CardTitle>
          <Button variant="outline" size="sm" onClick={addVariant} className="gap-1 rounded-none">
            <Plus className="w-3 h-3" /> Add Variant
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_120px_1fr_80px_40px] gap-2 px-4 py-2 bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span>Material</span>
              <span>Size</span>
              <span>Price (cents)</span>
              <span>SKU</span>
              <span>Stock</span>
              <span></span>
            </div>
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_120px_1fr_80px_40px] gap-2 px-4 py-2 border-t border-border items-center">
                <Input
                  value={v.material}
                  onChange={(e) => updateVariant(i, "material", e.target.value)}
                  placeholder="Premium Paper"
                  className="h-9"
                />
                <Input
                  value={v.size}
                  onChange={(e) => updateVariant(i, "size", e.target.value)}
                  placeholder="30x40cm"
                  className="h-9"
                />
                <Input
                  type="number"
                  value={v.priceCents}
                  onChange={(e) => updateVariant(i, "priceCents", e.target.value)}
                  placeholder="2900"
                  className="h-9"
                />
                <Input
                  value={v.sku}
                  onChange={(e) => updateVariant(i, "sku", e.target.value)}
                  placeholder="auto-generated"
                  className="h-9"
                />
                <div className="flex justify-center">
                  <Switch
                    checked={v.inStock}
                    onCheckedChange={(checked) => updateVariant(i, "inStock", checked)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVariant(i)}
                  className="text-destructive hover:text-destructive h-9 w-9"
                  disabled={variants.length <= 1}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold uppercase tracking-wider">Images</CardTitle>
          <Button variant="outline" size="sm" onClick={addImageUrl} className="gap-1 rounded-none">
            <ImagePlus className="w-3 h-3" /> Add Image URL
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {imageUrls.map((url, i) => (
            <div key={i} className="flex items-center gap-3">
              <Input
                value={url}
                onChange={(e) => updateImageUrl(i, e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1"
              />
              {url && (
                <img src={url} alt="" className="w-12 h-12 object-cover rounded border border-border shrink-0" />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeImageUrl(i)}
                disabled={imageUrls.length <= 1}
                className="text-destructive hover:text-destructive shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold uppercase tracking-wider">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedCategoryIds.includes(cat.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <Checkbox
                  checked={selectedCategoryIds.includes(cat.id)}
                  onCheckedChange={() => toggleCategory(cat.id)}
                />
                <span className="text-sm font-medium">{cat.title}</span>
              </label>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full">No categories found. Create one first.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Related Products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold uppercase tracking-wider">Related Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2">
            {allProducts.filter(p => p.id !== Number(editId)).map((p) => (
              <label
                key={p.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  relatedProductIds.includes(p.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <Checkbox
                  checked={relatedProductIds.includes(p.id)}
                  onCheckedChange={() => toggleRelatedProduct(p.id)}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{p.title}</span>
                  <span className="text-xs text-muted-foreground truncate">/{p.slug}</span>
                </div>
              </label>
            ))}
            {allProducts.length <= (editId ? 1 : 0) && (
              <p className="text-sm text-muted-foreground col-span-full">No other products available.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
        <Button variant="outline" className="rounded-none" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="rounded-none gap-2">
          <Save className="w-4 h-4" />
          {editId ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Loading...</div>}>
      <ProductFormContent />
    </Suspense>
  );
}
