'use client'

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { approveKyc, rejectKyc, deleteMember } from '@/app/api/admin/kyc-action/route';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  nationalId?: string;
  kraPin?: string;
  sourceOfFunds?: string;
  dateOfBirth?: string | Date;
  placeOfBirthCounty?: string;
  placeOfBirthSubCounty?: string;
  placeOfBirthWard?: string;
  countyOfBirth?: string;
  countyOfResidence?: string;
  residentialAddress?: string;
  employmentStatus?: string;
  professionalBackground?: string;
  currentOccupation?: string;
  ludevaNumber?: string;
  maritalStatus?: string;
  numberOfKids?: number;
  teamName?: string;
  selfieUrl?: string;
  idCopyUrl?: string;
  primaryBeneficiaryName?: string;
  primaryBeneficiaryPercentage?: number;
  primaryBeneficiaryIdNumber?: string;
  primaryBeneficiaryEmail?: string;
  primaryBeneficiaryPhone?: string;
  primaryBeneficiaryIdUrl?: string;
  secondaryBeneficiaryName?: string;
  secondaryBeneficiaryPercentage?: number;
  secondaryBeneficiaryIdNumber?: string;
  secondaryBeneficiaryPhone?: string;
  secondaryBeneficiaryIdUrl?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  nextOfKinEmail?: string;
  kycStatus: string;
  kycSubmittedAt?: string | Date;
  accountType: 'INDIVIDUAL' | 'TEAM';
  initialInvestment?: number;
}

interface KycTableProps {
  initialUsers: User[];
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid grid-cols-2 gap-2 py-1.5 border-b last:border-b-0 text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span>{value ?? '—'}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{title}</h3>
      <div className="border rounded-lg p-3 space-y-0">{children}</div>
    </div>
  );
}

