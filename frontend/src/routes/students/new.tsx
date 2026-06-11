import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/lib/store";
import type { DurationMonths, Installment } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function NewStudent() {
  const { courses, addStudent } = useData();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().slice(0, 10));
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [duration, setDuration] = useState<DurationMonths>(3);
  const [fee, setFee] = useState<number>(courses[0]?.pricing[3] ?? 0);
  const [discount, setDiscount] = useState(0);
  const [scholarship, setScholarship] = useState(0);
  const [installments, setInstallments] = useState<Omit<Installment, "status">[]>([
    { id: "i-1", amount: 0, dueDate: new Date().toISOString().slice(0, 10) },
  ]);

  const selectedCourse = courses.find((c) => c.id === courseId);
  const finalFee = Math.max(fee - discount - scholarship, 0);
  const planned = installments.reduce((a, i) => a + Number(i.amount || 0), 0);
  const remaining = finalFee - planned;

  const onCourseChange = (id: string) => {
    setCourseId(id);
    const c = courses.find((x) => x.id === id);
    if (c) setFee(c.pricing[duration] ?? 0);
  };

  const onDurationChange = (d: string) => {
    const dn = Number(d) as DurationMonths;
    setDuration(dn);
    if (selectedCourse) setFee(selectedCourse.pricing[dn] ?? 0);
  };

  const updateInstallment = (idx: number, patch: Partial<Omit<Installment, "status">>) =>
    setInstallments((arr) => arr.map((i, k) => (k === idx ? { ...i, ...patch } : i)));

  const addInstallment = () =>
    setInstallments((arr) => [...arr, { 
      id: `i-${arr.length + 1}-${Math.random().toString(36).slice(2, 5)}`, 
      amount: 0, 
      dueDate: new Date().toISOString().slice(0, 10) 
    }]);

  const removeInstallment = (idx: number) =>
    setInstallments((arr) => arr.filter((_, k) => k !== idx));

  const splitEvenly = () => {
    if (!installments.length) return;
    const per = Math.floor(finalFee / installments.length);
    const rem = finalFee - per * installments.length;
    setInstallments((arr) => arr.map((i, k) => ({ ...i, amount: per + (k === arr.length - 1 ? rem : 0) })));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || !courseId) return toast.error("Fill required fields");
    if (planned !== finalFee) return toast.error("Installments must equal final fee");

    const now = Date.now();
    const ins: Installment[] = installments.map((i) => {
      const due = new Date(i.dueDate).getTime();
      return { 
        ...i, 
        amount: Number(i.amount), 
        dueDate: new Date(i.dueDate).toISOString(), 
        status: due < now - 86400000 ? "overdue" : "upcoming" 
      };
    });

    const s = addStudent({
      name, mobile, email, college,
      admissionDate: new Date(admissionDate).toISOString(),
      courseId, 
      durationMonths: duration,
      courseFee: fee, 
      discount, 
      scholarship,
      installments: ins,
    });

    toast.success("Student created");
    navigate(`/students/${s.id}`);
  };

  return (
    <form onSubmit={submit}>
      <PageHeader
        title="New Student"
        description="Register a student and plan their fee installments."
        actions={
          <>
            <Button type="button" variant="outline" onClick={() => navigate("/students")}>
              <ArrowLeft className="mr-2 size-4" /> Back
            </Button>
            <Button type="submit">Create Student</Button>
          </>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-soft">
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <Field label="Student Name *">
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </Field>
              <Field label="Mobile Number *">
                <Input value={mobile} onChange={(e) => setMobile(e.target.value)} required />
              </Field>
              <Field label="Email">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field label="College Name">
                <Input value={college} onChange={(e) => setCollege(e.target.value)} />
              </Field>
              <Field label="Admission Date">
                <Input type="date" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} />
              </Field>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader><CardTitle>Course & Fee</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <Field label="Course">
                <Select value={courseId} onValueChange={onCourseChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Internship Duration">
                <Select value={String(duration)} onValueChange={onDurationChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 6].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} Month{n > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Course Fee (editable)">
                <Input type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))} />
              </Field>
              <Field label="Discount">
                <Input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
              </Field>
              <Field label="Scholarship">
                <Input type="number" value={scholarship} onChange={(e) => setScholarship(Number(e.target.value))} />
              </Field>
              <div className="rounded-lg bg-primary-soft text-primary p-3 flex items-center justify-between">
                <span className="text-sm font-medium">Final Fee</span>
                <span className="text-xl font-semibold">₹{finalFee.toLocaleString("en-IN")}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Installment Plan</CardTitle>
                <CardDescription>Add as many installments as you need.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={splitEvenly}>Split evenly</Button>
                <Button type="button" size="sm" onClick={addInstallment}><Plus /> Add</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {installments.map((i, idx) => (
                <div key={i.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-2 text-sm text-muted-foreground pb-2">#{idx + 1}</div>
                  <div className="col-span-5">
                    <Label className="text-xs mb-1.5 block">Amount</Label>
                    <Input 
                      type="number" 
                      value={i.amount} 
                      onChange={(e) => updateInstallment(idx, { amount: Number(e.target.value) })} 
                    />
                  </div>
                  <div className="col-span-4">
                    <Label className="text-xs mb-1.5 block">Due Date</Label>
                    <Input 
                      type="date" 
                      value={i.dueDate.slice(0, 10)} 
                      onChange={(e) => updateInstallment(idx, { dueDate: e.target.value })} 
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeInstallment(idx)} 
                      disabled={installments.length === 1}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-soft sticky top-20">
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Course Fee" value={`₹${fee.toLocaleString("en-IN")}`} />
              <Row label="Discount" value={`− ₹${discount.toLocaleString("en-IN")}`} />
              <Row label="Scholarship" value={`− ₹${scholarship.toLocaleString("en-IN")}`} />
              <hr />
              <Row label="Final Fee" value={`₹${finalFee.toLocaleString("en-IN")}`} bold />
              <Row label="Planned" value={`₹${planned.toLocaleString("en-IN")}`} />
              <Row
                label="Remaining"
                value={`₹${remaining.toLocaleString("en-IN")}`}
                tone={remaining === 0 ? "success" : remaining > 0 ? "warning" : "danger"}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Row({ 
  label, 
  value, 
  bold, 
  tone 
}: { 
  label: string; 
  value: string; 
  bold?: boolean; 
  tone?: "success" | "warning" | "danger" 
}) {
  const toneClass = 
    tone === "success" ? "text-success" : 
    tone === "warning" ? "text-warning" : 
    tone === "danger" ? "text-destructive" : "";

  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? "font-semibold" : ""} ${toneClass}`}>{value}</span>
    </div>
  );
}