"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React, { useState } from "react";

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

const formSchema = z.object({
  // Account type
  accountType: z.enum(["INDIVIDUAL", "TEAM"]),
  teamName: z.string().optional(),

  // Personal info
  fullName: z.string().min(2, "Full name is required."),
  dateOfBirth: z.string().min(10, "Date of birth is required."),
  placeOfBirthCounty: z.string().min(2, "County of birth is required."),
  placeOfBirthSubCounty: z.string().min(2, "Sub-county of birth is required."),
  placeOfBirthWard: z.string().min(2, "Ward of birth is required."),
  email: z.string().email("Valid email is required."),
  phone: z.string().min(10, "A valid phone number is required."),
  residentialAddress: z.string().min(5, "Residential address is required."),
  nationalId: z.string().min(5, "A valid National ID is required."),
  kraPin: z.string().min(8, "KRA PIN is required (e.g. A000000000Z)."),
  sourceOfFunds: z.string().min(3, "Source of funds is required."),

  // Employment
  employmentStatus: z.enum(["EMPLOYED", "SELF_EMPLOYED", "UNEMPLOYED", "RETIRED", "STUDENT"]),
  professionalBackground: z.string().optional(),
  currentOccupation: z.string().optional(),

  // Legacy / extra
  countyOfResidence: z.string().optional(),
  ludevaNumber: z.string().optional(),
  maritalStatus: z.string().optional(),
  numberOfKids: z.coerce.number().optional(),

  // Beneficiaries
  primaryBeneficiaryName: z.string().min(2, "Primary beneficiary name is required."),
  primaryBeneficiaryPercentage: z.coerce.number().min(1).max(100),
  primaryBeneficiaryIdNumber: z.string().min(5, "Primary beneficiary ID is required."),
  primaryBeneficiaryEmail: z.string().email("Valid email for primary beneficiary."),
  primaryBeneficiaryPhone: z.string().min(10, "Primary beneficiary phone is required."),

  secondaryBeneficiaryName: z.string().optional(),
  secondaryBeneficiaryPercentage: z.coerce.number().optional(),
  secondaryBeneficiaryIdNumber: z.string().optional(),
  secondaryBeneficiaryPhone: z.string().optional(),

  initialInvestment: z.coerce
    .number()
    .min(MINIMUM_INVESTMENT, `Minimum investment is KES ${MINIMUM_INVESTMENT}`),
});

type FormValues = z.infer<typeof formSchema>;

// Upload helper using Cloudinary (or your upload endpoint)
async function uploadFile(file: File, label: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("label", label);
  const res = await fetch("/api/upload-kyc-doc", { method: "POST", body: formData });
  if (!res.ok) throw new Error(`Failed to upload ${label}`);
  const json = await res.json();
  return json.url as string;
}

