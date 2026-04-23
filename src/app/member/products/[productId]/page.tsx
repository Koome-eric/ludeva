"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  minAmount: number;
  roi: number;
  duration: number;
  category: string;
}

export default function InvestPage() {
  const router = useRouter();
  const { productId } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [expectedROI, setExpectedROI] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/investment-products/${productId}`);
        if (!res.ok) throw new Error("Product not found");
        const data: Product = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    const amt = parseFloat(amount);
    setExpectedROI(!isNaN(amt) && amt > 0 ? (amt * product.roi) / 100 : 0);
  }, [amount, product]);

  const handleInvest = async () => {
    if (!product) return;

    const investAmount = parseFloat(amount);
    if (isNaN(investAmount) || investAmount < product.minAmount) {
      alert(`Investment must be at least KES ${product.minAmount}`);
      return;
    }

    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          amount: investAmount,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Successfully invested KES ${investAmount} in ${product.name}`);
        router.push("/member/investments"); // ✅ redirect to My Investments
      } else {
        alert(data.error || "Failed to process investment");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred");
    }
  };

  if (loading) return <p className="p-6 text-center">Loading product...</p>;
  if (!product) return <p className="p-6 text-center text-red-500">Product not found</p>;

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Invest in {product.name}</h1>
      <p className="text-muted-foreground">
        Minimum investment: KES {product.minAmount.toLocaleString()}
      </p>

      <div className="space-y-4">
        <Input
          type="number"
          placeholder={`Enter amount (min KES ${product.minAmount})`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="text-sm text-muted-foreground">
          Expected ROI: KES {expectedROI.toLocaleString()}
        </div>

        <Button onClick={handleInvest} className="w-full">
          Invest Now
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/member/products")}
        >
          Back to Products
        </Button>
      </div>
    </div>
  );
}
