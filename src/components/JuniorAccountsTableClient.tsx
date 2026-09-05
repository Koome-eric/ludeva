'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Baby, FileText, ImageIcon } from 'lucide-react';
import { approveJuniorApplication, rejectJuniorApplication } from '@/app/api/admin/junior-accounts-action/route';

interface Application {
  id: string;
  childFullName: string;
  childDateOfBirth: string | null;
  guardianName: string;
  guardianEmail: string;
  guardianPhoneOnFile?: string | null;
  guardianIdNumber: string;
  guardianPhone: string;
  guardianKraPin: string;
  birthCertUrl: string;
  childPhotoUrl: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  reviewNotes?: string | null;
  createdAt: string;
}

const STATUS_VARIANT: Record<Application['status'], 'default' | 'secondary' | 'destructive'> = {
  PENDING_REVIEW: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
};

const STATUS_LABEL: Record<Application['status'], string> = {
  PENDING_REVIEW: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export function JuniorAccountsTable({ initialApplications }: { initialApplications: Application[] }) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [selected, setSelected] = useState<Application | null>(null);
  const [note, setNote] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = applications.filter(
    (a) =>
      a.childFullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.guardianName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (app: Application) => {
    setSelected(app);
    setNote('');
  };
  const closeModal = () => setSelected(null);

  const handleApprove = async (id: string) => {
    try {
      setLoadingId(id);
      await approveJuniorApplication(id, note);
      toast({ title: 'Application approved', description: 'The guardian can now fund this Junior Account.' });
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'APPROVED', reviewNotes: note } : a)));
      closeModal();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to approve.', variant: 'destructive' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setLoadingId(id);
      await rejectJuniorApplication(id, note);
      toast({ title: 'Application rejected' });
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'REJECTED', reviewNotes: note } : a)));
      closeModal();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to reject.', variant: 'destructive' });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Baby className="h-7 w-7 text-primary" /> Ludeva Junior Accounts
          </h1>
          <p className="text-muted-foreground">Review guardian applications and KYC documents for children's accounts.</p>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>{applications.length} total</CardDescription>
          <Input
            placeholder="Search by child or guardian name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm mt-2"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Child</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.childFullName}</TableCell>
                  <TableCell>{a.guardianName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(a.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => openModal(a)}>
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Baby className="h-5 w-5 text-primary" /> {selected.childFullName}
                </DialogTitle>
                <DialogDescription>
                  Guardian: {selected.guardianName} ({selected.guardianEmail})
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                {selected.childDateOfBirth && (
                  <div className="grid grid-cols-2 gap-2 py-1.5 border-b">
                    <span className="font-medium text-muted-foreground">Date of Birth</span>
                    <span>{format(new Date(selected.childDateOfBirth), 'MMM d, yyyy')}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 py-1.5 border-b">
                  <span className="font-medium text-muted-foreground">Guardian ID/Passport</span>
                  <span>{selected.guardianIdNumber}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1.5 border-b">
                  <span className="font-medium text-muted-foreground">Guardian Phone</span>
                  <span>{selected.guardianPhone}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1.5 border-b">
                  <span className="font-medium text-muted-foreground">Guardian KRA PIN</span>
                  <span>{selected.guardianKraPin}</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <a
                    href={selected.birthCertUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted flex-1"
                  >
                    <FileText className="h-4 w-4" /> Birth Certificate
                  </a>
                  <a
                    href={selected.childPhotoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted flex-1"
                  >
                    <ImageIcon className="h-4 w-4" /> Passport Photo
                  </a>
                </div>
                <img
                  src={selected.childPhotoUrl}
                  alt="Child passport photo"
                  className="h-32 w-32 object-cover rounded-lg border"
                />

                {selected.reviewNotes && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs font-medium text-muted-foreground">Previous review note</p>
                    <p>{selected.reviewNotes}</p>
                  </div>
                )}

                {selected.status === 'PENDING_REVIEW' && (
                  <Textarea
                    placeholder="Note for the guardian (optional, shown if rejected)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                  />
                )}
              </div>

              {selected.status === 'PENDING_REVIEW' && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="text-destructive"
                    disabled={loadingId === selected.id}
                    onClick={() => handleReject(selected.id)}
                  >
                    Reject
                  </Button>
                  <Button disabled={loadingId === selected.id} onClick={() => handleApprove(selected.id)}>
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
