// One appearance object for every Clerk surface (sign-in, sign-up), driven by
// the same CSS tokens as the rest of the site so light and dark mode follow
// the app's theme instead of Clerk's fixed light card. The card sits flat on
// the page: AuthShell supplies the framing, so Clerk's own shadow and border
// are neutralised rather than doubled up.
//
// Shadows are set with style objects (not classNames) on purpose: the root
// ClerkProvider in layout.tsx still passes `card: "shadow-xl"`, and a style
// object always beats a competing utility class regardless of CSS order.
export const clerkAppearance = {
  variables: {
    colorPrimary: 'hsl(var(--primary))',
    colorBackground: 'hsl(var(--card))',
    colorText: 'hsl(var(--foreground))',
    colorTextSecondary: 'hsl(var(--muted-foreground))',
    colorInputBackground: 'hsl(var(--background))',
    colorInputText: 'hsl(var(--foreground))',
    colorDanger: 'hsl(var(--destructive))',
    borderRadius: '0.75rem',
    fontFamily: 'var(--font-inter), sans-serif',
    fontFamilyButtons: 'var(--font-inter), sans-serif',
  },
  elements: {
    rootBox: 'w-full',
    cardBox: {
      width: '100%',
      boxShadow: 'none',
      border: '1px solid hsl(var(--border))',
      borderRadius: '1rem',
    },
    card: { boxShadow: 'none', backgroundColor: 'hsl(var(--card))' },
    headerTitle: 'font-headline tracking-tight',
    formButtonPrimary: 'shadow-none normal-case text-sm font-medium',
    socialButtonsBlockButton: 'border-border',
    socialButtonsBlockButtonText: { color: 'hsl(var(--foreground))' },
    // The pages render their own cross-links (sign up / sign in / admin) in
    // AuthShell's footer slot, and layout.tsx already hides Clerk's footer
    // app-wide; repeated here so this appearance object stands on its own.
    footer: { display: 'none' },
  },
} as const;
