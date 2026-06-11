import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { studentTotals, useData, inr } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, IndianRupee, Mail, Phone, GraduationCap, CalendarDays, Building2 } from "lucide-react";
import { AddPaymentDialog } from "@/components/add-payment-dialog";
import { toast } from "sonner";

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const { students, courses, payments, addNote } = useData();
  const navigate = useNavigate();
  const [openPay, setOpenPay] = useState(false);
  const [note, setNote] = useState("");

  const student = students.find((s) => s.id === id);
  if (!student) {
    return (
      <div className="text-center py-20">
        <div className="text-lg font-medium">Student not found</div>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/students")}>
          Back to students
        </Button>
      </div>
    );
  }

  const course = courses.find((c) => c.id === student.courseId);
  const totals = studentTotals(student);
  const pct = totals.finalFee > 0 ? Math.round((totals.paid / totals.finalFee) * 100) : 0;
  const myPayments = useMemo(
    () => payments.filter((p) => p.studentId === id).sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [payments, id],
  );

  return (
    <>
      <PageHeader
        title={student.name}
        description={`${course?.name} · ${student.durationMonths} months · ${student.college}`}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate("/students")}>
              <ArrowLeft className="mr-2 size-4" /> Back
            </Button>
            <Button onClick={() => setOpenPay(true)}>
              <IndianRupee className="mr-2 size-4" /> Add Payment
            </Button>
          </>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-soft">
            <CardHeader><CardTitle>Financial Summary</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <Metric label="Total Fee" value={inr(totals.finalFee)} />
                <Metric label="Paid" value={inr(totals.paid)} tone="success" />
                <Metric label="Pending" value={inr(totals.remaining)} tone="warning" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Collection progress</span>
                  <span className="font-semibold">{pct}%</span>
                </div>
                <Progress value={pct} />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="installments">
            <TabsList>
              <TabsTrigger value="installments">Installments</TabsTrigger>
              <TabsTrigger value="payments">Payment History</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="installments">
              <Card className="shadow-soft">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Paid On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.installments.map((i, idx) => (
                        <TableRow key={i.id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell className="font-medium">{inr(i.amount)}</TableCell>
                          <TableCell>{new Date(i.dueDate).toLocaleDateString("en-IN")}</TableCell>
                          <TableCell><StatusBadge status={i.status} /></TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {i.paidDate ? new Date(i.paidDate).toLocaleDateString("en-IN") : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card className="shadow-soft">
                <CardContent className="p-0">
                  {myPayments.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">No payments yet.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Txn ID</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myPayments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>{new Date(p.date).toLocaleDateString("en-IN")}</TableCell>
                            <TableCell className="font-medium text-success">{inr(p.amount)}</TableCell>
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
            </TabsContent>

            <TabsContent value="notes">
              <Card className="shadow-soft">
                <CardContent className="p-4 space-y-4">
                  <div className="flex gap-2">
                    <Textarea 
                      value={note} 
                      onChange={(e) => setNote(e.target.value)} 
                      placeholder="Add an internal note…" 
                      rows={2} 
                    />
                    <Button 
                      onClick={() => { 
                        if (note.trim()) { 
                          addNote(student.id, note.trim()); 
                          setNote(""); 
                          toast.success("Note added"); 
                        } 
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  {student.notes.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">No notes yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {student.notes.map((n) => (
                        <div key={n.id} className="rounded-lg border p-3">
                          <div className="text-sm">{n.text}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(n.createdAt).toLocaleString("en-IN")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader><CardTitle>Student Info</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow icon={GraduationCap} label="Course" value={`${course?.name} · ${student.durationMonths}m`} />
              <InfoRow icon={Building2} label="College" value={student.college} />
              <InfoRow icon={Phone} label="Mobile" value={student.mobile} />
              <InfoRow icon={Mail} label="Email" value={student.email || "—"} />
              <InfoRow icon={CalendarDays} label="Admission" value={new Date(student.admissionDate).toLocaleDateString("en-IN")} />
              <div className="pt-2"><StatusBadge status={student.status} /></div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddPaymentDialog open={openPay} onOpenChange={setOpenPay} studentId={student.id} />
    </>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" }) {
  const cls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "";
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold mt-1 ${cls}`}>{value}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="size-4 mt-0.5 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="truncate">{value}</div>
      </div>
    </div>
  );
}