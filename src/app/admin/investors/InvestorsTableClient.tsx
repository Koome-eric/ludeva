"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { deleteMember } from "@/app/api/admin/kyc-action/route";

type Investor = {
  id: string;
  fullName: string | null;
  email: string;
  createdAt: string | Date;
  phone: string | null;
  nationalId: string | null;
  onboardingCompleted: boolean;
};

const getKycStatusVariant = (status: boolean): "success" | "warning" => (status ? "success" : "warning");

export default function InvestorsTableClient({ investors: initialInvestors }: { investors: Investor[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [investors, setInvestors] = useState(initialInvestors);
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<Investor | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = investors.filter((inv) => {
    const q = search.toLowerCase();
    return (
      (inv.fullName?.toLowerCase().includes(q) ?? false) ||
      inv.email.toLowerCase().includes(q) ||
      (inv.phone?.toLowerCase().includes(q) ?? false) ||
      (inv.nationalId?.toLowerCase().includes(q) ?? false)
    );
  });

  const closeDialog = () => {
    setTarget(null);
    setConfirmText("");
  };

  const confirmDelete = () => {
    if (!target) return;
    startTransition(async () => {
      try {
        await deleteMember(target.id);
        setInvestors((prev) => prev.filter((inv) => inv.id !== target.id));
        toast({ title: "Investor deleted", description: `${target.fullName || target.email} and all their related records were removed.` });
        closeDialog();
        router.refresh();
      } catch (e: any) {
        toast({ variant: "destructive", title: "Delete failed", description: e?.message || "Please try again." });
      }
    });
  };

  return (
    <>
      {/* Search */}
      <div className="relative w-full sm:max-w-xs mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search name, email, phone, ID…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>National ID</TableHead>
              <TableHead className="text-center">Onboarding Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((investor) => (
              <TableRow key={investor.id}>
                <TableCell className="font-medium">{investor.fullName || "—"}</TableCell>
                <TableCell className="max-w-[200px] truncate">{investor.email}</TableCell>
                <TableCell className="whitespace-nowrap">{format(new Date(investor.createdAt), "dd MMM, yyyy")}</TableCell>
                <TableCell>{investor.phone || "N/A"}</TableCell>
                <TableCell>{investor.nationalId || "N/A"}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={getKycStatusVariant(investor.onboardingCompleted)}>
                    {investor.onboardingCompleted ? "Completed" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setTarget(investor)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  {investors.length === 0 ? "No investors yet." : "No investors match that search."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation */}
      <Dialog open={!!target} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {target?.fullName || target?.email}?</DialogTitle>
            <DialogDescription>
              This permanently deletes the member and everything tied to their account —
              investments, payments, transactions, documents, chat history, and notifications.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Type <span className="font-mono font-semibold">DELETE</span> to confirm
            </label>
            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={confirmText !== "DELETE" || isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting…
                </>
              ) : (
                "Delete Permanently"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
