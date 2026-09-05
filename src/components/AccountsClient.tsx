"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, PiggyBank, Baby } from "lucide-react";
import { JuniorApplicationDialog } from "@/components/JuniorApplicationDialog";

type ProductType = "STOCK" | "SAVINGS" | "JUNIOR";

interface Product {
  id: string;
  name: string;
  type: ProductType;
  description: string | null;
  roi: number;
  roiMax: number | null;
  minAmount: number;
  isActive: boolean;
}

interface Application {
  id: string;
  childFullName: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  reviewNotes: string | null;
  createdAt: string;
}

const ICON: Record<ProductType, typeof TrendingUp> = {
  STOCK: TrendingUp,
  SAVINGS: PiggyBank,
  JUNIOR: Baby,
};

const TONE: Record<ProductType, string> = {
  STOCK: "bg-amber-500/10 text-amber-600",
  SAVINGS: "bg-primary/10 text-primary",
  JUNIOR: "bg-emerald-500/10 text-emerald-600",
};

const APP_STATUS_LABEL: Record<Application["status"], string> = {
  PENDING_REVIEW: "Under review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function AccountsClient({
  data,
}: {
  data: { products: Product[]; applications: Application[] };
}) {
  const latestApplication = data.applications[0];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {data.products.map((p) => {
        const Icon = ICON[p.type];
        return (
          <Card key={p.id} className="rounded-2xl shadow-sm hover:shadow-md transition flex flex-col">
            <CardHeader>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${TONE[p.type]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">{p.name}</CardTitle>
              {p.description && <CardDescription className="line-clamp-3">{p.description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Return</span>
                <span className="font-semibold text-primary">
                  {p.roiMax ? `${p.roi}–${p.roiMax}` : `Up to ${p.roi}`}% p.a.
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minimum</span>
                <span className="font-medium">KES {p.minAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={p.isActive ? "bg-green-600" : "bg-yellow-500"}>
                  {p.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
            <CardFooter>
              {p.type === "JUNIOR" ? (
                latestApplication && latestApplication.status !== "REJECTED" ? (
                  <div className="w-full space-y-2">
                    <Badge variant={latestApplication.status === "APPROVED" ? "default" : "secondary"}>
                      {APP_STATUS_LABEL[latestApplication.status]}
                    </Badge>
                    <p className="text-xs text-muted-foreground">Application for {latestApplication.childFullName}</p>
                    {latestApplication.status === "APPROVED" && (
                      <Button asChild size="sm" className="w-full">
                        <Link href={`/member/products/${p.id}`}>Fund this Account</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="w-full space-y-2">
                    <JuniorApplicationDialog />
                    {latestApplication?.status === "REJECTED" && (
                      <p className="text-xs text-destructive">
                        Previous application was rejected
                        {latestApplication.reviewNotes ? `: ${latestApplication.reviewNotes}` : "."} You can re-apply.
                      </p>
                    )}
                  </div>
                )
              ) : (
                <Button asChild size="sm" className="w-full" disabled={!p.isActive}>
                  <Link href={`/member/products/${p.id}`}>Invest Now</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}

      {data.products.length === 0 && (
        <p className="col-span-full text-center text-muted-foreground py-10">
          No accounts are available right now — check back soon.
        </p>
      )}
    </div>
  );
}
