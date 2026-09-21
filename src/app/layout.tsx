import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Roboto_Slab } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "MMF | Accessible, Secure & Smart Investments in Kenya",
  description:
    "Ludeva offers accessible, secure, and professionally managed Money Market Fund (MMF) investments in Kenya.",
  icons: {
    icon: "/images/logo-light.svg",
    shortcut: "/images/logo-light.svg",
    apple: "/images/logo-light.svg",
  },
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
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/member/dashboard"
          signUpFallbackRedirectUrl="/onboarding/investment"
          appearance={{
            variables: {
              colorPrimary: "hsl(220, 85%, 55%)",
              borderRadius: "0.75rem",
            },
            elements: {
              formButtonPrimary:
                "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm",
              card: "shadow-xl",
              headerTitle: "font-headline",
              footerActionLink: "text-primary hover:text-primary/90",
              formFieldInput: "focus:ring-2 focus:ring-primary/30",
            },
          }}
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
        </ClerkProvider>
      </body>
    </html>
  );
}
