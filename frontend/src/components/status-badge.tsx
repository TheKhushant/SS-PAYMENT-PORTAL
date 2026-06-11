import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = 
  | "paid" 
  | "upcoming" 
  | "overdue" 
  | "pending" 
  | "approved" 
  | "rejected" 
  | "active" 
  | "completed" 
  | "inactive";

const map: Record<Status, string> = {
  paid: "bg-success-soft text-success border-success/20",
  upcoming: "bg-warning-soft text-warning border-warning/20",
  overdue: "bg-destructive-soft text-destructive border-destructive/20",
  pending: "bg-warning-soft text-warning border-warning/20",
  approved: "bg-success-soft text-success border-success/20",
  rejected: "bg-muted text-muted-foreground border-border",
  active: "bg-primary-soft text-primary border-primary/20",
  completed: "bg-success-soft text-success border-success/20",
  inactive: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ 
  status, 
  className 
}: { 
  status: Status; 
  className?: string 
}) {
  return (
    <Badge 
      variant="outline" 
      className={cn("capitalize font-medium", map[status], className)}
    >
      {status}
    </Badge>
  );
}