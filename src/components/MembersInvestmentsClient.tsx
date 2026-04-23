"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Landmark, Sprout, Layers, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  roi: number;
  duration: number;
  minAmount: number;
  nav?: number;
  inceptionDate?: string;
  activeInvestors?: number;
  isActive: boolean;
}

// ---------- Category Icons ----------
const getCategoryIcon = (category: string) => {
  switch (category) {
    case "MMF":
      return <TrendingUp className="h-5 w-5" />;
    case "Real Estate":
      return <Landmark className="h-5 w-5" />;
    case "Agriculture":
      return <Sprout className="h-5 w-5" />;
    default:
      return <Layers className="h-5 w-5" />;
  }
};

// ---------- Status Badge ----------
const getStatusColor = (isActive: boolean) =>
  isActive ? "bg-green-600" : "bg-yellow-500";

export default function MembersInvestmentsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // ---------- Fetch Products ----------
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/investment-products");
      const data: Product[] = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <p className="p-6 text-center">Loading products...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Available Investments</h1>
      <p className="text-muted-foreground">
        Explore our investment opportunities and grow your portfolio.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.length === 0 && (
          <p className="text-muted-foreground text-center col-span-full">
            No investment products available at the moment.
          </p>
        )}

        {products.map((product) => (
          <Card
            key={product.id}
            className="rounded-2xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 duration-200"
          >
            <CardHeader className="flex justify-between items-center pb-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-muted">
                  {getCategoryIcon(product.category)}
                </div>
                <div>
                  <h3 className="font-semibold leading-none">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
              </div>
              <Badge className={getStatusColor(product.isActive)}>
                {product.isActive ? "Active" : "Inactive"}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm" title={`Return on Investment for ${product.name}`}>
                <span className="text-muted-foreground">ROI</span>
                <span className="font-medium">{product.roi}%</span>
              </div>
              <div className="flex justify-between text-sm" title={`Investment duration in days for ${product.name}`}>
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{product.duration} days</span>
              </div>
              <div className="flex justify-between text-sm" title={`Minimum amount required to invest in ${product.name}`}>
                <span className="text-muted-foreground">Minimum Investment</span>
                <span className="font-medium">
                  KES {product.minAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Investors</span>
                <span className="font-medium">{product.activeInvestors || 0}</span>
              </div>

              <div className="flex justify-between gap-2 mt-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedProduct(product)}
                >
                  View Details
                </Button>

                {product.isActive && (
                  <Button
                    className="flex-1"
                    onClick={() => window.location.href = `/member/products/${product.id}`}
                  >
                    Invest
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---------- Modal ---------- */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedProduct(null)}
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
            <p className="text-muted-foreground mb-4">{selectedProduct.category}</p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>ROI:</span>
                <span>{selectedProduct.roi}%</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{selectedProduct.duration} days</span>
              </div>
              <div className="flex justify-between">
                <span>Minimum Investment:</span>
                <span>KES {selectedProduct.minAmount.toLocaleString()}</span>
              </div>
              {selectedProduct.nav && (
                <div className="flex justify-between">
                  <span>NAV:</span>
                  <span>{selectedProduct.nav}</span>
                </div>
              )}
              {selectedProduct.inceptionDate && (
                <div className="flex justify-between">
                  <span>Inception Date:</span>
                  <span>{new Date(selectedProduct.inceptionDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge className={getStatusColor(selectedProduct.isActive)}>
                  {selectedProduct.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <Button
              className="mt-6 w-full"
              onClick={() => window.location.href = `/member/products/${selectedProduct.id}`}
            >
              Invest in {selectedProduct.name}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
