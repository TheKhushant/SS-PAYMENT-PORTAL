import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  ActivityLog,
  Course,
  DurationMonths,
  Installment,
  Payment,
  PaymentRequest,
  Student,
  StudentNote,
} from "./types";
import {
  seedActivity,
  seedCourses,
  seedPayments,
  seedRequests,
  seedStudents,
} from "./mock-data";

interface AuthCtx {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

const AUTH_KEY = "sfm.auth.v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthCtx["user"]>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  const login = (email: string, password: string) => {
    if (email === "admin@institute.com" && password === "admin123") {
      const u = { name: "Admin", email };
      setUser(u);
      try { localStorage.setItem(AUTH_KEY, JSON.stringify(u)); } catch {}
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    try { localStorage.removeItem(AUTH_KEY); } catch {}
  };

  const value: AuthCtx = { isAuthenticated: !!user, user, login, logout };

  if (!hydrated) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// ----- Data store -----

interface DataCtx {
  students: Student[];
  courses: Course[];
  payments: Payment[];
  requests: PaymentRequest[];
  activity: ActivityLog[];
  addStudent: (s: Omit<Student, "id" | "notes" | "status"> & { status?: Student["status"] }) => Student;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  addPayment: (p: Omit<Payment, "id">) => Payment;
  approveRequest: (id: string, method?: Payment["method"]) => void;
  rejectRequest: (id: string) => void;
  addNote: (studentId: string, text: string) => void;
  updateCourse: (id: string, patch: Partial<Course>) => void;
  addCourse: (c: Omit<Course, "id">) => Course;
  deleteCourse: (id: string) => void;
}

const DataContext = createContext<DataCtx | null>(null);

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

function recomputeInstallments(installments: Installment[]): Installment[] {
  const now = Date.now();
  return installments.map((i) => {
    if (i.status === "paid") return i;
    const due = new Date(i.dueDate).getTime();
    return { ...i, status: due < now - 24 * 3600 * 1000 ? "overdue" : "upcoming" };
  });
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(() =>
    seedStudents.map((s) => ({ ...s, installments: recomputeInstallments(s.installments) })),
  );
  const [courses, setCourses] = useState<Course[]>(seedCourses);
  const [payments, setPayments] = useState<Payment[]>(seedPayments);
  const [requests, setRequests] = useState<PaymentRequest[]>(seedRequests);
  const [activity, setActivity] = useState<ActivityLog[]>(seedActivity);

  const log = (entry: Omit<ActivityLog, "id" | "at">) =>
    setActivity((a) => [{ ...entry, id: uid("a"), at: new Date().toISOString() }, ...a].slice(0, 200));

  const addStudent: DataCtx["addStudent"] = (s) => {
    const student: Student = {
      ...s,
      id: uid("s"),
      notes: [],
      status: s.status ?? "active",
      installments: recomputeInstallments(s.installments),
    };
    setStudents((arr) => [student, ...arr]);
    log({ type: "student", message: `New student ${student.name} enrolled` });
    return student;
  };

  const updateStudent: DataCtx["updateStudent"] = (id, patch) => {
    setStudents((arr) =>
      arr.map((s) =>
        s.id === id
          ? { ...s, ...patch, installments: recomputeInstallments(patch.installments ?? s.installments) }
          : s,
      ),
    );
  };

  const deleteStudent: DataCtx["deleteStudent"] = (id) => {
    const s = students.find((x) => x.id === id);
    setStudents((arr) => arr.filter((x) => x.id !== id));
    setPayments((arr) => arr.filter((p) => p.studentId !== id));
    if (s) log({ type: "student", message: `Removed student ${s.name}` });
  };

  const addPayment: DataCtx["addPayment"] = (p) => {
    const payment: Payment = { ...p, id: uid("p") };
    setPayments((arr) => [payment, ...arr]);

    setStudents((arr) =>
      arr.map((s) => {
        if (s.id !== p.studentId) return s;
        let remaining = p.amount;
        const ins = s.installments.map((i) => {
          if (i.status === "paid" || remaining <= 0) return i;
          if (p.installmentId && i.id !== p.installmentId) return i;
          if (remaining >= i.amount) {
            remaining -= i.amount;
            return { ...i, status: "paid" as const, paidDate: p.date, paymentId: payment.id };
          }
          return i;
        });
        return { ...s, installments: recomputeInstallments(ins) };
      }),
    );

    const student = students.find((x) => x.id === p.studentId);
    log({ type: "payment", message: `Payment of ₹${p.amount.toLocaleString("en-IN")} received${student ? ` from ${student.name}` : ""}` });
    return payment;
  };

  const approveRequest: DataCtx["approveRequest"] = (id, method = "UPI") => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    setRequests((arr) => arr.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));
    addPayment({
      studentId: req.studentId,
      amount: req.amount,
      date: new Date().toISOString(),
      method,
      notes: req.notes,
    });
  };

  const rejectRequest: DataCtx["rejectRequest"] = (id) => {
    setRequests((arr) => arr.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));
  };

  const addNote: DataCtx["addNote"] = (studentId, text) => {
    const note: StudentNote = { id: uid("n"), text, createdAt: new Date().toISOString() };
    setStudents((arr) =>
      arr.map((s) => (s.id === studentId ? { ...s, notes: [note, ...s.notes] } : s)),
    );
  };

  const updateCourse: DataCtx["updateCourse"] = (id, patch) => {
    setCourses((arr) => arr.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    log({ type: "course", message: `Course updated` });
  };

  const addCourse: DataCtx["addCourse"] = (c) => {
    const course: Course = { ...c, id: uid("c") };
    setCourses((arr) => [...arr, course]);
    log({ type: "course", message: `New course ${course.name} added` });
    return course;
  };

  const deleteCourse: DataCtx["deleteCourse"] = (id) => {
    setCourses((arr) => arr.filter((c) => c.id !== id));
  };

  const value = useMemo<DataCtx>(
    () => ({
      students, courses, payments, requests, activity,
      addStudent, updateStudent, deleteStudent, addPayment,
      approveRequest, rejectRequest, addNote,
      updateCourse, addCourse, deleteCourse,
    }),
    [students, courses, payments, requests, activity],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

// ----- Selectors / helpers -----

export function studentTotals(s: Student) {
  const finalFee = s.courseFee - s.discount - s.scholarship;
  const paid = s.installments.filter((i) => i.status === "paid").reduce((a, i) => a + i.amount, 0);
  const planned = s.installments.reduce((a, i) => a + i.amount, 0);
  const remaining = Math.max(finalFee - paid, 0);
  const nextDue = s.installments
    .filter((i) => i.status !== "paid")
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))[0];
  return { finalFee, paid, planned, remaining, nextDue };
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export const inr = (n: number) =>
  `₹${Math.round(n).toLocaleString("en-IN")}`;

export type { DurationMonths };