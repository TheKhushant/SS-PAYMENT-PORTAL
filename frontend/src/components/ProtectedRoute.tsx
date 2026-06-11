import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/store";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Suspense } from "react";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-background">
        <AppSidebar />
        <SidebarInset className="min-w-0 flex-1 overflow-x-hidden">
          <main className="min-w-0 flex-1 overflow-auto">
            <div className="p-6">
              <Suspense fallback={
                <div className="flex h-96 items-center justify-center text-muted-foreground">
                  Loading...
                </div>
              }>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}