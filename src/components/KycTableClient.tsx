'use client'

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { approveKyc, rejectKyc } from '@/app/api/admin/kyc-action/route';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  nationalId?: string;
  dateOfBirth?: string;
  countyOfBirth?: string;
  countyOfResidence?: string;
  ludevaNumber?: string;
  maritalStatus?: string;
  numberOfKids?: number;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  nextOfKinEmail?: string;
  kycStatus: string;
  kycSubmittedAt?: string | Date;
  accountType: 'INDIVIDUAL' | 'TEAM'; // ✅ added
}

interface KycTableProps {
  initialUsers: User[];
}

export function KycTable({ initialUsers }: KycTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const openModal = (user: User) => setSelectedUser(user);
  const closeModal = () => setSelectedUser(null);

  const handleApprove = async (userId: string) => {
    try {
      setLoadingUserId(userId);
      const res = await approveKyc(userId);
      toast({ title: 'KYC Approved', description: 'User KYC has been approved.' });

      setUsers(users.map(u => u.id === userId ? { ...u, kycStatus: 'APPROVED', kycSubmittedAt: res.user.kycSubmittedAt } : u));
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, kycStatus: 'APPROVED', kycSubmittedAt: res.user.kycSubmittedAt });
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
      toast({ title: 'KYC Rejected', description: 'User KYC has been rejected.' });

      setUsers(users.map(u => u.id === userId ? { ...u, kycStatus: 'REJECTED', kycSubmittedAt: res.user.kycSubmittedAt } : u));
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, kycStatus: 'REJECTED', kycSubmittedAt: res.user.kycSubmittedAt });
    } catch {
      toast({ title: 'Error', description: 'Failed to reject KYC.', variant: 'destructive' });
    } finally {
      setLoadingUserId(null);
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
        <CardTitle>KYC Management</CardTitle>
        <CardDescription>Review, approve or reject investor KYC submissions</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Account Type</TableHead> {/* ✅ added */}
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.accountType}</TableCell> {/* ✅ added */}
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || 'N/A'}</TableCell>
                <TableCell>
                  {user.kycSubmittedAt ? format(new Date(user.kycSubmittedAt), 'dd MMM, yyyy') : 'Not submitted'}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getKycBadgeVariant(user.kycStatus)}>{user.kycStatus}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openModal(user)}>View</Button>
                  {user.kycStatus === 'PENDING' && (
                    <>
                      <Button size="sm" variant="success" onClick={() => handleApprove(user.id)} disabled={loadingUserId === user.id}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(user.id)} disabled={loadingUserId === user.id}>Reject</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50">
          <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg shadow-lg max-w-lg w-full p-6 relative overflow-y-auto max-h-[90vh] transition-colors duration-300">
            <h2 className="text-xl font-bold mb-2">{selectedUser.fullName} - KYC Details</h2>
            <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">
              Review full KYC information for this member
            </p>
            <div className="grid gap-2">
              <p><strong>Full Name:</strong> {selectedUser.fullName}</p>
              <p><strong>Account Type:</strong> {selectedUser.accountType}</p> {/* ✅ added */}
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
              <p><strong>National ID:</strong> {selectedUser.nationalId || 'N/A'}</p>
              <p><strong>Date of Birth:</strong> {selectedUser.dateOfBirth ? format(new Date(selectedUser.dateOfBirth), 'dd MMM, yyyy') : 'N/A'}</p>
              <p><strong>County of Birth:</strong> {selectedUser.countyOfBirth || 'N/A'}</p>
              <p><strong>County of Residence:</strong> {selectedUser.countyOfResidence || 'N/A'}</p>
              <p><strong>Ludeva Number:</strong> {selectedUser.ludevaNumber || 'N/A'}</p>
              <p><strong>Marital Status:</strong> {selectedUser.maritalStatus || 'N/A'}</p>
              <p><strong>Number of Kids:</strong> {selectedUser.numberOfKids ?? 'N/A'}</p>
              <p><strong>Next of Kin:</strong> {selectedUser.nextOfKinName || 'N/A'}</p>
              <p><strong>Next of Kin Phone:</strong> {selectedUser.nextOfKinPhone || 'N/A'}</p>
              <p><strong>Next of Kin Email:</strong> {selectedUser.nextOfKinEmail || 'N/A'}</p>
              <p><strong>Submitted At:</strong> {selectedUser.kycSubmittedAt ? format(new Date(selectedUser.kycSubmittedAt), 'dd MMM, yyyy') : 'Not submitted'}</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
              <Button variant="outline" onClick={closeModal}>Close</Button>
              {selectedUser.kycStatus === 'PENDING' && (
                <>
                  <Button variant="success" onClick={() => handleApprove(selectedUser.id)}>Approve</Button>
                  <Button variant="destructive" onClick={() => handleReject(selectedUser.id)}>Reject</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}