export default function InvestmentClient() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 5;

  // File state
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [primaryIdFile, setPrimaryIdFile] = useState<File | null>(null);
  const [secondaryIdFile, setSecondaryIdFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountType: "INDIVIDUAL",
      teamName: "",
      fullName: "",
      dateOfBirth: "",
      placeOfBirthCounty: "",
      placeOfBirthSubCounty: "",
      placeOfBirthWard: "",
      email: "",
      phone: "",
      residentialAddress: "",
      nationalId: "",
      kraPin: "",
      sourceOfFunds: "",
      employmentStatus: "EMPLOYED",
      professionalBackground: "",
      currentOccupation: "",
      countyOfResidence: "",
      ludevaNumber: "",
      maritalStatus: "",
      numberOfKids: 0,
      primaryBeneficiaryName: "",
      primaryBeneficiaryPercentage: 100,
      primaryBeneficiaryIdNumber: "",
      primaryBeneficiaryEmail: "",
      primaryBeneficiaryPhone: "",
      secondaryBeneficiaryName: "",
      secondaryBeneficiaryPercentage: 0,
      secondaryBeneficiaryIdNumber: "",
      secondaryBeneficiaryPhone: "",
      initialInvestment: MINIMUM_INVESTMENT,
    },
  });

  React.useEffect(() => {
    if (isLoaded && user) {
      form.setValue("fullName", user.fullName || "");
      form.setValue("email", user.primaryEmailAddress?.emailAddress || "");
      form.setValue("phone", user.phoneNumbers?.[0]?.phoneNumber || "");
    }
  }, [isLoaded, user, form]);

  const accountType = form.watch("accountType");

  async function onSubmit(values: FormValues) {
    try {
      setUploading(true);

      // Upload KYC documents to Cloudinary via API
      let selfieUrl = "";
      let idCopyUrl = "";
      let primaryBeneficiaryIdUrl = "";
      let secondaryBeneficiaryIdUrl = "";

      if (selfieFile) selfieUrl = await uploadFile(selfieFile, "selfie");
      if (idFile) idCopyUrl = await uploadFile(idFile, "id_copy");
      if (primaryIdFile) primaryBeneficiaryIdUrl = await uploadFile(primaryIdFile, "primary_beneficiary_id");
      if (secondaryIdFile) secondaryBeneficiaryIdUrl = await uploadFile(secondaryIdFile, "secondary_beneficiary_id");

      setUploading(false);

      await completeOnboarding({
        ...values,
        selfieUrl,
        idCopyUrl,
        primaryBeneficiaryIdUrl,
        secondaryBeneficiaryIdUrl,
      } as any);

      toast({
        title: "KYC Submitted Successfully!",
        description: "Your investment account is being reviewed.",
      });

      router.push("/member/dashboard");
    } catch (error: any) {
      setUploading(false);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error?.message || "Something went wrong. Please try again.",
      });
    }
  }

  if (!isLoaded || !user) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  const stepTitles = [
    "Account Type",
    "Personal Details",
    "Employment & KYC",
    "Document Uploads",
    "Beneficiaries & Investment",
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-3 mb-2">
            <img src="/images/logo_light.png" alt="Ludeva" className="h-8 block dark:hidden" />
            <img src="/images/logo_dark.png" alt="Ludeva" className="h-8 hidden dark:block" />
          </div>
          <CardTitle className="text-2xl">Investor KYC Registration</CardTitle>
          <CardDescription>
            Step {step} of {TOTAL_STEPS}: <strong>{stepTitles[step - 1]}</strong>
          </CardDescription>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* ── STEP 1: ACCOUNT TYPE ── */}
              {step === 1 && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Account Type *</FormLabel>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {[
                            { value: "INDIVIDUAL", label: "A. Individual Investor", desc: "Personal investment account" },
                            { value: "TEAM", label: "B. Ludeva Team", desc: "Group / team investment account" },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => field.onChange(opt.value)}
                              className={`p-4 rounded-xl border-2 text-left transition-all ${
                                field.value === opt.value
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                              }`}
                            >
                              <div className="font-semibold text-sm">{opt.label}</div>
                              <div className="text-xs text-muted-foreground mt-1">{opt.desc}</div>
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {accountType === "TEAM" && (
                    <FormField
                      control={form.control}
                      name="teamName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your Ludeva team name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {/* ── STEP 2: PERSONAL DETAILS ── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                      <FormItem><FormLabel>Date of Birth *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <div className="rounded-lg border p-4 space-y-3">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Place of Birth</p>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <FormField control={form.control} name="placeOfBirthCounty" render={({ field }) => (
                        <FormItem><FormLabel>County *</FormLabel><FormControl><Input placeholder="e.g. Nairobi" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="placeOfBirthSubCounty" render={({ field }) => (
                        <FormItem><FormLabel>Sub-County *</FormLabel><FormControl><Input placeholder="e.g. Westlands" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="placeOfBirthWard" render={({ field }) => (
                        <FormItem><FormLabel>Ward *</FormLabel><FormControl><Input placeholder="e.g. Parklands" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email Address *</FormLabel><FormControl><Input type="email" readOnly {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Phone Number *</FormLabel><FormControl><Input placeholder="07XXXXXXXX" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="residentialAddress" render={({ field }) => (
                    <FormItem><FormLabel>Residential Address *</FormLabel><FormControl><Input placeholder="Street, Estate, Town" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="nationalId" render={({ field }) => (
                      <FormItem><FormLabel>National ID Number *</FormLabel><FormControl><Input placeholder="ID Number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="kraPin" render={({ field }) => (
                      <FormItem><FormLabel>KRA PIN *</FormLabel><FormControl><Input placeholder="A000000000Z" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="maritalStatus" render={({ field }) => (
                      <FormItem><FormLabel>Marital Status</FormLabel>
                        <FormControl>
                          <select className="w-full border rounded-md p-2 bg-background" {...field}>
                            <option value="">Select</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                        </FormControl><FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="numberOfKids" render={({ field }) => (
                      <FormItem><FormLabel>Number of Dependants</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </div>
              )}

              {/* ── STEP 3: EMPLOYMENT & SOURCE OF FUNDS ── */}
              {step === 3 && (
                <div className="space-y-4">
                  <FormField control={form.control} name="sourceOfFunds" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source of Funds (SOF) *</FormLabel>
                      <FormControl>
                        <select className="w-full border rounded-md p-2 bg-background" {...field}>
                          <option value="">Select source of funds</option>
                          <option value="Employment Income">Employment Income / Salary</option>
                          <option value="Business Income">Business Income</option>
                          <option value="Investment Returns">Investment Returns</option>
                          <option value="Inheritance">Inheritance / Gift</option>
                          <option value="Rental Income">Rental Income</option>
                          <option value="Savings">Savings</option>
                          <option value="Pension">Pension</option>
                          <option value="Other">Other</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="employmentStatus" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Status *</FormLabel>
                      <FormControl>
                        <select className="w-full border rounded-md p-2 bg-background" {...field}>
                          <option value="EMPLOYED">Employed</option>
                          <option value="SELF_EMPLOYED">Self-Employed</option>
                          <option value="UNEMPLOYED">Unemployed</option>
                          <option value="RETIRED">Retired</option>
                          <option value="STUDENT">Student</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="professionalBackground" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Background</FormLabel>
                      <FormControl><Input placeholder="e.g. Finance, Engineering, Healthcare" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="currentOccupation" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Occupation</FormLabel>
                      <FormControl><Input placeholder="e.g. Software Engineer at XYZ Ltd" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="ludevaNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ludeva Member Number (if existing)</FormLabel>
                      <FormControl><Input placeholder="LDV-XXXXX" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              {/* ── STEP 4: DOCUMENT UPLOADS ── */}
              {step === 4 && (
                <div className="space-y-5">
                  <p className="text-sm text-muted-foreground">Please upload clear, legible copies of the required documents.</p>

                  <div className="rounded-lg border p-4 space-y-3">
                    <p className="font-semibold text-sm">Your Documents</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Selfie Photo *</label>
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full text-sm border rounded-md p-2"
                          onChange={e => setSelfieFile(e.target.files?.[0] || null)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Clear face photo, no sunglasses</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">National ID Copy *</label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="w-full text-sm border rounded-md p-2"
                          onChange={e => setIdFile(e.target.files?.[0] || null)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Both sides of National ID</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 space-y-3">
                    <p className="font-semibold text-sm">Primary Beneficiary ID</p>
                    <div>
                      <label className="block text-sm font-medium mb-1">ID Copy (Primary Beneficiary)</label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="w-full text-sm border rounded-md p-2"
                        onChange={e => setPrimaryIdFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 space-y-3">
                    <p className="font-semibold text-sm">Secondary Beneficiary ID (Optional)</p>
                    <div>
                      <label className="block text-sm font-medium mb-1">ID Copy (Secondary Beneficiary)</label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="w-full text-sm border rounded-md p-2"
                        onChange={e => setSecondaryIdFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 5: BENEFICIARIES & INVESTMENT ── */}
              {step === 5 && (
                <div className="space-y-5">
                  <div className="rounded-lg border p-4 space-y-3">
                    <p className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Primary Beneficiary *</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <FormField control={form.control} name="primaryBeneficiaryName" render={({ field }) => (
                        <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="primaryBeneficiaryPercentage" render={({ field }) => (
                        <FormItem><FormLabel>% Allocation *</FormLabel><FormControl><Input type="number" min={1} max={100} {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="primaryBeneficiaryIdNumber" render={({ field }) => (
                        <FormItem><FormLabel>ID Number *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="primaryBeneficiaryEmail" render={({ field }) => (
                        <FormItem><FormLabel>Email Address *</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="primaryBeneficiaryPhone" render={({ field }) => (
                        <FormItem className="sm:col-span-2"><FormLabel>Phone Number *</FormLabel><FormControl><Input placeholder="07XXXXXXXX" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 space-y-3">
                    <p className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Secondary Beneficiary (Optional)</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <FormField control={form.control} name="secondaryBeneficiaryName" render={({ field }) => (
                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="secondaryBeneficiaryPercentage" render={({ field }) => (
                        <FormItem><FormLabel>% Allocation</FormLabel><FormControl><Input type="number" min={0} max={99} {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="secondaryBeneficiaryIdNumber" render={({ field }) => (
                        <FormItem><FormLabel>ID Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="secondaryBeneficiaryPhone" render={({ field }) => (
                        <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="07XXXXXXXX" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  </div>

                  <FormField control={form.control} name="initialInvestment" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Investment Amount (KES) *</FormLabel>
                      <FormControl><Input type="number" min={MINIMUM_INVESTMENT} {...field} /></FormControl>
                      <p className="text-xs text-muted-foreground mt-1">Minimum: KES {MINIMUM_INVESTMENT.toLocaleString()}</p>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {step > 1 && (
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
                    ← Back
                  </Button>
                )}
                {step < TOTAL_STEPS ? (
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={async () => {
                      // Validate current step fields before advancing
                      const stepFields: Record<number, (keyof FormValues)[]> = {
                        1: ["accountType"],
                        2: ["fullName", "dateOfBirth", "placeOfBirthCounty", "placeOfBirthSubCounty", "placeOfBirthWard", "email", "phone", "residentialAddress", "nationalId", "kraPin"],
                        3: ["sourceOfFunds", "employmentStatus"],
                        4: [],
                      };
                      const valid = await form.trigger(stepFields[step] as any);
                      if (valid) setStep(s => s + 1);
                    }}
                  >
                    Continue →
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={form.formState.isSubmitting || uploading}
                  >
                    {form.formState.isSubmitting || uploading
                      ? "Submitting KYC..."
                      : "Submit KYC & Create Account"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
