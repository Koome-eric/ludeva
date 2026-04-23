import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { AlertTriangle, MoreHorizontal, Ban, CheckCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default async function FlaggedAccountsPage() {
  // Mock fetching flagged users. In reality, you'd filter by { isFlagged: true }
  // For demo, we'll just take a few users and pretend they are flagged.
  const flaggedUsers = await prisma.user.findMany({
    where: {
      role: "MEMBER",
    },
    take: 5,
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Flagged Accounts</h1>
        <p className="text-muted-foreground">Manage suspended and high-risk investor accounts.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
         <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-800">Total Flagged</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-900">{flaggedUsers.length}</div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suspicious Activity & Flags</CardTitle>
          <CardDescription>
            Accounts flagged for suspicious transactions or compliance violations.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investor</TableHead>
                <TableHead>Flag Reason</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Date Flagged</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flaggedUsers.length > 0 ? (
                flaggedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="font-medium">{user.fullName || "Unknown"}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm">Suspicious Login Activity</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="destructive">High Risk</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(), "dd MMM yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/investors/${user.id}`} className="w-full cursor-pointer">View Profile</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-green-600 cursor-pointer">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Resolve Flag
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 cursor-pointer">
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No flagged accounts found.
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