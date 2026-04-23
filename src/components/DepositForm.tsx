"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const presetAmounts = [1000, 5000, 10000, 25000];

const schema = z.object({
  investmentId: z.string().min(1, "Select an investment"),
  amount: z.coerce.number().min(100),
  phone: z.string().min(12),
});

interface Investment {
  id: string;
  productName: string;
  amount: number;
}

export function DepositForm() {

  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loadingInvestments, setLoadingInvestments] = useState(true);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      investmentId: "",
      amount: 1000,
      phone: "",
    },
  });

  // Fetch active investments
  useEffect(() => {

    const fetchInvestments = async () => {
      try {

        const res = await fetch("/api/active-investments");
        const data = await res.json();

        setInvestments(data.investments || []);

      } catch (err) {

        console.error(err);
        setInvestments([]);

      } finally {

        setLoadingInvestments(false);

      }
    };

    fetchInvestments();

  }, []);

  /*
  --------------------------------------------------
  PAYMENT STATUS POLLING
  --------------------------------------------------
  */

  const pollPaymentStatus = async (requestId: string) => {

    let attempts = 0;

    const interval = setInterval(async () => {

      attempts++;

      try {

        const res = await fetch(`/api/payments/status?requestId=${requestId}`);
        const data = await res.json();

        if (data.status === "SUCCESS") {

          clearInterval(interval);

          toast({
            title: "Payment Successful",
            description: "Your investment has been activated.",
          });

          setLoading(false);
        }

        if (data.status === "FAILED") {

          clearInterval(interval);

          toast({
            variant: "destructive",
            title: "Payment Failed",
            description: "The transaction was not completed.",
          });

          setLoading(false);
        }

      } catch (err) {

        console.error("Polling error:", err);

      }

      // stop after 2 minutes
      if (attempts > 60) {

        clearInterval(interval);

        toast({
          variant: "destructive",
          title: "Payment Timeout",
          description: "We could not verify your payment. Please check again later.",
        });

        setLoading(false);
      }

    }, 2000);
  };

  /*
  --------------------------------------------------
  SUBMIT
  --------------------------------------------------
  */

  const submit = async (values: z.infer<typeof schema>) => {

    setLoading(true);

    try {

      const res = await fetch("/api/investments/start", {
        method: "POST",
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!data.success) {

        toast({
          variant: "destructive",
          title: data.error || "Payment failed",
        });

        setLoading(false);
        return;
      }

      toast({
        title: "STK Sent",
        description: "Confirm the payment on your phone.",
      });

      /*
      Start polling payment status
      */

      pollPaymentStatus(data.requestId);

    } catch (err) {

      console.error(err);

      toast({
        variant: "destructive",
        title: "Payment error",
      });

      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="space-y-6"
      >

        {/* Investment selector */}

        <FormField
          control={form.control}
          name="investmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Investment</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="border rounded-md px-3 py-3 w-full"
                  disabled={loadingInvestments}
                >

                  <option value="">
                    {loadingInvestments
                      ? "Loading investments..."
                      : "Choose investment"}
                  </option>

                  {investments.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.productName} — Balance: KES{" "}
                      {inv.amount.toLocaleString()}
                    </option>
                  ))}

                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount */}

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deposit Amount</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  className="h-12 text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Quick buttons */}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          {presetAmounts.map((amt) => (
            <Button
              key={amt}
              type="button"
              variant="outline"
              onClick={() => form.setValue("amount", amt)}
            >
              {amt.toLocaleString()}
            </Button>
          ))}

        </div>

        {/* Phone */}

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>M-Pesa Phone</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="254712345678"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}

        <Button
          className="w-full h-12"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Deposit Funds"
          )}
        </Button>

      </form>
    </Form>
  );
}