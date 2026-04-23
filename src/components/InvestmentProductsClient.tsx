"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RealtimeListener } from "@/components/realtime-listener";
import { TrendingUp, Landmark, Sprout, Layers, Plus, Edit2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: "MONEY_MARKET" | "EQUITY" | "FIXED_INCOME";
  type: "MMF" | "STOCK" | "BOND";
  roi: number;
  duration: number;
  minAmount?: number;
  maxAmount?: number;
  nav?: number | null;
  inceptionDate?: string | null;
  activeInvestors?: number;
  isActive: boolean;
}

export default function InvestmentProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formProduct, setFormProduct] = useState({
    name: "",
    category: "MONEY_MARKET" as "MONEY_MARKET" | "EQUITY" | "FIXED_INCOME",
    type: "MMF" as "MMF" | "STOCK" | "BOND",
    roi: "0",
    duration: "30",
    minAmount: "0",
    maxAmount: "",
    nav: "",
    inceptionDate: "",
    isActive: true,
  });

  // ---------- Icons ----------
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "MONEY_MARKET": return <TrendingUp className="h-5 w-5" />;
      case "EQUITY": return <Landmark className="h-5 w-5" />;
      case "FIXED_INCOME": return <Sprout className="h-5 w-5" />;
      default: return <Layers className="h-5 w-5" />;
    }
  };

  const getStatusColor = (isActive: boolean) => isActive ? "bg-green-600" : "bg-yellow-500";

  // ---------- CREATE ----------
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormProduct({
      name: "",
      category: "MONEY_MARKET",
      type: "MMF",
      roi: "0",
      duration: "30",
      minAmount: "0",
      maxAmount: "",
      nav: "",
      inceptionDate: "",
      isActive: true,
    });
    setShowModal(true);
  };

  // ---------- EDIT ----------
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormProduct({
      name: product.name ?? "",
      category: product.category,
      type: product.type,
      roi: String(product.roi ?? 0),
      duration: String(product.duration ?? 30),
      minAmount: String(product.minAmount ?? 0),
      maxAmount: product.maxAmount ? String(product.maxAmount) : "",
      nav: product.nav ? String(product.nav) : "",
      inceptionDate: product.inceptionDate ?? "",
      isActive: product.isActive ?? true,
    });
    setShowModal(true);
  };

  // ---------- SAVE ----------
  const handleSaveProduct = async () => {
    if (!formProduct.name.trim()) return alert("Product name is required");

    const payload = {
      ...formProduct,
      roi: parseFloat(formProduct.roi),
      duration: parseInt(formProduct.duration),
      minAmount: parseFloat(formProduct.minAmount),
      maxAmount: formProduct.maxAmount ? parseFloat(formProduct.maxAmount) : undefined,
      nav: formProduct.nav ? parseFloat(formProduct.nav) : null,
    };

    const method = editingProduct ? "PUT" : "POST";
    const url = editingProduct
      ? `/api/investment-products/${editingProduct.id}`
      : "/api/investment-products";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const savedProduct = await res.json();

    setProducts(prev => {
      const exists = prev.find(p => p.id === savedProduct.id);
      if (exists) return prev.map(p => p.id === savedProduct.id ? savedProduct : p);
      return [savedProduct, ...prev];
    });

    setShowModal(false);
  };

  // ---------- DELETE ----------
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    await fetch(`/api/investment-products/${id}`, { method: "DELETE" });
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // ---------- REALTIME ----------
  useEffect(() => {
    const handleUpdate = (e: any) => {
      const updatedProduct: Product = e.detail;
      setProducts(prev => {
        const exists = prev.find(p => p.id === updatedProduct.id);
        if (exists) return prev.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        return [updatedProduct, ...prev];
      });
    };

    const handleDelete = (e: any) => {
      const deletedProduct: Product = e.detail;
      setProducts(prev => prev.filter(p => p.id !== deletedProduct.id));
    };

    window.addEventListener("product:update", handleUpdate);
    window.addEventListener("product:delete", handleDelete);

    return () => {
      window.removeEventListener("product:update", handleUpdate);
      window.removeEventListener("product:delete", handleDelete);
    };
  }, []);

  return (
    <div className="space-y-8 p-6">
      <RealtimeListener event="product:update" />
      <RealtimeListener event="product:delete" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Investment Products</h1>
          <p className="text-muted-foreground">Manage your investment offerings</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map(product => (
          <Card key={product.id} className="rounded-2xl">
            <CardHeader className="flex justify-between">
              <div className="flex items-center gap-3">
                {getCategoryIcon(product.category)}
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {product.category} • {product.type}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(product.isActive)}>
                {product.isActive ? "Active" : "Inactive"}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>ROI</span><span>{product.roi}%</span></div>
              <div className="flex justify-between"><span>Duration</span><span>{product.duration} days</span></div>
              <div className="flex justify-between"><span>Min Investment</span><span>KES {(product.minAmount ?? 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Max Investment</span><span>{product.maxAmount ?? "-"}</span></div>
              <div className="flex justify-between"><span>NAV</span><span>{product.nav ?? "-"}</span></div>

              <div className="pt-3 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleOpenEdit(product)}>
                  <Edit2 className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleDeleteProduct(product.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>{editingProduct ? "Update Product" : "Create Product"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Product Name"
                value={formProduct.name}
                onChange={e => setFormProduct({ ...formProduct, name: e.target.value })}
              />

              {/* Category */}
              <select
                className="w-full border rounded-lg p-2"
                value={formProduct.category}
                onChange={e => setFormProduct({
                  ...formProduct,
                  category: e.target.value as "MONEY_MARKET" | "EQUITY" | "FIXED_INCOME"
                })}
              >
                <option value="MONEY_MARKET">Money Market</option>
                <option value="EQUITY">Stocks</option>
                <option value="FIXED_INCOME">Bonds</option>
              </select>

              {/* Type */}
              <select
                className="w-full border rounded-lg p-2"
                value={formProduct.type}
                onChange={e => setFormProduct({
                  ...formProduct,
                  type: e.target.value as "MMF" | "STOCK" | "BOND"
                })}
              >
                <option value="MMF">MMF</option>
                <option value="STOCK">Stock</option>
                <option value="BOND">Bond</option>
              </select>

              <Input
                type="number"
                placeholder="ROI (%)"
                value={formProduct.roi}
                onChange={e => setFormProduct({ ...formProduct, roi: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Duration (Days)"
                value={formProduct.duration}
                onChange={e => setFormProduct({ ...formProduct, duration: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Min Investment (KES)"
                value={formProduct.minAmount}
                onChange={e => setFormProduct({ ...formProduct, minAmount: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Max Investment (KES)"
                value={formProduct.maxAmount}
                onChange={e => setFormProduct({ ...formProduct, maxAmount: e.target.value })}
              />
              <Input
                type="number"
                placeholder="NAV (Optional)"
                value={formProduct.nav}
                onChange={e => setFormProduct({ ...formProduct, nav: e.target.value })}
              />
              <Input
                type="date"
                value={formProduct.inceptionDate}
                onChange={e => setFormProduct({ ...formProduct, inceptionDate: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formProduct.isActive}
                  onChange={e => setFormProduct({ ...formProduct, isActive: e.target.checked })}
                />
                <span>Make Product Active</span>
              </div>

              <Button onClick={handleSaveProduct} className="w-full">
                {editingProduct ? "Save Changes" : "Create Product"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}