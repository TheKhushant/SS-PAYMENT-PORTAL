import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "danger" | "neutral";
  hint?: string;
}

const tones: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-destructive-soft text-destructive",
  neutral: "bg-muted text-muted-foreground",
};

export function KpiCard({ 
  label, 
  value, 
  icon: Icon, 
  tone = "primary", 
  hint 
}: KpiCardProps) {
  return (
    <Card className="shadow-soft hover:shadow-card transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight truncate">
              {value}
            </div>
            {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
          </div>
          <div className={cn("size-10 rounded-lg grid place-items-center shrink-0", tones[tone])}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}