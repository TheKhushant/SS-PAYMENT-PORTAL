import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { studentTotals, useData, inr, isSameDay, isSameMonth } from "@/lib/store";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddPaymentDialog } from "@/components/add-payment-dialog";
import {
  Users, UserCheck, Wallet, TrendingUp, CalendarDays, AlertCircle, IndianRupee, ClockAlert,
  Plus, BookOpenCheck, FileDown, Check, X,
} from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { students, payments, requests, approveRequest, rejectRequest } = useData();
  const navigate = useNavigate();
  const [openPay, setOpenPay] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    let totalRevenue = 0, todayCollection = 0, monthlyCollection = 0;

    payments.forEach((p) => {
      totalRevenue += p.amount;
      const d = new Date(p.date);
      if (isSameDay(d, now)) todayCollection += p.amount;
      if (isSameMonth(d, now)) monthlyCollection += p.amount;
    });

    let pendingAmount = 0, upcoming = 0, overdue = 0;
    const todayDue: { studentId: string; studentName: string; courseId: string; amount: number; dueDate: string; status: "upcoming" | "overdue" }[] = [];
    const upcomingList: typeof todayDue = [];

    students.forEach((s) => {
      s.installments.forEach((i) => {
        if (i.status === "paid") return;
        pendingAmount += i.amount;
        const due = new Date(i.dueDate);
        if (i.status === "overdue") overdue += i.amount;
        else upcoming += i.amount;

        if (isSameDay(due, now)) {
          todayDue.push({
            studentId: s.id,
            studentName: s.name,
            courseId: s.courseId,
            amount: i.amount,
            dueDate: i.dueDate,
            status: i.status as "upcoming" | "overdue"
          });
        }

        const diff = (due.getTime() - now.getTime()) / 86400000;
        if (diff >= 0 && diff <= 7) {
          upcomingList.push({
            studentId: s.id,
            studentName: s.name,
            courseId: s.courseId,
            amount: i.amount,
            dueDate: i.dueDate,
            status: i.status as "upcoming" | "overdue"
          });
        }
      });
    });

    return {
      totalStudents: students.length,
      activeStudents: students.filter((s) => s.status === "active").length,
      totalRevenue,
      todayCollection,
      monthlyCollection,
      pendingAmount,
      upcoming,
      overdue,
      todayDue,
      upcomingList: upcomingList
        .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
        .slice(0, 6),
    };
  }, [students, payments]);

  const recentPayments = useMemo(
    () => [...payments].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 5),
    [payments]
  );

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const nameById = (id: string) => students.find((s) => s.id === id)?.name ?? "—";

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of students, revenue and pending payments."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate("/reports")}>
              <FileDown className="mr-2 size-4" /> Reports
            </Button>
            <Button variant="outline" onClick={() => navigate("/courses")}>
              <BookOpenCheck className="mr-2 size-4" /> Courses
            </Button>
            <Button variant="outline" onClick={() => setOpenPay(true)}>
              <IndianRupee className="mr-2 size-4" /> Add Payment
            </Button>
            <Button onClick={() => navigate("/students/new")}>
              <Plus className="mr-2 size-4" /> New Student
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Students" value={stats.totalStudents} icon={Users} tone="primary" />
        <KpiCard label="Active Students" value={stats.activeStudents} icon={UserCheck} tone="success" />
        <KpiCard label="Total Revenue" value={inr(stats.totalRevenue)} icon={TrendingUp} tone="primary" />
        <KpiCard label="Today's Collection" value={inr(stats.todayCollection)} icon={Wallet} tone="success" />
        <KpiCard label="Monthly Collection" value={inr(stats.monthlyCollection)} icon={CalendarDays} tone="primary" />
        <KpiCard label="Pending Amount" value={inr(stats.pendingAmount)} icon={AlertCircle} tone="warning" />
        <KpiCard label="Upcoming Payments" value={inr(stats.upcoming)} icon={ClockAlert} tone="warning" />
        <KpiCard label="Overdue Payments" value={inr(stats.overdue)} icon={AlertCircle} tone="danger" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Pending Payments */}
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Today's Pending Payments</CardTitle>
                <CardDescription>Installments due today</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/tracking">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {stats.todayDue.length === 0 ? (
                <EmptyRow text="No payments due today." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.todayDue.map((r) => (
                      <TableRow key={r.studentId + r.dueDate}>
                        <TableCell className="font-medium">{r.studentName}</TableCell>
                        <TableCell>{inr(r.amount)}</TableCell>
                        <TableCell><StatusBadge status={r.status} /></TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/students/${r.studentId}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Payments */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Upcoming Payments (next 7 days)</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.upcomingList.length === 0 ? (
                <EmptyRow text="No upcoming payments in the next week." />
              ) : (
                <div className="space-y-2">
                  {stats.upcomingList.map((u) => (
                    <Link
                      key={u.studentId + u.dueDate}
                      to={`/students/${u.studentId}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-sm">{u.studentName}</div>
                        <div className="text-xs text-muted-foreground">
                          Due {new Date(u.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">{inr(u.amount)}</span>
                        <StatusBadge status={u.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {recentPayments.length === 0 ? (
                <EmptyRow text="No recent payments." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPayments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{nameById(p.studentId)}</TableCell>
                        <TableCell className="font-semibold text-success">{inr(p.amount)}</TableCell>
                        <TableCell><span className="text-muted-foreground">{p.method}</span></TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">
                          {new Date(p.date).toLocaleDateString("en-IN")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Approval Requests Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Approval Requests</CardTitle>
              <CardDescription>{pendingRequests.length} pending</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingRequests.length === 0 ? (
                <EmptyRow text="No pending requests." />
              ) : (
                pendingRequests.map((r) => (
                  <div key={r.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-sm">{nameById(r.studentId)}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(r.submittedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </div>
                      </div>
                      <div className="text-base font-semibold">{inr(r.amount)}</div>
                    </div>
                    {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                        onClick={() => {
                          approveRequest(r.id);
                          toast.success("Request approved");
                        }}
                      >
                        <Check className="mr-1 size-4" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          rejectRequest(r.id);
                          toast("Request rejected");
                        }}
                      >
                        <X className="mr-1 size-4" /> Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddPaymentDialog open={openPay} onOpenChange={setOpenPay} />
    </>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <div className="text-sm text-muted-foreground py-6 text-center">{text}</div>;
}