"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { updateProfile } from "./actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  nationalId: z.string().min(5),
  dateOfBirth: z.string().min(10),
  countyOfBirth: z.string().min(2),
  countyOfResidence: z.string().min(2),
  ludevaNumber: z.string().optional(),
  maritalStatus: z.string().optional(),
  numberOfKids: z.coerce.number().optional(),
  nextOfKinName: z.string().min(2),
  nextOfKinPhone: z.string().min(10),
  nextOfKinEmail: z.string().email(),
});

interface ProfileFormProps {
  profileData: z.infer<typeof formSchema>;
}

export function ProfileForm({ profileData }: ProfileFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: profileData,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        await updateProfile(values);
        toast({
          title: "Profile updated",
          description: "Your changes have been saved successfully.",
        });
        router.refresh();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Update failed",
          description: error?.message || "Something went wrong.",
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          {Object.keys(profileData).map((key) => (
            <FormField
              key={key}
              control={form.control}
              name={key as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{key.replace(/([A-Z])/g, " $1")}</FormLabel>
                  <FormControl>
                    <Input
                      type={key === "dateOfBirth" ? "date" : key.includes("Email") ? "email" : key.includes("Phone") ? "tel" : "text"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="flex justify-end border-t pt-6">
          <Button type="submit" disabled={isPending}>
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}