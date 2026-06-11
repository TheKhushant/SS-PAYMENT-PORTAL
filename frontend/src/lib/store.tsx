import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  ActivityLog,
  Course,
  DurationMonths,
  // Installment,
  Payment,
  PaymentRequest,
  Student,
  // StudentNote,
} from "./types";
// import {
//   seedActivity,
//   seedCourses,
//   seedPayments,
//   seedRequests,
//   seedStudents,
// } from "./mock-data";
import api from './api';

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
  addStudent: (
  s: Omit<Student, "id" | "notes" | "status">
) => Promise<Student>;
  updateStudent: (id: string, patch: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addPayment: (p: Omit<Payment, "id">) => Promise<Payment>;
  addNote: (studentId: string, text: string) => Promise<void>;
  updateCourse: (id: string, patch: Partial<Course>) => Promise<void>;
  addCourse: (c: Omit<Course, "id">) => Promise<Course>;
  // approveRequest: (id: string, method?: Payment["method"]) => void;
  // rejectRequest: (id: string) => void;
  // deleteCourse: (id: string) => void;
  approveRequest: (id: string, method?: Payment["method"]) => void;
  rejectRequest: (id: string) => void;
  deleteCourse: (id: string) => void;
}

const DataContext = createContext<DataCtx | null>(null);

// const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

