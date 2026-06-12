export type DurationMonths = 1 | 2 | 3 | 6;

// export interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   durations: DurationMonths[];
//   pricing: Record<DurationMonths, number>; // partial fine, but typed full
// }

export type Course = {
  _id: string;
  name: string;
  description?: string;
  pricing?: Partial<Record<DurationMonths, number>>;
  durations: DurationMonths[];
  createdAt?: string;
  updatedAt?: string;
};

export type CoursePayload = {
  name: string;
  description?: string;
  pricing?: Partial<Record<DurationMonths, number>>;
  durations: DurationMonths[];
};

export type InstallmentStatus = "paid" | "upcoming" | "overdue";

export interface Installment {
  id: string;
  amount: number;
  dueDate: string; // ISO
  status: InstallmentStatus;
  paidDate?: string;
  paymentId?: string;
}

export type PaymentMethod = "Cash" | "UPI" | "Bank Transfer";

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  transactionId?: string;
  notes?: string;
  installmentId?: string;
}

export interface PaymentRequest {
  id: string;
  studentId: string;
  amount: number;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  screenshotUrl?: string;
  notes?: string;
}

export type StudentStatus = "active" | "completed" | "inactive";

export interface StudentNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  mobile: string;
  email: string;
  college: string;
  admissionDate: string;
  courseId: string;
  durationMonths: DurationMonths;
  courseFee: number;
  discount: number;
  scholarship: number;
  installments: Installment[];
  status: StudentStatus;
  notes: StudentNote[];
}

export interface ActivityLog {
  id: string;
  type: "student" | "payment" | "course" | "installment";
  message: string;
  at: string;
}
