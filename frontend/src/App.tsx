import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy } from "react";           // ← Make sure this line exists
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider, DataProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy loaded pages
const Login = lazy(() => import("./routes/login"));
const Dashboard = lazy(() => import("./routes/dashboard"));
const Students = lazy(() => import("./routes/students/index"));
const NewStudent = lazy(() => import("./routes/students/new"));
const StudentDetail = lazy(() => import("./routes/students/$id"));
const Payments = lazy(() => import("./routes/payments"));
const Reports = lazy(() => import("./routes/reports"));
const Analytics = lazy(() => import("./routes/analytics"));
const Tracking = lazy(() => import("./routes/tracking"));
const Courses = lazy(() => import("./routes/courses"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataProvider>
          <TooltipProvider>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route path="/" element={<ProtectedRoute />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="students" element={<Students />} />
                <Route path="students/index" element={<NewStudent />} />
                <Route path="students/new" element={<NewStudent />} />
                <Route path="students/:id" element={<StudentDetail />} />
                <Route path="payments" element={<Payments />} />
                <Route path="reports" element={<Reports />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="tracking" element={<Tracking />} />
                <Route path="courses" element={<Courses />} />
              </Route>

              <Route path="*" element={
                <div className="flex min-h-screen items-center justify-center bg-background">
                  <div className="text-center">
                    <h1 className="text-7xl font-bold">404</h1>
                    <p className="mt-4 text-xl text-muted-foreground">Page not found</p>
                    <a href="/" className="mt-6 inline-block text-primary hover:underline">← Go Home</a>
                  </div>
                </div>
              } />
            </Routes>
          </TooltipProvider>

          <Toaster richColors position="top-right" />
        </DataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;