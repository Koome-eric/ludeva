"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { completeOnboarding } from "./actions";

const MINIMUM_INVESTMENT = 1000;

// ✅ UPDATED SCHEMA
const formSchema = z.object({
  accountType: z.enum(["INDIVIDUAL", "TEAM"]),

  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("Valid email is required."),
  phone: z.string().min(10, "A valid phone number is required."),
  nationalId: z.string().min(5, "A valid ID is required."),
  dateOfBirth: z.string().min(10, "Date of birth is required."),
  countyOfBirth: z.string().min(2, "County of birth is required."),
  countyOfResidence: z.string().min(2, "County of residence is required."),

  ludevaNumber: z.string().optional(),
  maritalStatus: z.string().optional(),
  numberOfKids: z.coerce.number().optional(),

  nextOfKinName: z.string().min(2, "Next of kin name is required."),
  nextOfKinPhone: z.string().min(10, "Next of kin phone is required."),
  nextOfKinEmail: z.string().email("Valid next of kin email is required."),

  initialInvestment: z.coerce
    .number()
    .min(MINIMUM_INVESTMENT, `Minimum investment is KES ${MINIMUM_INVESTMENT}`),
});

export default function InvestmentClient() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountType: "INDIVIDUAL", // ✅ DEFAULT

      fullName: "",
      email: "",
      phone: "",
      nationalId: "",
      dateOfBirth: "",
      countyOfBirth: "",
      countyOfResidence: "",
      ludevaNumber: "",
      maritalStatus: "",
      numberOfKids: 0,
      nextOfKinName: "",
      nextOfKinPhone: "",
      nextOfKinEmail: "",
      initialInvestment: MINIMUM_INVESTMENT,
    },
  });

  // ✅ PREFILL FROM CLERK
  React.useEffect(() => {
    if (isLoaded && user) {
      form.reset({
        accountType:
          (user.publicMetadata?.accountType as any) || "INDIVIDUAL",

        fullName: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        phone: user.phoneNumbers?.[0]?.phoneNumber || "",
        nationalId: (user as any).nationalId || "",
        dateOfBirth: (user as any).dateOfBirth?.split("T")[0] || "",
        countyOfBirth: (user as any).countyOfBirth || "",
        countyOfResidence: (user as any).countyOfResidence || "",
        ludevaNumber: (user as any).ludevaNumber || "",
        maritalStatus: (user as any).maritalStatus || "",
        numberOfKids: (user as any).numberOfKids || 0,
        nextOfKinName: (user as any).nextOfKinName || "",
        nextOfKinPhone: (user as any).nextOfKinPhone || "",
        nextOfKinEmail: (user as any).nextOfKinEmail || "",
        initialInvestment:
          (user as any).initialInvestment || MINIMUM_INVESTMENT,
      });
    }
  }, [isLoaded, user, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await completeOnboarding(values);

      toast({
        title: "Account Created!",
        description:
          "Your investment account has been successfully created.",
      });

      router.push("/member/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Onboarding Failed",
        description:
          error?.message || "Something went wrong. Please try again.",
      });
    }
  }

  if (!isLoaded || !user) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create Your Investment Account</CardTitle>
          <CardDescription>
            Complete your investor profile to activate your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >

              {/* ✅ ACCOUNT TYPE */}
              <FormField
                control={form.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full border rounded-md p-2 bg-background"
                      >
                        <option value="">Select account type</option>
                        <option value="INDIVIDUAL">Individual</option>
                        <option value="TEAM">Team</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PERSONAL INFO */}
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "fullName",
                  "email",
                  "phone",
                  "nationalId",
                  "dateOfBirth",
                  "countyOfBirth",
                  "countyOfResidence",
                ].map((field) => (
                  <FormField
                    key={field}
                    control={form.control}
                    name={field as any}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>
                          {field.replace(/([A-Z])/g, " $1")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type={
                              field === "email"
                                ? "email"
                                : field === "dateOfBirth"
                                ? "date"
                                : "text"
                            }
                            {...f}
                            readOnly={field === "email"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {/* ADDITIONAL INFO */}
              <div className="grid sm:grid-cols-2 gap-4">
                {["ludevaNumber", "maritalStatus", "numberOfKids"].map(
                  (field) => (
                    <FormField
                      key={field}
                      control={form.control}
                      name={field as any}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>
                            {field.replace(/([A-Z])/g, " $1")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type={
                                field === "numberOfKids"
                                  ? "number"
                                  : "text"
                              }
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )
                )}
              </div>

              {/* NEXT OF KIN */}
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "nextOfKinName",
                  "nextOfKinPhone",
                  "nextOfKinEmail",
                ].map((field) => (
                  <FormField
                    key={field}
                    control={form.control}
                    name={field as any}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>
                          {field.replace(/([A-Z])/g, " $1")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type={
                              field.includes("Email")
                                ? "email"
                                : "text"
                            }
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {/* INVESTMENT */}
              <FormField
                control={form.control}
                name="initialInvestment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Investment (KES)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Creating Account..."
                  : "Complete Account Setup"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}