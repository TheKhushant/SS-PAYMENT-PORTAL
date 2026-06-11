import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { studentTotals, useData, inr } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Plus, MoreHorizontal, Eye, Trash2, IndianRupee, Filter } from "lucide-react";
import { AddPaymentDialog } from "@/components/add-payment-dialog";
import { toast } from "sonner";

export default function StudentsList() {
  const { students, courses, deleteStudent } = useData();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [courseId, setCourseId] = useState("all");
  const [duration, setDuration] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [payDialog, setPayDialog] = useState<{ open: boolean; id?: string }>({ open: false });

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return students
      .filter((s) => {
        if (ql && !`${s.name} ${s.mobile} ${s.college} ${courses.find((c) => c.id === s.courseId)?.name ?? ""}`.toLowerCase().includes(ql)) return false;
        if (courseId !== "all" && s.courseId !== courseId) return false;
        if (duration !== "all" && String(s.durationMonths) !== duration) return false;
        if (statusF !== "all" && s.status !== statusF) return false;
        return true;
      })
      .map((s) => ({ ...s, totals: studentTotals(s), course: courses.find((c) => c.id === s.courseId) }));
  }, [students, courses, q, courseId, duration, statusF]);

  return (
    <>
      <PageHeader
        title="Students"
        description={`${students.length} total students`}
        actions={<Button onClick={() => navigate("/students/new")}><Plus /> New Student</Button>}
      />

      <Card className="shadow-soft mb-4">
        <CardContent className="p-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, mobile, college, course…" 
              className="pl-9" 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
            />
          </div>
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger><Filter className="size-4" /><SelectValue placeholder="Course" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courses</SelectItem>
              {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger><SelectValue placeholder="Duration" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any duration</SelectItem>
              <SelectItem value="1">1 Month</SelectItem>
              <SelectItem value="2">2 Months</SelectItem>
              <SelectItem value="3">3 Months</SelectItem>
              <SelectItem value="6">6 Months</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusF} onValueChange={setStatusF}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardContent className="p-0 overflow-x-auto">
          {rows.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-muted-foreground text-sm">No students match your filters.</div>
              <Button className="mt-4" variant="outline" onClick={() => { setQ(""); setCourseId("all"); setDuration("all"); setStatusF("all"); }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Total Fee</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((s) => (
                  <TableRow 
                    key={s.id} 
                    className="cursor-pointer" 
                    onClick={() => navigate(`/students/${s.id}`)}
                  >
                    <TableCell>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.mobile} · {s.college}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{s.course?.name}</div>
                      <div className="text-xs text-muted-foreground">{s.durationMonths} month{s.durationMonths > 1 ? "s" : ""}</div>
                    </TableCell>
                    <TableCell>{inr(s.totals.finalFee)}</TableCell>
                    <TableCell className="text-success font-medium">{inr(s.totals.paid)}</TableCell>
                    <TableCell className={s.totals.remaining > 0 ? "text-warning font-medium" : "text-muted-foreground"}>{inr(s.totals.remaining)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.totals.nextDue ? new Date(s.totals.nextDue.dueDate).toLocaleDateString("en-IN") : "—"}
                    </TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/students/${s.id}`}>
                              <Eye className="mr-2 size-4" /> View profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPayDialog({ open: true, id: s.id })}>
                            <IndianRupee className="mr-2 size-4" /> Add payment
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 size-4" /> Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete student?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove {s.name} and all related payment records.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => { deleteStudent(s.id); toast.success("Student deleted"); }} 
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddPaymentDialog 
        open={payDialog.open} 
        onOpenChange={(o) => setPayDialog({ open: o, id: payDialog.id })} 
        studentId={payDialog.id} 
      />
    </>
  );
}