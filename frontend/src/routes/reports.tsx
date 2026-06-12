import { studentTotals, useData, inr } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Users, Wallet, AlertCircle, CalendarDays } from "lucide-react";
import { downloadCSV } from "@/lib/csv";
import { toast } from "sonner";

export default function ReportsPage() {
  const { students, courses, payments } = useData();
  const courseName = (id: string) => courses.find((c) => c._id === id)?.name ?? "—";

  const exportStudents = () => {
    downloadCSV("students.csv", students.map((s) => {
      const t = studentTotals(s);
      return {
        Name: s.name, 
        Mobile: s.mobile, 
        Email: s.email, 
        College: s.college,
        Course: courseName(s.courseId), 
        Duration: `${s.durationMonths}m`,
        AdmissionDate: new Date(s.admissionDate).toLocaleDateString("en-IN"),
        TotalFee: t.finalFee, 
        Paid: t.paid, 
        Remaining: t.remaining, 
        Status: s.status,
      };
    }));
    toast.success("Students report exported");
  };

  const exportRevenue = () => {
    downloadCSV("revenue.csv", payments.map((p) => ({
      Date: new Date(p.date).toLocaleDateString("en-IN"),
      Student: students.find((s) => s.id === p.studentId)?.name ?? "—",
      Amount: p.amount, 
      Method: p.method, 
      TransactionID: p.transactionId ?? "", 
      Notes: p.notes ?? "",
    })));
    toast.success("Revenue report exported");
  };

  const exportPending = () => {
    const rows: Record<string, unknown>[] = [];
    students.forEach((s) => s.installments.forEach((i) => {
      if (i.status !== "paid")
        rows.push({
          Student: s.name, 
          Mobile: s.mobile, 
          Course: courseName(s.courseId),
          InstallmentAmount: i.amount, 
          DueDate: new Date(i.dueDate).toLocaleDateString("en-IN"), 
          Status: i.status,
        });
    }));
    downloadCSV("pending-fees.csv", rows);
    toast.success("Pending fees report exported");
  };

  const exportMonthly = () => {
    const now = new Date();
    const map = new Map<string, number>();
    payments.forEach((p) => {
      const d = new Date(p.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) ?? 0) + p.amount);
    });
    const rows = Array.from(map.entries()).sort().map(([Month, Amount]) => ({ Month, Amount }));
    downloadCSV("monthly-collection.csv", rows);
    toast.success("Monthly collection exported");
  };

  const reports = [
    { title: "Student Report", desc: "All students with fee, paid and balance", icon: Users, action: exportStudents },
    { title: "Revenue Report", desc: "Every collected payment", icon: Wallet, action: exportRevenue },
    { title: "Pending Fees Report", desc: "Outstanding installments grouped by student", icon: AlertCircle, action: exportPending },
    { title: "Monthly Collection", desc: "Revenue collected per month", icon: CalendarDays, action: exportMonthly },
  ];

  return (
    <>
      <PageHeader title="Reports" description="Export operational reports as CSV." />
      <div className="grid md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <Card key={r.title} className="shadow-soft">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-primary-soft text-primary grid place-items-center">
                  <r.icon className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{r.title}</CardTitle>
                  <CardDescription>{r.desc}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={r.action} className="w-full sm:w-auto">
                <FileDown className="mr-2 size-4" /> Download CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}