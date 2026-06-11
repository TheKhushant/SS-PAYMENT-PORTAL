import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/store";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Suspense } from "react";        // ← Add this if not present

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
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
      </div>
    </SidebarProvider>
  );
}