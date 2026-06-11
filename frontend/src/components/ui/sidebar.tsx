import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { PanelLeftIcon } from "lucide-react";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  children,
  className = "",
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);
  const [_open, _setOpen] = useState(defaultOpen);

  const open = openProp ?? _open;

  const setOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const newOpen = typeof value === "function" ? value(open) : value;
      if (onOpenChange) onOpenChange(newOpen);
      else _setOpen(newOpen);

      document.cookie = `${SIDEBAR_COOKIE_NAME}=${newOpen}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [open, onOpenChange]
  );

  const toggleSidebar = useCallback(() => {
    isMobile ? setOpenMobile((p) => !p) : setOpen((p) => !p);
  }, [isMobile, setOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  return (
    <SidebarContext.Provider
      value={{
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }}
    >
      <div
        className={`group/sidebar-wrapper flex min-h-screen w-full ${className}`}
        style={{
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
        } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({ className = "", children }: React.ComponentProps<"div">) {
  const { isMobile, openMobile, setOpenMobile, state } = useSidebar();

  if (isMobile) {
    return (
      <>
        {openMobile && (
          <div
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={() => setOpenMobile(false)}
          />
        )}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-[--sidebar-width] bg-sidebar text-sidebar-foreground transition-transform duration-300 md:hidden ${
            openMobile ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}
        >
          <div className="flex h-full flex-col">{children}</div>
        </div>
      </>
    );
  }

  return (
    <div className={`hidden md:block text-sidebar-foreground ${className}`} data-state={state}>
      <div
        className={`transition-all duration-200 ${
          state === "collapsed" ? "w-[--sidebar-width-icon]" : "w-[--sidebar-width]"
        }`}
      />
      <div
        className={`fixed inset-y-0 left-0 z-40 h-screen w-[--sidebar-width] border-r bg-sidebar transition-all duration-200 ${
          state === "collapsed" ? "w-[--sidebar-width-icon]" : ""
        }`}
      >
        <div className="flex h-full flex-col">{children}</div>
      </div>
    </div>
  );
}

export function SidebarGroupContent({
  className = "",
  children,
}: React.ComponentProps<"div">) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function SidebarGroupLabel({
  className = "",
  children,
}: React.ComponentProps<"div">) {
  return (
    <div
      className={`mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground ${className}`}
    >
      {children}
    </div>
  );
}

export function SidebarTrigger({ className = "" }: { className?: string }) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      className={`rounded-md p-2 hover:bg-muted ${className}`}
    >
      <PanelLeftIcon className="h-5 w-5" />
    </button>
  );
}

export function SidebarInset({ className = "", children }: React.ComponentProps<"main">) {
  const { state, isMobile } = useSidebar();
  return (
    <main
      className={`flex-1 transition-all duration-200 ${
        !isMobile
          ? state === "expanded"
            ? "md:ml-[--sidebar-width]"
            : "md:ml-[--sidebar-width-icon]"
          : ""
      } ${className}`}
    >
      {children}
    </main>
  );
}

/* ====================== MENU COMPONENTS ====================== */

export function SidebarHeader({ className = "", children }: React.ComponentProps<"div">) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function SidebarContent({ className = "", children }: React.ComponentProps<"div">) {
  return <div className={`flex-1 overflow-auto p-3 ${className}`}>{children}</div>;
}

export function SidebarFooter({ className = "", children }: React.ComponentProps<"div">) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function SidebarMenu({ className = "", children }: React.ComponentProps<"ul">) {
  return <ul className={`space-y-1 ${className}`}>{children}</ul>;
}

export function SidebarMenuItem({ className = "", children }: React.ComponentProps<"li">) {
  return <li className={`relative ${className}`}>{children}</li>;
}

export function SidebarMenuButton({
  children,
  isActive = false,
  className = "",
  ...props
}: React.ComponentProps<"button"> & { isActive?: boolean }) {
  return (
    <button
      className={`
        flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium
        transition-all duration-200
        hover:bg-muted hover:text-foreground
        active:bg-muted/70
        ${isActive ? "bg-accent text-accent-foreground font-medium" : "text-sidebar-foreground"}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export function SidebarMenuSub({ className = "", children }: React.ComponentProps<"ul">) {
  return (
    <ul className={`ml-6 mt-1 space-y-1 border-l border-border pl-4 text-sm ${className}`}>
      {children}
    </ul>
  );
}

export function SidebarMenuSubButton({
  children,
  isActive = false,
  className = "",
  ...props
}: React.ComponentProps<"a"> & { isActive?: boolean }) {
  return (
    <a
      className={`
        flex items-center gap-3 rounded-md px-3 py-1.5 text-sm
        hover:bg-muted hover:text-foreground
        transition-colors
        ${isActive ? "bg-accent text-accent-foreground" : "text-sidebar-foreground"}
        ${className}
      `}
      {...props}
    >
      {children}
    </a>
  );
}

// Additional helpful components
export function SidebarSeparator() {
  return <div className="my-4 h-px bg-border mx-3" />;
}

export function SidebarGroup({ className = "", children }: React.ComponentProps<"div">) {
  return <div className={`mb-6 ${className}`}>{children}</div>;
}

export {
  useSidebar,
  // Add more if needed
};