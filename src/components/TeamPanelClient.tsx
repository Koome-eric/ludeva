"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Trash2, ShieldCheck } from "lucide-react";
import {
  createTeam,
  inviteTeamMember,
  revokeInvite,
  updateMemberPermissions,
  removeMember,
  leaveTeam,
} from "@/app/member/team/actions";
import { PERMISSION_LABELS, type TeamPermissions } from "@/lib/team";

type Member = {
  membershipId: string;
  userId: string;
  fullName: string | null;
  email: string;
} & TeamPermissions;

type Invite = {
  id: string;
  email: string;
  status: string;
  expiresAt: string;
  createdAt: string;
};

type TeamData = {
  id: string;
  name: string;
  isOwner: boolean;
  membershipId: string | null;
  permissions: TeamPermissions;
  owner: { id: string; fullName: string | null; email: string };
  members: Member[];
  invites: Invite[];
} | null;

const PERMISSION_KEYS = Object.keys(PERMISSION_LABELS) as (keyof TeamPermissions)[];

export function TeamPanelClient({
  team,
  currentUserId,
}: {
  team: TeamData;
  currentUserId: string;
}) {
  if (!team) return <NoTeamState />;
  return <TeamDashboard team={team} currentUserId={currentUserId} />;
}

// ─────────────────────────────────────────────
// No team yet — offer to create one
// ─────────────────────────────────────────────
function NoTeamState() {
  const { toast } = useToast();
  const [teamName, setTeamName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    startTransition(async () => {
      try {
        await createTeam(teamName);
        toast({ title: "Chama created!", description: "You're now the owner. Start inviting members below." });
        window.location.reload();
      } catch (err: any) {
        toast({ title: "Couldn't create chama", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> Start Your Chama
        </CardTitle>
        <CardDescription>
          Name your chama so you and others can invest individually while sharing one dashboard.
          You'll be the owner and can invite members by email once it's created.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 max-w-md">
        <Label htmlFor="teamName">Chama name</Label>
        <Input
          id="teamName"
          placeholder="e.g. The Njoroge Family Investment Group"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleCreate} disabled={isPending || teamName.trim().length < 2}>
          {isPending ? "Creating..." : "Create Chama"}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Existing team — owner/member dashboard
// ─────────────────────────────────────────────
function TeamDashboard({ team, currentUserId }: { team: NonNullable<TeamData>; currentUserId: string }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePerms, setInvitePerms] = useState<TeamPermissions>({
    canInvite: false,
    canManagePermissions: false,
    canRemoveMembers: false,
    canInvestPooled: true,
    canViewPooledFunds: true,
    canViewAllReports: false,
    canWithdraw: false,
    canManageAnalytics: false,
  });

  const canInvite = team.isOwner || team.permissions.canInvite;
  const canManagePermissions = team.isOwner || team.permissions.canManagePermissions;
  const canRemoveMembers = team.isOwner || team.permissions.canRemoveMembers;

  const handleInvite = () => {
    startTransition(async () => {
      try {
        const res = await inviteTeamMember({ email: inviteEmail, permissions: invitePerms });
        toast({ title: "Invite sent", description: `An invite email was sent to ${inviteEmail}.` });
        setInviteOpen(false);
        setInviteEmail("");
        if (res.acceptUrl) {
          navigator.clipboard?.writeText(res.acceptUrl).catch(() => {});
        }
        window.location.reload();
      } catch (err: any) {
        toast({ title: "Couldn't send invite", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleRevoke = (inviteId: string) => {
    startTransition(async () => {
      try {
        await revokeInvite(inviteId);
        toast({ title: "Invite revoked" });
        window.location.reload();
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleRemove = (membershipId: string) => {
    if (!confirm("Remove this member from the chama? Their account will revert to individual.")) return;
    startTransition(async () => {
      try {
        await removeMember(membershipId);
        toast({ title: "Member removed" });
        window.location.reload();
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  const handlePermissionToggle = (membershipId: string, key: keyof TeamPermissions, value: boolean) => {
    startTransition(async () => {
      try {
        await updateMemberPermissions(membershipId, { [key]: value });
        toast({ title: "Permissions updated" });
        window.location.reload();
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleLeave = () => {
    if (!confirm("Leave this chama? You'll lose access to the shared dashboard.")) return;
    startTransition(async () => {
      try {
        await leaveTeam();
        toast({ title: "You left the chama" });
        window.location.reload();
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> {team.name}
            </CardTitle>
            <CardDescription>
              {team.isOwner ? "You own this chama." : "You're a member of this chama."} Owner: {team.owner.fullName || team.owner.email}
            </CardDescription>
          </div>
          {canInvite && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" /> Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Invite a chama member</DialogTitle>
                  <DialogDescription>
                    They'll get an email with a link to accept. Once accepted, they get access to the
                    shared dashboard with the permissions you set below.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="inviteEmail">Email address</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      placeholder="member@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    {PERMISSION_KEYS.map((key) => (
                      <div key={key} className="flex items-center justify-between py-1">
                        <span className="text-sm">{PERMISSION_LABELS[key]}</span>
                        <Switch
                          checked={invitePerms[key]}
                          onCheckedChange={(v) => setInvitePerms((p) => ({ ...p, [key]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleInvite} disabled={isPending || !inviteEmail.includes("@")}>
                    {isPending ? "Sending..." : "Send Invite"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Members</CardTitle>
          <CardDescription>Each member invests individually and can access the shared dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{team.owner.fullName || "—"}</TableCell>
                <TableCell>{team.owner.email}</TableCell>
                <TableCell>
                  <Badge className="gap-1"><ShieldCheck className="h-3 w-3" /> Owner</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">Full access</TableCell>
                <TableCell />
              </TableRow>
              {team.members.map((m) => (
                <TableRow key={m.membershipId}>
                  <TableCell className="font-medium">
                    {m.fullName || "—"}
                    {m.userId === currentUserId && <span className="text-muted-foreground"> (you)</span>}
                  </TableCell>
                  <TableCell>{m.email}</TableCell>
                  <TableCell><Badge variant="secondary">Member</Badge></TableCell>
                  <TableCell>
                    {canManagePermissions ? (
                      <MemberPermissionsEditor
                        member={m}
                        onToggle={(key, value) => handlePermissionToggle(m.membershipId, key, value)}
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {PERMISSION_KEYS.filter((k) => m[k]).length} permission(s) granted
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {canRemoveMembers && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemove(m.membershipId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {!team.isOwner && (
          <CardFooter>
            <Button variant="outline" onClick={handleLeave} disabled={isPending}>
              Leave Chama
            </Button>
          </CardFooter>
        )}
      </Card>

      {team.invites.length > 0 && (
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Pending Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.invites.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.email}</TableCell>
                    <TableCell>{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(inv.expiresAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {canInvite && (
                        <Button size="sm" variant="ghost" onClick={() => handleRevoke(inv.id)}>
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MemberPermissionsEditor({
  member,
  onToggle,
}: {
  member: Member;
  onToggle: (key: keyof TeamPermissions, value: boolean) => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit ({PERMISSION_KEYS.filter((k) => member[k]).length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Permissions for {member.fullName || member.email}</DialogTitle>
          <DialogDescription>Changes apply immediately.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {PERMISSION_KEYS.map((key) => (
            <div key={key} className="flex items-center justify-between py-1">
              <span className="text-sm">{PERMISSION_LABELS[key]}</span>
              <Switch checked={member[key]} onCheckedChange={(v) => onToggle(key, v)} />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
