import { useMemo, useState } from "react";
import { useData, inr } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddPaymentDialog } from "@/components/add-payment-dialog";
import { Search, IndianRupee, FileDown } from "lucide-react";
import { downloadCSV } from "@/lib/csv";

export default function PaymentsPage() {
  const { payments, students } = useData();
  const [q, setQ] = useState("");
  const [method, setMethod] = useState("all");
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return [...payments]
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
      .map((p) => ({ ...p, student: students.find((s) => s.id === p.studentId) }))
      .filter((p) => {
        if (method !== "all" && p.method !== method) return false;
        if (ql && !`${p.student?.name ?? ""} ${p.transactionId ?? ""}`.toLowerCase().includes(ql)) return false;
        return true;
      });
  }, [payments, students, q, method]);

  const total = rows.reduce((a, p) => a + p.amount, 0);

  return (
    <>
      <PageHeader
        title="Payments"
        description={`${rows.length} payments · ${inr(total)} total`}
        actions={
          <>
            <Button 
              variant="outline" 
              onClick={() => downloadCSV("payments.csv", rows.map((p) => ({
                Date: new Date(p.date).toLocaleDateString("en-IN"),
                Student: p.student?.name ?? "",
                Mobile: p.student?.mobile ?? "",
                Amount: p.amount,
                Method: p.method,
                TransactionID: p.transactionId ?? "",
                Notes: p.notes ?? "",
              })))}
            >
              <FileDown className="mr-2 size-4" /> Export CSV
            </Button>
            <Button onClick={() => setOpen(true)}>
              <IndianRupee className="mr-2 size-4" /> Add Payment
            </Button>
          </>
        }
      />

      <Card className="shadow-soft mb-4">
        <CardContent className="p-4 grid sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              className="pl-9" 
              placeholder="Search by student or transaction…" 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
            />
          </div>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">No payments found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Txn ID</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{new Date(p.date).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell className="font-medium">{p.student?.name ?? "—"}</TableCell>
                    <TableCell className="font-semibold text-success">{inr(p.amount)}</TableCell>
                    <TableCell>{p.method}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{p.transactionId ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{p.notes ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddPaymentDialog open={open} onOpenChange={setOpen} />
    </>
  );
}