// function recomputeInstallments(installments: Installment[]): Installment[] {
//   const now = Date.now();
//   return installments.map((i) => {
//     if (i.status === "paid") return i;
//     const due = new Date(i.dueDate).getTime();
//     return { ...i, status: due < now - 24 * 3600 * 1000 ? "overdue" : "upcoming" };
//   });
// }

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [activity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [sRes, cRes, pRes, rRes] = await Promise.all([
          api.get('/students'),
          api.get('/courses'),
          api.get('/payments'),
          api.get('/requests') // if you have this route
        ]);
        setStudents(sRes.data);
        setCourses(cRes.data);
        setPayments(pRes.data);
        setRequests(rRes.data || []);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const addStudent = async (data: any) => {
    const res = await api.post('/students', data);
    setStudents(prev => [res.data, ...prev]);
    return res.data;
  };

  const updateStudent = async (id: string, patch: any) => {
    const res = await api.put(`/students/${id}`, patch);
    setStudents(prev => prev.map(s => s.id === id ? res.data : s));
  };

  const deleteStudent = async (id: string) => {
    await api.delete(`/students/${id}`);
    setStudents(prev => prev.filter(s => s.id !== id));
    setPayments(prev => prev.filter(p => p.studentId !== id));
  };

  const addPayment = async (data: any) => {
    const res = await api.post('/payments', data);
    setPayments(prev => [res.data, ...prev]);
    // Refresh student to update installments
    const studentRes = await api.get(`/students/${data.studentId}`);
    setStudents(prev => prev.map(s => s.id === data.studentId ? studentRes.data : s));
    return res.data;
  };

  const addNote = async (studentId: string, text: string) => {
    const res = await api.post(`/students/${studentId}/notes`, { text });
    setStudents(prev => prev.map(s => s.id === studentId ? res.data : s));
  };

  const updateCourse = async (id: string, patch: any) => {
    const res = await api.put(`/courses/${id}`, patch);
    setCourses(prev => prev.map(c => c.id === id ? res.data : c));
  };

  const approveRequest = async (id: string) => {
    console.log("Approve request", id);
  };

  const rejectRequest = async (id: string) => {
    console.log("Reject request", id);
  };

  const deleteCourse = async (id: string) => {
    await api.delete(`/courses/${id}`);
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const addCourse = async (data: any) => {
    const res = await api.post('/courses', data);
    setCourses(prev => [...prev, res.data]);
    return res.data;
  };

  const value = useMemo<DataCtx>(() => ({
  students,
  courses,
  payments,
  requests,
  activity,

  addStudent,
  updateStudent,
  deleteStudent,
  addPayment,

  approveRequest,
  rejectRequest,

  addNote,
  updateCourse,
  addCourse,
  deleteCourse,
}), [
  students,
  courses,
  payments,
  requests,
  activity,
]);

  if (loading) return <div className="p-8 text-center">Loading data...</div>;

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// export function DataProvider({ children }: { children: ReactNode }) {
//   const [students, setStudents] = useState<Student[]>(() =>
//     seedStudents.map((s) => ({ ...s, installments: recomputeInstallments(s.installments) })),
//   );
//   const [courses, setCourses] = useState<Course[]>(seedCourses);
//   const [payments, setPayments] = useState<Payment[]>(seedPayments);
//   const [requests, setRequests] = useState<PaymentRequest[]>(seedRequests);
//   const [activity, setActivity] = useState<ActivityLog[]>(seedActivity);

//   const log = (entry: Omit<ActivityLog, "id" | "at">) =>
//     setActivity((a) => [{ ...entry, id: uid("a"), at: new Date().toISOString() }, ...a].slice(0, 200));

//   const addStudent: DataCtx["addStudent"] = (s) => {
//     const student: Student = {
//       ...s,
//       id: uid("s"),
//       notes: [],
//       status: s.status ?? "active",
//       installments: recomputeInstallments(s.installments),
//     };
//     setStudents((arr) => [student, ...arr]);
//     log({ type: "student", message: `New student ${student.name} enrolled` });
//     return student;
//   };

//   const updateStudent: DataCtx["updateStudent"] = (id, patch) => {
//     setStudents((arr) =>
//       arr.map((s) =>
//         s.id === id
//           ? { ...s, ...patch, installments: recomputeInstallments(patch.installments ?? s.installments) }
//           : s,
//       ),
//     );
//   };

//   const deleteStudent: DataCtx["deleteStudent"] = (id) => {
//     const s = students.find((x) => x.id === id);
//     setStudents((arr) => arr.filter((x) => x.id !== id));
//     setPayments((arr) => arr.filter((p) => p.studentId !== id));
//     if (s) log({ type: "student", message: `Removed student ${s.name}` });
//   };

//   const addPayment: DataCtx["addPayment"] = (p) => {
//     const payment: Payment = { ...p, id: uid("p") };
//     setPayments((arr) => [payment, ...arr]);

//     setStudents((arr) =>
//       arr.map((s) => {
//         if (s.id !== p.studentId) return s;
//         let remaining = p.amount;
//         const ins = s.installments.map((i) => {
//           if (i.status === "paid" || remaining <= 0) return i;
//           if (p.installmentId && i.id !== p.installmentId) return i;
//           if (remaining >= i.amount) {
//             remaining -= i.amount;
//             return { ...i, status: "paid" as const, paidDate: p.date, paymentId: payment.id };
//           }
//           return i;
//         });
//         return { ...s, installments: recomputeInstallments(ins) };
//       }),
//     );

//     const student = students.find((x) => x.id === p.studentId);
//     log({ type: "payment", message: `Payment of ₹${p.amount.toLocaleString("en-IN")} received${student ? ` from ${student.name}` : ""}` });
//     return payment;
//   };

//   const approveRequest: DataCtx["approveRequest"] = (id, method = "UPI") => {
//     const req = requests.find((r) => r.id === id);
//     if (!req) return;
//     setRequests((arr) => arr.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));
//     addPayment({
//       studentId: req.studentId,
//       amount: req.amount,
//       date: new Date().toISOString(),
//       method,
//       notes: req.notes,
//     });
//   };

//   const rejectRequest: DataCtx["rejectRequest"] = (id) => {
//     setRequests((arr) => arr.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));
//   };

//   const addNote: DataCtx["addNote"] = (studentId, text) => {
//     const note: StudentNote = { id: uid("n"), text, createdAt: new Date().toISOString() };
//     setStudents((arr) =>
//       arr.map((s) => (s.id === studentId ? { ...s, notes: [note, ...s.notes] } : s)),
//     );
//   };

//   const updateCourse: DataCtx["updateCourse"] = (id, patch) => {
//     setCourses((arr) => arr.map((c) => (c.id === id ? { ...c, ...patch } : c)));
//     log({ type: "course", message: `Course updated` });
//   };

//   const addCourse: DataCtx["addCourse"] = (c) => {
//     const course: Course = { ...c, id: uid("c") };
//     setCourses((arr) => [...arr, course]);
//     log({ type: "course", message: `New course ${course.name} added` });
//     return course;
//   };

//   const deleteCourse: DataCtx["deleteCourse"] = (id) => {
//     setCourses((arr) => arr.filter((c) => c.id !== id));
//   };

//   const value = useMemo<DataCtx>(
//     () => ({
//       students, courses, payments, requests, activity,
//       addStudent, updateStudent, deleteStudent, addPayment,
//       approveRequest, rejectRequest, addNote,
//       updateCourse, addCourse, deleteCourse,
//     }),
//     [students, courses, payments, requests, activity],
//   );

//   return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
// }

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