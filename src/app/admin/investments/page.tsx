"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, PieChart, RefreshCw, Eye, Pencil, Trash2, TrendingUp, TrendingDown, Wallet, Landmark } from "lucide-react";

const SHEETS_SECRET = process.env.NEXT_PUBLIC_SHEETS_API_SECRET || "ludeva-sheets-secret-2025";

type MemberInvestment = {
  id: string;
  memberEmail: string;
  memberName?: string | null;
  accounts: string[];
  periodLabel?: string | null;
  totalPrincipal: number;
  totalInvested: number;
  latestClosingBalance: number | null;
  totalRoi: number;
  rowCount: number;
  lastUpdated: string;
};

type ReportRow = {
  id: string;
  memberEmail: string;
  accountNo?: string;
  memberName?: string;
  date?: string;
  principal?: string;
  rate?: string;
  roi?: string;
  withdrawal?: string;
  closingBal?: string;
  quarter?: string;
  periodLabel?: string;
  notes?: string;
  uploadedAt: string;
};

const emptyRecordForm = {
  memberEmail: "",
  accountNo: "",
  periodLabel: "",
  date: "",
  principal: "",
  rate: "",
  roi: "",
  withdrawal: "",
  closingBal: "",
  notes: "",
};

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return `KES ${n.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Mirrors parseReportAmount() in @/lib/member-reports (kept local/pure here
// since that module also pulls in prisma, which shouldn't ship to the client
// bundle). Parses values like "1,234,567.50" or "KES 1,234" into a number.
function parseNum(value?: string | null): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.\-]/g, "");
  if (!cleaned) return 0;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export default function InvestmentsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [investments, setInvestments] = useState<MemberInvestment[]>([]);
  const [rawReports, setRawReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [manageEmail, setManageEmail] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyRecordForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchInvestments = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invRes, rawRes] = await Promise.all([
        fetch("/api/admin/investments", { headers: { "x-sheets-secret": SHEETS_SECRET } }),
        fetch("/api/member-reports/admin-all"),
      ]);
      if (!invRes.ok) throw new Error(`HTTP ${invRes.status}`);
      const data = await invRes.json();
      setInvestments(Array.isArray(data) ? data : []);

      if (rawRes.ok) {
        const rawData = await rawRes.json();
        setRawReports(Array.isArray(rawData.reports) ? rawData.reports : []);
      }
    } catch (err: any) {
      console.error("Investments fetch error:", err);
      setError("Failed to load investments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const manageRows = useMemo(
    () => (manageEmail ? rawReports.filter((r) => r.memberEmail === manageEmail) : []),
    [manageEmail, rawReports]
  );

  // Summary header for the member currently open in the View/Manage dialog —
  // computed fresh from their raw report rows so it always reflects any
  // edits/deletes made in the dialog immediately, without waiting on a refetch.
  const manageSummary = useMemo(() => {
    let totalInvestment = 0;
    let totalRoi = 0;
    let totalWithdrawals = 0;
    let latestBalance: number | null = null;

    // manageRows already comes newest-first (memberReport query orders by
    // uploadedAt desc), so the first row with a closing balance is the latest.
    for (const row of manageRows) {
      totalInvestment += parseNum(row.principal);
      totalRoi += parseNum(row.roi);
      totalWithdrawals += parseNum(row.withdrawal);
      if (latestBalance === null && row.closingBal) {
        latestBalance = parseNum(row.closingBal);
      }
    }

    return { totalInvestment, totalRoi, totalWithdrawals, latestBalance };
  }, [manageRows]);

  const openEditRecord = (row: ReportRow) => {
    setEditingId(row.id);
    setEditForm({
      memberEmail: row.memberEmail || "",
      accountNo: row.accountNo || "",
      periodLabel: row.periodLabel || "",
      date: row.date || "",
      principal: row.principal || "",
      rate: row.rate || "",
      roi: row.roi || "",
      withdrawal: row.withdrawal || "",
      closingBal: row.closingBal || "",
      notes: row.notes || "",
    });
  };

  const updateEditField = (field: keyof typeof editForm, value: string) =>
    setEditForm((prev) => ({ ...prev, [field]: value }));

  const saveEditRecord = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/member-reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, id: editingId }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update record");
      }
      const data = await res.json();

      setRawReports((prev) => prev.map((r) => (r.id === editingId ? data.record : r)));
      toast({ title: "Record updated" });
      setEditingId(null);
      await fetchInvestments();
    } catch (e: any) {
      toast({ variant: "destructive", title: e.message });
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm("Delete this investment record? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/member-reports?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete record");

      setRawReports((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Record deleted" });
      await fetchInvestments();
    } catch (e: any) {
      toast({ variant: "destructive", title: e.message });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = investments.filter((inv) => {
    const q = search.toLowerCase();
    return (
      inv.memberEmail.toLowerCase().includes(q) ||
      (inv.memberName?.toLowerCase().includes(q) ?? false) ||
      inv.accounts.some((a) => a.toLowerCase().includes(q)) ||
      (inv.periodLabel?.toLowerCase().includes(q) ?? false)
    );
  });

  // AUM = cumulative deposits (principal) from every member, not a snapshot
  // of current/closing balances. Matches the client's requested definition:
  // "all the deposits from all members, cumulative investment capital".
  const totalAUM = investments.reduce((acc, inv) => acc + (inv.totalPrincipal ?? 0), 0);
  const totalRoi = investments.reduce((acc, inv) => acc + inv.totalRoi, 0);
  // Current portfolio value (what "AUM" used to show here) — kept as its own
  // metric since it's still useful, just not what "AUM" should mean.
  const totalCurrentValue = investments.reduce((acc, inv) => acc + (inv.latestClosingBalance ?? 0), 0);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Member Investments</h1>
          <p className="text-muted-foreground text-sm">
            Closing balances from member performance reports (Google Sheets sync)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search member, account, or period…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button size="sm" variant="outline" onClick={fetchInvestments} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: investments.length.toString(), sub: "with report data" },
          { label: "Total AUM", value: fmt(totalAUM), sub: "cumulative deposits, all members" },
          { label: "Current Portfolio Value", value: fmt(totalCurrentValue), sub: "sum of latest closing balances" },
          { label: "Total ROI Earned", value: fmt(totalRoi), sub: "across all periods" },
        ].map((k) => (
          <Card key={k.label} className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className="text-xl font-bold mt-1">{k.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Loading investments…</div>
          ) : error ? (
            <div className="p-10 text-center text-destructive">{error}</div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4">Member</th>
                    <th className="text-left p-4">Account(s)</th>
                    <th className="text-left p-4">Period</th>
                    <th className="text-right p-4">Latest Closing Bal</th>
                    <th className="text-right p-4">Total ROI</th>
                    <th className="text-right p-4">Rows</th>
                    <th className="text-right p-4">Last Updated</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b last:border-none hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-medium">{inv.memberName || inv.memberEmail}</p>
                        {inv.memberName && (
                          <p className="text-xs text-muted-foreground">{inv.memberEmail}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {inv.accounts.length > 0 ? (
                            inv.accounts.map((a) => (
                              <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{inv.periodLabel || "—"}</td>
                      <td className="p-4 text-right font-semibold">{fmt(inv.latestClosingBalance)}</td>
                      <td className="p-4 text-right text-green-600 font-medium">
                        {inv.totalRoi > 0 ? fmt(inv.totalRoi) : "—"}
                      </td>
                      <td className="p-4 text-right text-muted-foreground">{inv.rowCount}</td>
                      <td className="p-4 text-right text-xs text-muted-foreground">
                        {new Date(inv.lastUpdated).toLocaleDateString("en-KE")}
                      </td>
                      <td className="p-4 text-right">
                        <Button size="sm" variant="outline" onClick={() => setManageEmail(inv.memberEmail)}>
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> View / Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="p-10 text-center text-muted-foreground">
                  <PieChart className="mx-auto h-8 w-8 mb-3" />
                  {investments.length === 0
                    ? "No member report data found in database."
                    : "No results match your search."}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View / Manage Records Modal */}
      <Dialog open={!!manageEmail} onOpenChange={(open) => { if (!open) setManageEmail(null); }}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="break-all">Investment Records — {manageEmail}</DialogTitle>
            <DialogDescription>
              View, edit, or delete each individual record for this member.
            </DialogDescription>
          </DialogHeader>

          {/* Summary header — one card per key figure for this member's account */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1.5">
                  <Landmark className="h-3.5 w-3.5" /> Total Investment
                </div>
                <p className="text-sm sm:text-lg font-bold break-words">{fmt(manageSummary.totalInvestment)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1.5">
                  <TrendingUp className="h-3.5 w-3.5" /> Total ROI
                </div>
                <p className="text-sm sm:text-lg font-bold text-green-600 break-words">{fmt(manageSummary.totalRoi)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1.5">
                  <TrendingDown className="h-3.5 w-3.5" /> Total Withdrawals
                </div>
                <p className="text-sm sm:text-lg font-bold text-amber-600 break-words">{fmt(manageSummary.totalWithdrawals)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1.5">
                  <Wallet className="h-3.5 w-3.5" /> Total Account Balance
                </div>
                <p className="text-sm sm:text-lg font-bold text-blue-600 break-words">{fmt(manageSummary.latestBalance)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/30">
                  {["Account", "Period", "Date", "Principal", "Rate", "ROI", "Withdrawal", "Closing Bal", "Notes", "Pushed At", "Actions"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {manageRows.map((row, i) => (
                  <tr key={row.id} className={`border-t ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                    <td className="px-3 py-2">{row.accountNo || "—"}</td>
                    <td className="px-3 py-2 max-w-[100px] truncate">{row.periodLabel || "—"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.date || "—"}</td>
                    <td className="px-3 py-2 text-right">{row.principal || "—"}</td>
                    <td className="px-3 py-2 text-right">{row.rate || "—"}</td>
                    <td className="px-3 py-2 text-right text-green-600 font-medium">{row.roi || "—"}</td>
                    <td className="px-3 py-2 text-right">{row.withdrawal || "—"}</td>
                    <td className="px-3 py-2 text-right font-semibold">{row.closingBal || "—"}</td>
                    <td className="px-3 py-2 max-w-[100px] truncate">{row.notes || row.quarter || "—"}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                      {new Date(row.uploadedAt).toLocaleDateString("en-KE")}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEditRecord(row)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => deleteRecord(row.id)}
                        disabled={deletingId === row.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {manageRows.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-3 py-6 text-center text-muted-foreground">
                      No records for this member.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setManageEmail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog open={!!editingId} onOpenChange={(open) => { if (!open) setEditingId(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Investment Record</DialogTitle>
            <DialogDescription>
              Changes apply immediately to this member's dashboard, reports page, and investments page.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label htmlFor="inv-edit-memberEmail">Member Email *</Label>
              <Input
                id="inv-edit-memberEmail"
                type="email"
                value={editForm.memberEmail}
                onChange={(e) => updateEditField("memberEmail", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="inv-edit-accountNo">Account No</Label>
                <Input id="inv-edit-accountNo" value={editForm.accountNo} onChange={(e) => updateEditField("accountNo", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="inv-edit-periodLabel">Period Label</Label>
                <Input id="inv-edit-periodLabel" value={editForm.periodLabel} onChange={(e) => updateEditField("periodLabel", e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="inv-edit-date">Date</Label>
              <Input id="inv-edit-date" type="date" value={editForm.date} onChange={(e) => updateEditField("date", e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="inv-edit-principal">Principal (KES)</Label>
                <Input id="inv-edit-principal" type="number" value={editForm.principal} onChange={(e) => updateEditField("principal", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="inv-edit-closingBal">Closing Balance (KES)</Label>
                <Input id="inv-edit-closingBal" type="number" value={editForm.closingBal} onChange={(e) => updateEditField("closingBal", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="inv-edit-rate">Rate</Label>
                <Input id="inv-edit-rate" value={editForm.rate} onChange={(e) => updateEditField("rate", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="inv-edit-roi">ROI</Label>
                <Input id="inv-edit-roi" value={editForm.roi} onChange={(e) => updateEditField("roi", e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="inv-edit-withdrawal">Withdrawal (KES)</Label>
              <Input id="inv-edit-withdrawal" type="number" value={editForm.withdrawal} onChange={(e) => updateEditField("withdrawal", e.target.value)} />
            </div>

            <div>
              <Label htmlFor="inv-edit-notes">Notes</Label>
              <Input id="inv-edit-notes" value={editForm.notes} onChange={(e) => updateEditField("notes", e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)} disabled={saving}>Cancel</Button>
            <Button onClick={saveEditRecord} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
