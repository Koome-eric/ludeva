"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, PieChart } from "lucide-react";

type Investment = {
  id: string;
  amount: number;
  status: string;
  productName: string;
  createdAt: string;

  user: {
    fullName?: string;
    email: string;
  };
};

export default function InvestmentsPage() {
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestments = async () => {
    try {
      const res = await fetch("/api/admin/investments");
      const data = await res.json();

      setInvestments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Investments fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const filtered = investments.filter((inv) => {
    const matchesTab =
      tab === "All" || inv.status.toLowerCase() === tab.toLowerCase();

    const matchesSearch =
      inv.user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      inv.user.email.toLowerCase().includes(search.toLowerCase()) ||
      inv.productName.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Investments</h1>
          <p className="text-muted-foreground">
            Monitor all investor activity across Ludeva products
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search investor or product"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="All" onValueChange={setTab}>
        <TabsList className="rounded-xl">
          <TabsTrigger value="All">All Investments</TabsTrigger>
          <TabsTrigger value="Active">Active</TabsTrigger>
          <TabsTrigger value="Completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">
              Loading investments...
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4">Investor</th>
                    <th className="text-left p-4">Product</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Start Date</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((inv) => (
                    <tr key={inv.id} className="border-b last:border-none">
                      <td className="p-4 font-medium">
                        {inv.user.fullName || inv.user.email}
                      </td>

                      <td className="p-4">{inv.productName}</td>

                      <td className="p-4">
                        KES {inv.amount.toLocaleString()}
                      </td>

                      <td className="p-4">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-4">
                        <Badge
                          className={
                            inv.status === "ACTIVE"
                              ? "bg-green-600"
                              : "bg-blue-600"
                          }
                        >
                          {inv.status}
                        </Badge>
                      </td>

                      <td className="p-4 text-right">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="p-10 text-center text-muted-foreground">
                  <PieChart className="mx-auto h-8 w-8 mb-3" />
                  No investments found
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}