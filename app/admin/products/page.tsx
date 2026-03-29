"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, Trash2, Pencil, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ProductItem = {
  id: number;
  slug: string;
  title: string;
  images: { url: string }[];
  variants: { priceCents: number; inStock: boolean }[];
  collections: { title: string }[];
  isSale: boolean;
  salePct: number;
  createdAt: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const fetchProducts = useCallback(() => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    fetch(`/api/v1/admin/products${params}`, { credentials: "include" })
      .then((r) => r.json())
      .then(setProducts)
      .catch(console.error);
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/v1/admin/products/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      toast({ title: "Product deleted" });
      fetchProducts();
    }
  };

  const getMinPrice = (variants: { priceCents: number }[]) => {
    if (!variants.length) return 0;
    return Math.min(...variants.map((v) => v.priceCents));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} products total</p>
        </div>
        <Button asChild className="rounded-none gap-2">
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                  <Package className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} className="group">
                  <TableCell>
                    {product.images?.[0] ? (
                      <img src={product.images[0].url} alt="" className="w-12 h-12 object-cover rounded border border-border" />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        <Package className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">{product.title}</p>
                    <p className="text-xs text-muted-foreground">/{product.slug}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.collections?.map((c: any) => (
                        <Badge key={c.title} variant="secondary" className="text-[10px]">
                          {c.title}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">€{(getMinPrice(product.variants) / 100).toFixed(2)}</span>
                    {product.isSale && (
                      <Badge variant="destructive" className="ml-2 text-[10px]">-{product.salePct}%</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{product.variants?.length || 0} variants</span>
                  </TableCell>
                  <TableCell>
                    {product.variants?.some((v) => v.inStock) ? (
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">In Stock</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">Out of Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/products/new?edit=${product.id}`}>
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{product.title}"?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete this product and all its variants and images.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-destructive text-destructive-foreground">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
