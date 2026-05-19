"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Trash2, Users, FileSpreadsheet, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

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

  const refresh = async () => {
    const res = await fetch("/api/member-reports/admin-all");
    if (res.ok) {
      const data = await res.json();
      setReports(data.reports);
      setMemberSummary(data.memberSummary);
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
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
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
                          {["Account", "Period", "Date", "Principal", "Rate", "ROI", "Withdrawal", "Closing Bal", "Quarter/Notes", "Pushed At"].map(h => (
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
    </div>
  );
}
