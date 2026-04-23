import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Roboto_Slab } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Ludeva MMF | Accessible, Secure & Smart Investments in Kenya",
  description:
    "Ludeva offers accessible, secure, and professionally managed Money Market Fund (MMF) investments in Kenya.",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/member/dashboard"
      signUpFallbackRedirectUrl="/onboarding/investment"
      appearance={{
        elements: {
          formButtonPrimary:
            "bg-primary hover:bg-primary/90 text-primary-foreground",
          card: "shadow-xl",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`
            ${inter.variable}
            ${robotoSlab.variable}
            font-body
            antialiased
            min-h-screen
            w-full
            bg-background
            text-foreground
          `}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* FULL WIDTH ROOT */}
            <main className="w-full min-h-screen">
              {children}
            </main>

            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
