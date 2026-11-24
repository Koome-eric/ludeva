import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Ludeva | Accessible, Secure & Smart Investments in Kenya",
  description:
    "Ludeva offers accessible, secure, and professionally managed Shares Account investments in Kenya.",
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

// Headings: a geometric, modern sans that pairs with Inter for a clean
// fintech look (replaces the old serif Roboto Slab).
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-headline",
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
          ${jakarta.variable}
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
              colorPrimary: "hsl(240, 85%, 24%)",
              borderRadius: "0.75rem",
            },
            elements: {
              formButtonPrimary:
                "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm",
              card: "shadow-xl",
              headerTitle: "font-headline",
              footerActionLink: "text-primary hover:text-primary/90",
              formFieldInput: "focus:ring-2 focus:ring-primary/30",
              footer: {
                display: "none",
              },
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
