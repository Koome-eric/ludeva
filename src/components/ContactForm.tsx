'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  department: z.string({
    required_error: "Please select a department.",
  }),

  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),

  email: z.string().email({
    message: "Please enter a valid email address.",
  }),

  phone: z.string().optional(),

  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

export function ContactForm() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      department: "",
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to send message");
    }

    toast({
      title: "Message Sent!",
      description:
        "Your message has been delivered. Our team will contact you shortly.",
    });

    form.reset();

  } catch (error: any) {
    console.error(error);

    toast({
      title: "Error",
      description: error.message || "Unable to send message.",
      variant: "destructive",
    });
  }
}

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Department */}
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>

              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  <SelectItem value="general">
                    General Inquiry
                  </SelectItem>

                  <SelectItem value="consultation">
                    Consultation
                  </SelectItem>

                  <SelectItem value="investment">
                    Investment
                  </SelectItem>
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="+254 712 345 678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Message */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="How can we help you today?"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Send Message
        </Button>

      </form>
    </Form>
  );
}