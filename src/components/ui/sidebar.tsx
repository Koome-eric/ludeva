"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3.5rem"

const SIDEBAR_KEYBOARD_SHORTCUT = "b"

/* -------------------------------------------------------------------------- */
/*                                   CONTEXT                                  */
/* -------------------------------------------------------------------------- */

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider")
  }
  return context
}

/* -------------------------------------------------------------------------- */
/*                              SIDEBAR PROVIDER                              */
/* -------------------------------------------------------------------------- */

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)
    const [_open, _setOpen] = React.useState(defaultOpen)

    const open = openProp ?? _open

    const setOpen = React.useCallback(
      (value: boolean | ((v: boolean) => boolean)) => {
        const next = typeof value === "function" ? value(open) : value
        onOpenChange ? onOpenChange(next) : _setOpen(next)
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      },
      [open, onOpenChange]
    )

    const toggleSidebar = React.useCallback(() => {
      isMobile ? setOpenMobile((v) => !v) : setOpen((v) => !v)
    }, [isMobile, setOpen])

    React.useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === SIDEBAR_KEYBOARD_SHORTCUT) {
          e.preventDefault()
          toggleSidebar()
        }
      }
      window.addEventListener("keydown", handler)
      return () => window.removeEventListener("keydown", handler)
    }, [toggleSidebar])

    return (
      <SidebarContext.Provider
        value={{
          state: open ? "expanded" : "collapsed",
          open,
          setOpen,
          isMobile,
          openMobile,
          setOpenMobile,
          toggleSidebar,
        }}
      >
        <TooltipProvider delayDuration={0}>
          <div
            ref={ref}
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "flex h-screen w-full bg-muted/40 overflow-hidden",
              className
            )}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

/* -------------------------------------------------------------------------- */
/*                                   SIDEBAR                                  */
/* -------------------------------------------------------------------------- */

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      variant = "inset",
      collapsible = "icon",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, openMobile, setOpenMobile, state } = useSidebar()

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            side={side}
            className="w-[--sidebar-width] bg-sidebar-brand p-0 border-r border-sidebar-border text-sidebar-foreground"
          >
            <div className="flex h-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <aside
        ref={ref}
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        className={cn(
          "group/sidebar relative hidden md:flex h-full transition-all duration-200",
          "w-[--sidebar-width]",
          "data-[state=collapsed]:w-[--sidebar-width-icon]",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "flex h-full w-full flex-col border-r border-sidebar-border bg-sidebar-brand text-sidebar-foreground shadow-lift",
            "transition-all duration-200"
          )}
        >
          {children}
        </div>
      </aside>
    )
  }
)
Sidebar.displayName = "Sidebar"

/* -------------------------------------------------------------------------- */
/*                                 COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={toggleSidebar}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "flex items-center gap-2 px-4 py-4 border-b border-white/10 font-semibold group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:px-2",
      className
    )}
    {...props}
  />
)

const SidebarContent = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "flex-1 overflow-y-auto px-3 py-4 group-data-[collapsible=icon]/sidebar:px-2",
      className
    )}
    {...props}
  />
)

const SidebarInset = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "flex flex-1 flex-col overflow-y-auto bg-background page-canvas md:rounded-3xl md:m-2 md:shadow-soft",
      className
    )}
    {...props}
  />
)

/* -------------------------------------------------------------------------- */
/*                               MENU COMPONENTS                              */
/* -------------------------------------------------------------------------- */

const sidebarMenuButtonVariants = cva(
  "relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-[13.5px] leading-tight tracking-[-0.005em] transition-all duration-200 outline-none [&>svg:first-child]:box-border [&>svg:first-child]:h-8 [&>svg:first-child]:w-8 [&>svg:first-child]:shrink-0 [&>svg:first-child]:rounded-lg [&>svg:first-child]:p-[7px] [&>svg:first-child]:transition-colors group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:gap-0 group-data-[collapsible=icon]/sidebar:px-2 group-data-[collapsible=icon]/sidebar:[&>span]:hidden group-data-[collapsible=icon]/sidebar:[&>svg:not(:first-child)]:hidden group-data-[collapsible=icon]/sidebar:before:hidden",
  {
    variants: {
      active: {
        true: "bg-white text-[hsl(240_100%_16%)] font-semibold shadow-[0_8px_24px_-10px_rgba(0,0,0,0.55)] [&>svg:first-child]:bg-[hsl(240_100%_16%)] [&>svg:first-child]:text-gold before:absolute before:-left-3 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-gold",
        false: "font-medium text-sidebar-foreground/70 hover:bg-white/[0.07] hover:text-white [&>svg:first-child]:bg-white/[0.06] [&>svg:first-child]:text-sidebar-foreground/80 hover:[&>svg:first-child]:bg-gold/20 hover:[&>svg:first-child]:text-gold",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
)

const SidebarMenu = ({ className, ...props }: React.ComponentProps<"ul">) => (
  <ul className={cn("space-y-1", className)} {...props} />
)

const SidebarMenuItem = ({ ...props }: React.ComponentProps<"li">) => (
  <li {...props} />
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string
  }
>(({ asChild, isActive, tooltip, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const { state, isMobile } = useSidebar()

  const button = (
    <Comp
      ref={ref}
      className={cn(
        sidebarMenuButtonVariants({ active: isActive }),
        className
      )}
      {...props}
    />
  )

  if (!tooltip) return button

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent hidden={state !== "collapsed" || isMobile}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

/* -------------------------------------------------------------------------- */
/*                                   EXPORTS                                  */
/* -------------------------------------------------------------------------- */

export {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
}
