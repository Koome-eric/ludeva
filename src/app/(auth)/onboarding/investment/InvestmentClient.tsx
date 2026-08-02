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

const baseFormSchema = z.object({
  // Account type — Individual investors only.
  accountType: z.literal("INDIVIDUAL"),
  teamName: z.string().optional(),

  // Personal info
  fullName: z.string().min(2, "Full name is required."),
  dateOfBirth: z.string().min(10, "Date of birth is required."),
  placeOfBirthCounty: z.string().min(2, "County of birth is required."),
  placeOfBirthSubCounty: z.string().min(2, "Sub-county of birth is required."),
  placeOfBirthWard: z.string().min(2, "Ward of birth is required."),
  email: z.string().email("Valid email is required."),
  residentialAddress: z.string().min(5, "Residential address is required."),
  sourceOfFunds: z.string().min(3, "Source of funds is required.").refine(
    (v) => v !== "",
    "Please select a source of funds."
  ),

  // Employment
  employmentStatus: z.enum(["EMPLOYED", "SELF_EMPLOYED", "UNEMPLOYED", "RETIRED", "STUDENT"]),
  professionalBackground: z.string().optional(),
  currentOccupation: z.string().optional(),

  // Legacy / extra
  countyOfResidence: z.string().optional(),
  ludevaNumber: z.string().optional(),
  maritalStatus: z.string().optional(),
  numberOfKids: z.coerce.number().optional(),

  initialInvestment: z.coerce
    .number()
    .min(MINIMUM_INVESTMENT, `Minimum investment is KES ${MINIMUM_INVESTMENT}`),

  lockInYears: z.coerce.number().refine(
    (v) => [1, 2, 3, 5, 7, 10].includes(v),
    "Please select a lock-in period."
  ),
});

// No cross-field rules needed now that accountType is fixed to INDIVIDUAL.
const formSchema = baseFormSchema;

type FormValues = z.infer<typeof baseFormSchema>;

