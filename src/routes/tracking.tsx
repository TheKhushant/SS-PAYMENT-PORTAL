import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useData, inr } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Bell, StickyNote, Eye } from "lucide-react";
import { toast } from "sonner";

interface Row {
  studentId: string;
  studentName: string;
  amount: number;
  dueDate: string;
  days: number; // positive: days remaining; negative: days overdue
}

export default function TrackingPage() {
  const { students } = useData();

  const { upcoming, overdue } = useMemo(() => {
    const now = Date.now();
    const upcoming: Row[] = [];
    const overdue: Row[] = [];

    students.forEach((s) => {
      s.installments.forEach((i) => {
        if (i.status === "paid") return;
        const due = new Date(i.dueDate).getTime();
        const days = Math.round((due - now) / 86400000);
        const row: Row = { 
          studentId: s.id, 
          studentName: s.name, 
          amount: i.amount, 
          dueDate: i.dueDate, 
          days 
        };
        if (i.status === "overdue") overdue.push(row);
        else upcoming.push(row);
      });
    });

    upcoming.sort((a, b) => a.days - b.days);
    overdue.sort((a, b) => a.days - b.days);
    return { upcoming, overdue };
  }, [students]);

  return (
    <>
      <PageHeader 
        title="Upcoming & Overdue Payments" 
        description="Track and follow up on pending installments." 
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>
              {upcoming.length} payments · {inr(upcoming.reduce((a, r) => a + r.amount, 0))}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <PaymentTable rows={upcoming} kind="upcoming" />
          </CardContent>
        </Card>

        <Card className="shadow-soft border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Overdue</CardTitle>
            <CardDescription>
              {overdue.length} payments · {inr(overdue.reduce((a, r) => a + r.amount, 0))}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <PaymentTable rows={overdue} kind="overdue" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function PaymentTable({ rows, kind }: { rows: Row[]; kind: "upcoming" | "overdue" }) {
  if (rows.length === 0)
    return <div className="py-12 text-center text-sm text-muted-foreground">No {kind} payments.</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>{kind === "overdue" ? "Days Overdue" : "Days Left"}</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.studentId + r.dueDate}>
            <TableCell className="font-medium">{r.studentName}</TableCell>
            <TableCell>{inr(r.amount)}</TableCell>
            <TableCell>{new Date(r.dueDate).toLocaleDateString("en-IN")}</TableCell>
            <TableCell>
              <StatusBadge status={kind} />
              <span className={`ml-2 text-sm ${kind === "overdue" ? "text-destructive" : "text-muted-foreground"}`}>
                {Math.abs(r.days)}d
              </span>
            </TableCell>
            <TableCell className="text-right">
              <Button size="sm" variant="ghost" onClick={() => toast.success("Reminder sent")}>
                <Bell className="size-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast("Note added")}>
                <StickyNote className="size-4" />
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link to={`/students/${r.studentId}`}>
                  <Eye className="mr-1 size-4" /> View
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}