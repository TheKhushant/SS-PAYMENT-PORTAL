import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Lock } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("admin@institute.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const submit = async(e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    
    const ok = await auth.login(email,password);
    setLoading(false);

    if (ok) {
      toast.success("Welcome back, Admin");
      navigate(redirect ?? "/dashboard");
    } else {
      toast.error("Invalid credentials");
    }
    
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative items-center justify-center p-12 bg-gradient-to-br from-primary to-[oklch(0.42_0.22_280)] text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-sm font-medium mb-8">
            <GraduationCap className="size-4" /> FeeFlow Admin
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Run your institute's revenue with clarity.
          </h1>
          <p className="mt-4 text-primary-foreground/80 text-lg">
            Track students, installments, payments and approvals — all in one streamlined dashboard.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              ["₹4.2L", "Revenue tracked"],
              ["180+", "Students managed"],
              ["98%", "Collection rate"],
            ].map(([k, v]) => (
              <div key={v} className="rounded-xl bg-white/10 backdrop-blur p-4">
                <div className="text-2xl font-bold">{k}</div>
                <div className="text-xs text-primary-foreground/70 mt-1">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={submit} className="w-full max-w-sm space-y-6">
          <div>
            <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary-soft text-primary mb-4">
              <Lock className="size-5" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Sign in to FeeFlow</h2>
            <p className="text-sm text-muted-foreground mt-1">Admin dashboard access</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>

          <div className="rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
            <div className="font-medium text-foreground mb-1">Demo credentials</div>
            admin@gmail.com / 123456
          </div>
        </form>
      </div>
    </div>
  );
}