// Upload helper — files are stored in Cloudflare R2 via /api/upload-kyc-doc
async function uploadFile(file: File, label: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("label", label);
  const res = await fetch("/api/upload-kyc-doc", { method: "POST", body: formData });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to upload ${label}`);
  }
  const json = await res.json();
  return json.url as string;
}

export default function InvestmentClient() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 4;

  // File state
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileErrors, setFileErrors] = useState<{ selfie?: string; id?: string }>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      accountType: "INDIVIDUAL",
      teamName: "",
      fullName: "",
      dateOfBirth: "",
      placeOfBirthCounty: "",
      placeOfBirthSubCounty: "",
      placeOfBirthWard: "",
      email: "",
      residentialAddress: "",
      sourceOfFunds: "",
      employmentStatus: "EMPLOYED",
      professionalBackground: "",
      currentOccupation: "",
      countyOfResidence: "",
      ludevaNumber: "",
      maritalStatus: "",
      numberOfKids: 0,
      initialInvestment: MINIMUM_INVESTMENT,
      lockInYears: undefined as unknown as number,
    },
  });

  React.useEffect(() => {
    if (isLoaded && user) {
      form.setValue("fullName", user.fullName || "");
      form.setValue("email", user.primaryEmailAddress?.emailAddress || "");
    }
  }, [isLoaded, user, form]);

  const accountType = form.watch("accountType");

  // Validates that all required documents have been attached.
  // Returns true if valid; otherwise sets inline errors and returns false.
  function validateFiles(): boolean {
    const errors: { selfie?: string; id?: string } = {};
    if (!selfieFile) errors.selfie = "Selfie photo is required.";
    if (!idFile) errors.id = "National ID copy is required.";
    setFileErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function onSubmit(values: FormValues) {
    // Guard: even if a user somehow triggers submit before reaching step 4,
    // or skips picking files, block here as a final safety net.
    const filesOk = validateFiles();
    if (!filesOk) {
      setStep(TOTAL_STEPS);
      toast({
        variant: "destructive",
        title: "Missing required documents",
        description: "Please upload both your selfie and National ID copy before submitting.",
      });
      return;
    }

    try {
      setUploading(true);

      const selfieUrl = await uploadFile(selfieFile as File, "selfie");
      const idCopyUrl = await uploadFile(idFile as File, "id_copy");

      setUploading(false);

      await completeOnboarding({
        ...values,
        selfieUrl,
        idCopyUrl,
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
    "Document Uploads & Investment",
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
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Account Type *</FormLabel>
                        <div className="mt-2 p-4 rounded-xl border-2 border-primary bg-primary/5">
                          <div className="font-semibold text-sm">Individual Investor</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Ludeva investment accounts are currently available for individual investors only.
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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

                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email Address *</FormLabel><FormControl><Input type="email" readOnly {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <FormField control={form.control} name="residentialAddress" render={({ field }) => (
                    <FormItem><FormLabel>Residential Address *</FormLabel><FormControl><Input placeholder="Street, Estate, Town" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

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

              {/* ── STEP 4: DOCUMENT UPLOADS & INVESTMENT ── */}
              {step === 4 && (
                <div className="space-y-5">
                  <p className="text-sm text-muted-foreground">Please upload clear, legible copies of the required documents. All documents below are required to submit your KYC.</p>

                  <div className="rounded-lg border p-4 space-y-3">
                    <p className="font-semibold text-sm">Your Documents</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Selfie Photo *</label>
                        <input
                          type="file"
                          accept="image/*"
                          capture="user"
                          className={`w-full text-sm border rounded-md p-2 ${fileErrors.selfie ? "border-destructive" : ""}`}
                          onChange={e => {
                            const f = e.target.files?.[0] || null;
                            setSelfieFile(f);
                            if (f) setFileErrors(prev => ({ ...prev, selfie: undefined }));
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Clear face photo, no sunglasses</p>
                        {selfieFile && (
                          <p className="text-xs text-green-600 mt-1">✓ {selfieFile.name}</p>
                        )}
                        {fileErrors.selfie && (
                          <p className="text-xs text-destructive mt-1">{fileErrors.selfie}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">National ID Copy *</label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className={`w-full text-sm border rounded-md p-2 ${fileErrors.id ? "border-destructive" : ""}`}
                          onChange={e => {
                            const f = e.target.files?.[0] || null;
                            setIdFile(f);
                            if (f) setFileErrors(prev => ({ ...prev, id: undefined }));
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Both sides of National ID</p>
                        {idFile && (
                          <p className="text-xs text-green-600 mt-1">✓ {idFile.name}</p>
                        )}
                        {fileErrors.id && (
                          <p className="text-xs text-destructive mt-1">{fileErrors.id}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
                    <p className="font-semibold text-sm">Investment Application Form</p>
                    <p className="text-xs text-muted-foreground">
                      Download the original form below, print it, fill it in, and sign it. Then email the
                      signed copy to{' '}
                      <a href="mailto:invest@ludevaplc.co.ke" className="font-medium text-primary underline underline-offset-2">
                        invest@ludevaplc.co.ke
                      </a>
                      . You do not need to upload it here — this step is separate from your KYC submission.
                    </p>
                    <a
                      href="/documents/investment-application-form.pdf"
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-primary underline underline-offset-2"
                    >
                      Download Original Investment Application Form
                    </a>
                  </div>

                  <FormField control={form.control} name="initialInvestment" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Investment Amount (KES) *</FormLabel>
                      <FormControl><Input type="number" min={MINIMUM_INVESTMENT} {...field} /></FormControl>
                      <p className="text-xs text-muted-foreground mt-1">Minimum: KES {MINIMUM_INVESTMENT.toLocaleString()}</p>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="lockInYears" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lock-in Period *</FormLabel>
                      <FormControl>
                        <select
                          className="w-full border rounded-md p-2 bg-background"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        >
                          <option value="">Select lock-in period</option>
                          <option value={1}>1 Year</option>
                          <option value={2}>2 Years</option>
                          <option value={3}>3 Years</option>
                          <option value={5}>5 Years</option>
                          <option value={7}>7 Years</option>
                          <option value={10}>10 Years</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {(!selfieFile || !idFile) && (
                    <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-md p-2">
                      Upload your selfie and National ID above to enable submission.
                    </p>
                  )}
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
                      const stepFields: Record<number, (keyof FormValues)[]> = {
                        1: ["accountType"],
                        2: ["fullName", "dateOfBirth", "placeOfBirthCounty", "placeOfBirthSubCounty", "placeOfBirthWard", "email", "residentialAddress"],
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
                    disabled={form.formState.isSubmitting || uploading || !selfieFile || !idFile || !form.watch("lockInYears")}
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
