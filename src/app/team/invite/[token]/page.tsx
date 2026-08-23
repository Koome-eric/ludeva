import { prisma } from "@/lib/prisma";
import { InviteAcceptClient } from "@/components/InviteAcceptClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";

export default async function TeamInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invite = await prisma.teamInvite.findUnique({
    where: { token },
    include: { team: true, invitedBy: true },
  });

  if (!invite) {
    return <InvalidInvite reason="This invite link is invalid." />;
  }

  if (invite.status === "ACCEPTED") {
    return <InvalidInvite reason="This invite has already been accepted. Sign in to access your dashboard." showSignIn />;
  }

  if (invite.status === "REVOKED") {
    return <InvalidInvite reason="This invite has been revoked by the team owner." />;
  }

  if (invite.status === "EXPIRED" || invite.expiresAt < new Date()) {
    return <InvalidInvite reason="This invite has expired. Ask the team owner to send you a new one." />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <InviteAcceptClient
        token={token}
        teamName={invite.team.name}
        invitedByName={invite.invitedBy.fullName || invite.invitedBy.email}
        email={invite.email}
      />
    </div>
  );
}

function InvalidInvite({ reason, showSignIn }: { reason: string; showSignIn?: boolean }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" /> Invite Unavailable
          </CardTitle>
          <CardDescription>{reason}</CardDescription>
        </CardHeader>
        {showSignIn && (
          <CardContent>
            <a href="/sign-in" className="text-primary underline text-sm">
              Go to sign in
            </a>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
