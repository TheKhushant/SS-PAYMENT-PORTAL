import { useMemo } from "react";
import { studentTotals, useData, inr } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, 
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, Wallet, IndianRupee, PieChart as PieIcon, Percent } from "lucide-react";

const COLORS = ["oklch(0.52 0.21 265)", "oklch(0.62 0.16 155)", "oklch(0.72 0.16 55)", "oklch(0.6 0.22 25)", "oklch(0.6 0.18 300)"];

export default function AnalyticsPage() {
  const { payments, students, courses } = useData();

  const stats = useMemo(() => {
    const now = new Date();
    const dayMs = 86400000;
    let daily = 0, weekly = 0, monthly = 0, yearly = 0;

    payments.forEach((p) => {
      const d = new Date(p.date);
      const diff = (now.getTime() - d.getTime()) / dayMs;
      if (diff < 1) daily += p.amount;
      if (diff < 7) weekly += p.amount;
      if (diff < 30) monthly += p.amount;
      if (diff < 365) yearly += p.amount;
    });

    const total = payments.reduce((a, p) => a + p.amount, 0);
    let expected = 0, pending = 0;

    students.forEach((s) => {
      const t = studentTotals(s);
      expected += t.finalFee;
      pending += t.remaining;
    });

    const collectionRate = expected > 0 ? Math.round(((expected - pending) / expected) * 100) : 0;
    const avg = students.length > 0 ? total / students.length : 0;

    const months: { label: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("en-IN", { month: "short" });
      const revenue = payments
        .filter((p) => {
          const pd = new Date(p.date);
          return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth();
        })
        .reduce((a, p) => a + p.amount, 0);
      months.push({ label, revenue });
    }

    const courseRev = courses.map((c) => {
      const studentIds = students.filter((s) => s.courseId === c.id).map((s) => s.id);
      const rev = payments.filter((p) => studentIds.includes(p.studentId)).reduce((a, p) => a + p.amount, 0);
      return { name: c.name, revenue: rev };
    });

    const pendingBreakdown = courses.map((c) => {
      const rel = students.filter((s) => s.courseId === c.id);
      const p = rel.reduce((a, s) => a + studentTotals(s).remaining, 0);
      return { name: c.name, value: p };
    }).filter((x) => x.value > 0);

    return { daily, weekly, monthly, yearly, total, expected, pending, collectionRate, avg, months, courseRev, pendingBreakdown };
  }, [payments, students, courses]);

  // Safe Recharts Tooltip Formatter
  const currencyFormatter = (value: any): [string, string] => {
    if (value == null) return ["₹0", ""];
    return [inr(Number(value)), "Revenue"];
  };

  return (
    <>
      <PageHeader title="Revenue Analytics" description="Monitor revenue, collections and trends." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Daily Revenue" value={inr(stats.daily)} icon={Wallet} tone="success" />
        <KpiCard label="Weekly Revenue" value={inr(stats.weekly)} icon={TrendingUp} tone="primary" />
        <KpiCard label="Monthly Revenue" value={inr(stats.monthly)} icon={TrendingUp} tone="primary" />
        <KpiCard label="Yearly Revenue" value={inr(stats.yearly)} icon={TrendingUp} tone="primary" />
        <KpiCard label="Total Collected" value={inr(stats.total)} icon={IndianRupee} tone="success" />
        <KpiCard label="Pending Revenue" value={inr(stats.pending)} icon={IndianRupee} tone="warning" />
        <KpiCard label="Collection Rate" value={`${stats.collectionRate}%`} icon={Percent} tone="primary" />
        <KpiCard label="Avg / Student" value={inr(stats.avg)} icon={PieIcon} tone="neutral" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader><CardTitle>Revenue Trend (last 6 months)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.months}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
                <XAxis dataKey="label" stroke="oklch(0.5 0.03 260)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 260)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={currencyFormatter} />
                <Line type="monotone" dataKey="revenue" stroke="oklch(0.52 0.21 265)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle>Monthly Collection</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.months}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
                <XAxis dataKey="label" stroke="oklch(0.5 0.03 260)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 260)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={currencyFormatter} />
                <Bar dataKey="revenue" fill="oklch(0.62 0.16 155)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle>Course Revenue</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.courseRev} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
                <XAxis type="number" stroke="oklch(0.5 0.03 260)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                <YAxis dataKey="name" type="category" stroke="oklch(0.5 0.03 260)" fontSize={12} width={120} />
                <Tooltip formatter={currencyFormatter} />
                <Bar dataKey="revenue" fill="oklch(0.52 0.21 265)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle>Pending Revenue by Course</CardTitle></CardHeader>
          <CardContent className="h-72">
            {stats.pendingBreakdown.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">No pending revenue.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={stats.pendingBreakdown} 
                    dataKey="value" 
                    nameKey="name" 
                    innerRadius={50} 
                    outerRadius={90} 
                    paddingAngle={2}
                  >
                    {stats.pendingBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip formatter={currencyFormatter} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}