export function KycTable({ initialUsers }: KycTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (user: User) => setSelectedUser(user);
  const closeModal = () => setSelectedUser(null);

  const handleApprove = async (userId: string) => {
    try {
      setLoadingUserId(userId);
      const res = await approveKyc(userId);
      const updatedSubmittedAt = res.user.kycSubmittedAt ?? undefined;
      toast({ title: 'KYC Approved', description: 'User KYC has been approved.' });
      setUsers(users.map(u => u.id === userId ? { ...u, kycStatus: 'APPROVED', kycSubmittedAt: updatedSubmittedAt } : u));
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, kycStatus: 'APPROVED', kycSubmittedAt: updatedSubmittedAt });
    } catch {
      toast({ title: 'Error', description: 'Failed to approve KYC.', variant: 'destructive' });
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      setLoadingUserId(userId);
      const res = await rejectKyc(userId);
      const updatedSubmittedAt = res.user.kycSubmittedAt ?? undefined;
      toast({ title: 'KYC Rejected', description: 'User KYC has been rejected.' });
      setUsers(users.map(u => u.id === userId ? { ...u, kycStatus: 'REJECTED', kycSubmittedAt: updatedSubmittedAt } : u));
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, kycStatus: 'REJECTED', kycSubmittedAt: updatedSubmittedAt });
    } catch {
      toast({ title: 'Error', description: 'Failed to reject KYC.', variant: 'destructive' });
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      setLoadingUserId(userId);
      await deleteMember(userId);
      toast({ title: 'Member Deleted', description: 'The member has been permanently removed.' });
      setUsers(users.filter(u => u.id !== userId));
      if (selectedUser?.id === userId) closeModal();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete member.', variant: 'destructive' });
    } finally {
      setLoadingUserId(null);
      setConfirmDeleteId(null);
    }
  };

  const getKycBadgeVariant = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'destructive';
      default: return 'warning';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>KYC Management</CardTitle>
            <CardDescription>Review, approve or reject investor KYC submissions</CardDescription>
          </div>
          <input
            type="text"
            placeholder="Search by name…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Account Type</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No members found{searchQuery ? ` matching "${searchQuery}"` : ''}.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.accountType}{user.teamName ? ` — ${user.teamName}` : ''}</Badge>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.kycSubmittedAt ? format(new Date(user.kycSubmittedAt), 'dd MMM, yyyy') : 'Not submitted'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getKycBadgeVariant(user.kycStatus) as any}>{user.kycStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openModal(user)}>View</Button>
                    {user.kycStatus === 'PENDING' && (
                      <>
                        <Button size="sm" variant={"success" as any} onClick={() => handleApprove(user.id)} disabled={loadingUserId === user.id}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(user.id)} disabled={loadingUserId === user.id}>Reject</Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setConfirmDeleteId(user.id)}
                      disabled={loadingUserId === user.id}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* KYC Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-xl max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh]">
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedUser.fullName}</h2>
                <p className="text-sm text-muted-foreground">KYC Review — {selectedUser.accountType}{selectedUser.teamName ? ` / ${selectedUser.teamName}` : ''}</p>
              </div>
              <Badge variant={getKycBadgeVariant(selectedUser.kycStatus) as any} className="text-sm px-3 py-1">
                {selectedUser.kycStatus}
              </Badge>
            </div>

            {/* Document Previews */}
            {(selectedUser.selfieUrl || selectedUser.idCopyUrl) && (
              <div className="flex gap-4 mb-4">
                {selectedUser.selfieUrl && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Selfie</p>
                    <a href={selectedUser.selfieUrl} target="_blank" rel="noopener noreferrer">
                      <img src={selectedUser.selfieUrl} alt="Selfie" className="h-24 w-24 object-cover rounded-lg border" />
                    </a>
                  </div>
                )}
                {selectedUser.idCopyUrl && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">ID Copy</p>
                    <a href={selectedUser.idCopyUrl} target="_blank" rel="noopener noreferrer">
                      <img src={selectedUser.idCopyUrl} alt="ID Copy" className="h-24 w-24 object-cover rounded-lg border" />
                    </a>
                  </div>
                )}
              </div>
            )}

            <Section title="Personal Information">
              <Field label="Full Name" value={selectedUser.fullName} />
              <Field label="Date of Birth" value={selectedUser.dateOfBirth ? format(new Date(selectedUser.dateOfBirth), 'dd MMM yyyy') : undefined} />
              <Field label="Email" value={selectedUser.email} />
              <Field label="Phone" value={selectedUser.phone} />
              <Field label="National ID" value={selectedUser.nationalId} />
              <Field label="KRA PIN" value={selectedUser.kraPin} />
              <Field label="Residential Address" value={selectedUser.residentialAddress} />
              <Field label="Marital Status" value={selectedUser.maritalStatus} />
              <Field label="Number of Dependants" value={selectedUser.numberOfKids} />
            </Section>

            <Section title="Place of Birth">
              <Field label="County" value={selectedUser.placeOfBirthCounty || selectedUser.countyOfBirth} />
              <Field label="Sub-County" value={selectedUser.placeOfBirthSubCounty} />
              <Field label="Ward" value={selectedUser.placeOfBirthWard} />
            </Section>

            <Section title="Employment & Source of Funds">
              <Field label="Employment Status" value={selectedUser.employmentStatus} />
              <Field label="Professional Background" value={selectedUser.professionalBackground} />
              <Field label="Current Occupation" value={selectedUser.currentOccupation} />
              <Field label="Source of Funds" value={selectedUser.sourceOfFunds} />
            </Section>

            <Section title="Primary Beneficiary">
              <Field label="Name & % Allocation" value={selectedUser.primaryBeneficiaryName ? `${selectedUser.primaryBeneficiaryName} — ${selectedUser.primaryBeneficiaryPercentage}%` : undefined} />
              <Field label="ID Number" value={selectedUser.primaryBeneficiaryIdNumber} />
              <Field label="Email" value={selectedUser.primaryBeneficiaryEmail} />
              <Field label="Phone" value={selectedUser.primaryBeneficiaryPhone} />
              {selectedUser.primaryBeneficiaryIdUrl && (
                <div className="py-1.5 text-sm">
                  <span className="font-medium text-muted-foreground">ID Copy: </span>
                  <a href={selectedUser.primaryBeneficiaryIdUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View Document</a>
                </div>
              )}
            </Section>

            {selectedUser.secondaryBeneficiaryName && (
              <Section title="Secondary Beneficiary">
                <Field label="Name & % Allocation" value={`${selectedUser.secondaryBeneficiaryName} — ${selectedUser.secondaryBeneficiaryPercentage}%`} />
                <Field label="ID Number" value={selectedUser.secondaryBeneficiaryIdNumber} />
                <Field label="Phone" value={selectedUser.secondaryBeneficiaryPhone} />
                {selectedUser.secondaryBeneficiaryIdUrl && (
                  <div className="py-1.5 text-sm">
                    <span className="font-medium text-muted-foreground">ID Copy: </span>
                    <a href={selectedUser.secondaryBeneficiaryIdUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View Document</a>
                  </div>
                )}
              </Section>
            )}

            <Section title="Investment Details">
              <Field label="Initial Investment" value={selectedUser.initialInvestment ? `KES ${selectedUser.initialInvestment.toLocaleString()}` : undefined} />
              <Field label="Ludeva Number" value={selectedUser.ludevaNumber} />
              <Field label="Submitted At" value={selectedUser.kycSubmittedAt ? format(new Date(selectedUser.kycSubmittedAt), 'dd MMM yyyy HH:mm') : undefined} />
            </Section>

            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={closeModal}>Close</Button>
              {selectedUser.kycStatus === 'PENDING' && (
                <>
                  <Button variant={"success" as any} onClick={() => handleApprove(selectedUser.id)} disabled={!!loadingUserId}>Approve KYC</Button>
                  <Button variant="destructive" onClick={() => handleReject(selectedUser.id)} disabled={!!loadingUserId}>Reject KYC</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (() => {
        const target = users.find(u => u.id === confirmDeleteId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-xl max-w-sm w-full p-6">
              <h2 className="text-lg font-bold mb-2">Delete Member</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to permanently delete <span className="font-semibold text-foreground">{target?.fullName}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmDeleteId(null)} disabled={!!loadingUserId}>Cancel</Button>
                <Button variant="destructive" onClick={() => handleDelete(confirmDeleteId)} disabled={!!loadingUserId}>
                  {loadingUserId === confirmDeleteId ? 'Deleting…' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </Card>
  );
}
