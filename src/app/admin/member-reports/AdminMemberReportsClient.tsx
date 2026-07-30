"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Trash2, Users, FileSpreadsheet, RefreshCw, ChevronDown, ChevronUp, Plus, Pencil, Wallet, ArrowDownCircle, PiggyBank } from "lucide-react";

// Parses values like "1,234,567.50" or "KES 1,234" into a finite number,
// mirroring src/lib/member-reports.ts's parseReportAmount for client-side totals.
function parseAmount(value?: string | null): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.\-]/g, "");
  if (!cleaned) return 0;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

interface ReportRow {
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
}

interface MemberSummary {
  count: number;
  accounts: string[];
  lastPush: string;
}

interface Props {
  reports: ReportRow[];
  memberSummary: Record<string, MemberSummary>;
}

const SHEETS_SECRET = process.env.NEXT_PUBLIC_SHEETS_API_SECRET || "ludeva-sheets-secret-2025";

export default function AdminMemberReportsClient({ reports: initialReports, memberSummary: initialSummary }: Props) {
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportRow[]>(initialReports);
  const [memberSummary, setMemberSummary] = useState(initialSummary);
  const [search, setSearch] = useState("");
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
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
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
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
  });

  const refresh = async () => {
    const res = await fetch("/api/member-reports/admin-all");
    if (res.ok) {
      const data = await res.json();
      setReports(data.reports);
      setMemberSummary(data.memberSummary);
    }
  };

  const updateField = (field: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const resetForm = () =>
    setForm({
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
    });

  const submitAddRow = async () => {
    if (!form.memberEmail.trim()) {
      toast({ variant: "destructive", title: "Member email is required" });
      return;
    }
    if (!form.principal.trim() && !form.closingBal.trim()) {
      toast({ variant: "destructive", title: "Enter a principal or closing balance amount" });
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/admin/member-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to add investment entry");
      }

      toast({ title: "Investment entry added", description: `Recorded for ${form.memberEmail}` });
      setAddOpen(false);
      resetForm();
      await refresh();
    } catch (e: any) {
      toast({ variant: "destructive", title: e.message });
    } finally {
      setAdding(false);
    }
  };

  const openEditDialog = (row: ReportRow) => {
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
    setEditOpen(true);
  };

  const updateEditField = (field: keyof typeof editForm, value: string) =>
    setEditForm(prev => ({ ...prev, [field]: value }));

  const submitEditRow = async () => {
    if (!editingId) return;
    if (!editForm.memberEmail.trim()) {
      toast({ variant: "destructive", title: "Member email is required" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/member-reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, id: editingId }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update investment entry");
      }
      const data = await res.json();

      setReports(prev => prev.map(r => (r.id === editingId ? data.record : r)));
      toast({ title: "Investment entry updated" });
      setEditOpen(false);
      setEditingId(null);
    } catch (e: any) {
      toast({ variant: "destructive", title: e.message });
    } finally {
      setSaving(false);
    }
  };

  const deleteAllForMember = async (email: string) => {
    if (!confirm(`Delete ALL report rows for ${email}? This cannot be undone.`)) return;
    setDeleting(email);
    try {
      const res = await fetch(`/api/member-reports?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: { "x-sheets-secret": SHEETS_SECRET },
      });
      if (!res.ok) throw new Error("Delete failed");
      setReports(prev => prev.filter(r => r.memberEmail !== email));
      setMemberSummary(prev => {
        const n = { ...prev };
        delete n[email];
        return n;
      });
      toast({ title: `Deleted all reports for ${email}` });
    } catch (e: any) {
      toast({ variant: "destructive", title: e.message });
    } finally {
      setDeleting(null);
    }
  };

  const filteredEmails = Object.keys(memberSummary).filter(email =>
    email.toLowerCase().includes(search.toLowerCase()) ||
    reports.find(r => r.memberEmail === email && r.memberName?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalRows = reports.length;
  const totalMembers = Object.keys(memberSummary).length;

  const totals = useMemo(() => {
    let totalInvestments = 0;
    let totalWithdrawals = 0;
    for (const r of reports) {
      totalInvestments += parseAmount(r.principal);
      totalWithdrawals += parseAmount(r.withdrawal);
    }
    return {
      totalInvestments,
      totalWithdrawals,
      totalBalance: totalInvestments - totalWithdrawals,
    };
  }, [reports]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
            Member Performance Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            All report rows pushed from Google Sheets. Each member only sees their own data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Investment Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Investment Entry</DialogTitle>
                <DialogDescription>
                  Records a new report row for a member. This immediately updates their investment
                  total on the dashboard, their Reports page, and their Investments page.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="memberEmail">Member Email *</Label>
                  <Input
                    id="memberEmail"
                    type="email"
                    placeholder="member@example.com"
                    value={form.memberEmail}
                    onChange={(e) => updateField("memberEmail", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="accountNo">Account No</Label>
                    <Input
                      id="accountNo"
                      placeholder="e.g. LA0061"
                      value={form.accountNo}
                      onChange={(e) => updateField("accountNo", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="periodLabel">Period Label</Label>
                    <Input
                      id="periodLabel"
                      placeholder="e.g. 2026, 11.5% Net"
                      value={form.periodLabel}
                      onChange={(e) => updateField("periodLabel", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => updateField("date", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="principal">Principal (KES)</Label>
                    <Input
                      id="principal"
                      type="number"
                      placeholder="e.g. 50000"
                      value={form.principal}
                      onChange={(e) => updateField("principal", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="closingBal">Closing Balance (KES)</Label>
                    <Input
                      id="closingBal"
                      type="number"
                      placeholder="e.g. 52500"
                      value={form.closingBal}
                      onChange={(e) => updateField("closingBal", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="rate">Rate</Label>
                    <Input
                      id="rate"
                      placeholder="e.g. 11.5%"
                      value={form.rate}
                      onChange={(e) => updateField("rate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="roi">ROI</Label>
                    <Input
                      id="roi"
                      placeholder="e.g. 2,500"
                      value={form.roi}
                      onChange={(e) => updateField("roi", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="withdrawal">Withdrawal (KES)</Label>
                  <Input
                    id="withdrawal"
                    type="number"
                    placeholder="Leave blank if none"
                    value={form.withdrawal}
                    onChange={(e) => updateField("withdrawal", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Optional note"
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)} disabled={adding}>
                  Cancel
                </Button>
                <Button onClick={submitAddRow} disabled={adding}>
                  {adding ? "Saving..." : "Save Entry"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Investments", value: `KES ${totals.totalInvestments.toLocaleString()}`, icon: <Wallet className="h-4 w-4 text-emerald-600" /> },
          { label: "Total Withdrawals", value: `KES ${totals.totalWithdrawals.toLocaleString()}`, icon: <ArrowDownCircle className="h-4 w-4 text-red-500" /> },
          { label: "Total Members", value: totalMembers, icon: <Users className="h-4 w-4" /> },
          { label: "Total Balance", value: `KES ${totals.totalBalance.toLocaleString()}`, icon: <PiggyBank className="h-4 w-4 text-primary" /> },
        ].map(k => (
          <div key={k.label} className="border rounded-xl p-4 bg-card">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">{k.icon}{k.label}</div>
            <div className="font-bold text-xl">{k.value}</div>
          </div>
        ))}
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Members with Data", value: totalMembers, icon: <Users className="h-4 w-4" /> },
          { label: "Total Report Rows", value: totalRows, icon: <FileSpreadsheet className="h-4 w-4" /> },
          { label: "API Endpoint", value: "/api/member-reports", small: true },
          { label: "Auth Header", value: "x-sheets-secret", small: true },
        ].map(k => (
          <div key={k.label} className="border rounded-xl p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">{k.icon}{k.label}</div>
            <div className={`font-bold ${k.small ? "text-xs text-primary font-mono" : "text-xl"}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by email or name…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Member groups */}
      {filteredEmails.length === 0 ? (
        <div className="text-center py-20 border rounded-xl border-dashed text-muted-foreground">
          <FileSpreadsheet className="h-10 w-10 mx-auto mb-3" />
          <p>No report data yet. Push data from Google Sheets to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEmails.map(email => {
            const summary = memberSummary[email];
            const memberRows = reports.filter(r => r.memberEmail === email);
            const memberName = memberRows.find(r => r.memberName)?.memberName;
            const isExpanded = expandedEmail === email;

            return (
              <div key={email} className="border rounded-xl overflow-hidden">
                {/* Member header row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => setExpandedEmail(isExpanded ? null : email)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{memberName || email}</span>
                      {memberName && <span className="text-sm text-muted-foreground">{email}</span>}
                    </div>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {summary.accounts.map(a => (
                        <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                      ))}
                      <span className="text-xs text-muted-foreground">{summary.count} rows</span>
                      <span className="text-xs text-muted-foreground">
                        Last push: {new Date(summary.lastPush).toLocaleDateString("en-KE")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button size="sm" variant="ghost" className="text-destructive"
                      onClick={e => { e.stopPropagation(); deleteAllForMember(email); }}
                      disabled={deleting === email}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>

                {/* Expanded rows table */}
                {isExpanded && (
                  <div className="overflow-x-auto border-t">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/30">
                          {["Account", "Period", "Date", "Principal", "Rate", "ROI", "Withdrawal", "Closing Bal", "Quarter/Notes", "Pushed At", "Actions"].map(h => (
                            <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {memberRows.map((row, i) => (
                          <tr key={row.id} className={`border-t ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                            <td className="px-3 py-2">{row.accountNo || "—"}</td>
                            <td className="px-3 py-2 max-w-[120px] truncate">{row.periodLabel || "—"}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{row.date || "—"}</td>
                            <td className="px-3 py-2 text-right">{row.principal || "—"}</td>
                            <td className="px-3 py-2 text-right">{row.rate || "—"}</td>
                            <td className="px-3 py-2 text-right text-green-600 font-medium">{row.roi || "—"}</td>
                            <td className="px-3 py-2 text-right">{row.withdrawal || "—"}</td>
                            <td className="px-3 py-2 text-right font-semibold">{row.closingBal || "—"}</td>
                            <td className="px-3 py-2 max-w-[120px] truncate">{row.quarter || row.notes || "—"}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                              {new Date(row.uploadedAt).toLocaleDateString("en-KE")}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <Button size="sm" variant="ghost" onClick={() => openEditDialog(row)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Investment Entry Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditingId(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Investment Entry</DialogTitle>
            <DialogDescription>
              Updates this report row directly. Changes apply immediately to the member's dashboard,
              reports page, and investments page.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label htmlFor="edit-memberEmail">Member Email *</Label>
              <Input
                id="edit-memberEmail"
                type="email"
                value={editForm.memberEmail}
                onChange={(e) => updateEditField("memberEmail", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-accountNo">Account No</Label>
                <Input
                  id="edit-accountNo"
                  value={editForm.accountNo}
                  onChange={(e) => updateEditField("accountNo", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-periodLabel">Period Label</Label>
                <Input
                  id="edit-periodLabel"
                  value={editForm.periodLabel}
                  onChange={(e) => updateEditField("periodLabel", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={editForm.date}
                onChange={(e) => updateEditField("date", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-principal">Principal (KES)</Label>
                <Input
                  id="edit-principal"
                  type="number"
                  value={editForm.principal}
                  onChange={(e) => updateEditField("principal", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-closingBal">Closing Balance (KES)</Label>
                <Input
                  id="edit-closingBal"
                  type="number"
                  value={editForm.closingBal}
                  onChange={(e) => updateEditField("closingBal", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-rate">Rate</Label>
                <Input
                  id="edit-rate"
                  value={editForm.rate}
                  onChange={(e) => updateEditField("rate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-roi">ROI</Label>
                <Input
                  id="edit-roi"
                  value={editForm.roi}
                  onChange={(e) => updateEditField("roi", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-withdrawal">Withdrawal (KES)</Label>
              <Input
                id="edit-withdrawal"
                type="number"
                value={editForm.withdrawal}
                onChange={(e) => updateEditField("withdrawal", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                value={editForm.notes}
                onChange={(e) => updateEditField("notes", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submitEditRow} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
