"use client";

import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import type { InvestmentRowView } from "./page";

export function InvestmentActions({ investment }: { investment: InvestmentRowView }) {
  const { toast } = useToast();

  const handleDownload = () => {
    const content = JSON.stringify(investment, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `investment_${investment.id}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Started",
      description: "Investment details downloaded.",
    });
  };

  return (
    <div className="inline-flex gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="icon" variant="ghost">
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Investment Details</DialogTitle>
            <DialogDescription>Account: {investment.accountNo}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm mt-2">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-muted-foreground">Period</span>
              <span>{investment.periodLabel}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-muted-foreground">Principal</span>
              <span>
                {investment.principal !== null
                  ? `KES ${investment.principal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-muted-foreground">ROI</span>
              <span>{investment.roi}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-muted-foreground">Withdrawal</span>
              <span>
                {investment.withdrawal !== null
                  ? `KES ${investment.withdrawal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-muted-foreground">Closing Balance</span>
              <span className="font-bold">
                KES {investment.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-muted-foreground">Date</span>
              <span>{format(new Date(investment.date), "dd MMM yyyy")}</span>
            </div>
            {investment.notes && (
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium text-muted-foreground">Notes</span>
                <span>{investment.notes}</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Button size="icon" variant="ghost" onClick={handleDownload}>
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}
