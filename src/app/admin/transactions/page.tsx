"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExportButton } from "./ExportButton";
import { format } from "date-fns";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch("/api/admin/transactions");
        const data = await res.json();

        // Ensure it's an array
        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          console.error("Expected array but got:", data);
          setTransactions([]);
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  if (loading) return <p>Loading transactions...</p>;

  const formattedTransactions = transactions.map((txn) => ({
    id: txn.id,
    investor: txn.investor || "Unknown",
    type: txn.type,
    amount: txn.amount,
    status: txn.status,
    date: txn.date,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">All Transactions</h1>
          <p className="text-muted-foreground">Complete financial activity for all members.</p>
        </div>

        <ExportButton data={formattedTransactions} />
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Investor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount (KES)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {formattedTransactions.length ? (
                formattedTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{format(new Date(tx.date), "dd MMM yyyy")}</TableCell>
                    <TableCell>{tx.investor}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{tx.type}</Badge>
                    </TableCell>
                    <TableCell className={`text-right font-mono ${tx.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {tx.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge>{tx.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}