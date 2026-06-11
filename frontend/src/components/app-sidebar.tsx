import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarClock,
  BookOpen,
  BarChart3,
  FileText,
  GraduationCap,
  PanelLeft,
  PanelRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const main = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Students", url: "/students", icon: Users },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Tracking", url: "/tracking", icon: CalendarClock },
];

const manage = [
  { title: "Courses", url: "/courses", icon: BookOpen },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: FileText },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (url: string) =>
    url === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(url);

  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 border-r bg-sidebar text-sidebar-foreground transition-all duration-200 md:flex md:flex-col",
        collapsed ? "w-18" : "w-64"
      )}
    >
      <header className="border-b p-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </div>

            {!collapsed && (
              <div className="leading-tight">
                <div className="text-sm font-semibold">FeeFlow</div>
                <div className="text-[11px] text-muted-foreground">Admin Console</div>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((value) => !value)}
            className="h-8 w-8 rounded-md hover:bg-primary/10 hover:text-primary"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelRight className="size-4" /> : <PanelLeft className="size-4" />}
          </Button>
        </div>
      </header>

      <nav className="flex-1 overflow-y-auto p-2">
        {!collapsed && <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Overview</p>}
        <div className="space-y-1">
          {main.map((item) => {
            const active = isActive(item.url);
            return (
              <Link
                key={item.title}
                to={item.url}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary/10 hover:text-primary",
                  active && "bg-primary/10 text-primary"
                )}
                title={item.title}
              >
                <item.icon className="size-4 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>

        {!collapsed && <p className="px-2 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Manage</p>}
        <div className="space-y-1">
          {manage.map((item) => {
            const active = isActive(item.url);
            return (
              <Link
                key={item.title}
                to={item.url}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary/10 hover:text-primary",
                  active && "bg-primary/10 text-primary"
                )}
                title={item.title}
              >
                <item.icon className="size-4 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}