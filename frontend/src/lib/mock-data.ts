import type { Course, Student, Payment, PaymentRequest, ActivityLog } from "./types";

const today = new Date();
const daysFromNow = (d: number) => {
  const x = new Date(today);
  x.setDate(x.getDate() + d);
  return x.toISOString();
};

export const seedCourses: Course[] = [
  {
    id: "c-mern",
    name: "MERN Stack",
    description: "Full-stack web development with MongoDB, Express, React, Node.",
    durations: [1, 2, 3, 6],
    pricing: { 1: 5000, 2: 8000, 3: 12000, 6: 20000 },
  },
  {
    id: "c-python",
    name: "Python & Data Science",
    description: "Python, Pandas, NumPy, ML fundamentals.",
    durations: [1, 2, 3, 6],
    pricing: { 1: 4500, 2: 7500, 3: 11000, 6: 18000 },
  },
  {
    id: "c-java",
    name: "Java Full Stack",
    description: "Core Java, Spring Boot, REST APIs.",
    durations: [1, 2, 3, 6],
    pricing: { 1: 5500, 2: 8500, 3: 12500, 6: 21000 },
  },
  {
    id: "c-ui",
    name: "UI/UX Design",
    description: "Figma, design systems, user research.",
    durations: [1, 2, 3, 6],
    pricing: { 1: 4000, 2: 7000, 3: 10000, 6: 16000 },
  },
];

export const seedStudents: Student[] = [
  {
    id: "s-001",
    name: "Aarav Sharma",
    mobile: "9876543210",
    email: "aarav.sharma@example.com",
    college: "Delhi Technical University",
    admissionDate: daysFromNow(-45),
    courseId: "c-mern",
    durationMonths: 3,
    courseFee: 12000,
    discount: 0,
    scholarship: 1000,
    status: "active",
    notes: [],
    installments: [
      { id: "i1", amount: 4000, dueDate: daysFromNow(-30), status: "paid", paidDate: daysFromNow(-30), paymentId: "p1" },
      { id: "i2", amount: 4000, dueDate: daysFromNow(-2), status: "overdue" },
      { id: "i3", amount: 3000, dueDate: daysFromNow(20), status: "upcoming" },
    ],
  },
  {
    id: "s-002",
    name: "Priya Patel",
    mobile: "9123456780",
    email: "priya.patel@example.com",
    college: "Mumbai Institute of Tech",
    admissionDate: daysFromNow(-60),
    courseId: "c-python",
    durationMonths: 6,
    courseFee: 18000,
    discount: 1000,
    scholarship: 0,
    status: "active",
    notes: [],
    installments: [
      { id: "i1", amount: 6000, dueDate: daysFromNow(-50), status: "paid", paidDate: daysFromNow(-50), paymentId: "p2" },
      { id: "i2", amount: 6000, dueDate: daysFromNow(-20), status: "paid", paidDate: daysFromNow(-19), paymentId: "p3" },
      { id: "i3", amount: 5000, dueDate: daysFromNow(3), status: "upcoming" },
    ],
  },
  {
    id: "s-003",
    name: "Rohan Verma",
    mobile: "9988776655",
    email: "rohan.v@example.com",
    college: "BITS Pilani",
    admissionDate: daysFromNow(-10),
    courseId: "c-java",
    durationMonths: 2,
    courseFee: 8500,
    discount: 0,
    scholarship: 0,
    status: "active",
    notes: [],
    installments: [
      { id: "i1", amount: 4500, dueDate: daysFromNow(0), status: "upcoming" },
      { id: "i2", amount: 4000, dueDate: daysFromNow(30), status: "upcoming" },
    ],
  },
  {
    id: "s-004",
    name: "Sneha Iyer",
    mobile: "9011223344",
    email: "sneha.iyer@example.com",
    college: "VIT Vellore",
    admissionDate: daysFromNow(-90),
    courseId: "c-ui",
    durationMonths: 3,
    courseFee: 10000,
    discount: 500,
    scholarship: 500,
    status: "active",
    notes: [],
    installments: [
      { id: "i1", amount: 3000, dueDate: daysFromNow(-80), status: "paid", paidDate: daysFromNow(-80), paymentId: "p4" },
      { id: "i2", amount: 3000, dueDate: daysFromNow(-50), status: "paid", paidDate: daysFromNow(-49), paymentId: "p5" },
      { id: "i3", amount: 3000, dueDate: daysFromNow(-15), status: "overdue" },
    ],
  },
  {
    id: "s-005",
    name: "Karan Mehta",
    mobile: "9876501234",
    email: "karan.m@example.com",
    college: "IIT Bombay",
    admissionDate: daysFromNow(-5),
    courseId: "c-mern",
    durationMonths: 6,
    courseFee: 20000,
    discount: 2000,
    scholarship: 0,
    status: "active",
    notes: [],
    installments: [
      { id: "i1", amount: 9000, dueDate: daysFromNow(5), status: "upcoming" },
      { id: "i2", amount: 9000, dueDate: daysFromNow(60), status: "upcoming" },
    ],
  },
  {
    id: "s-006",
    name: "Anjali Singh",
    mobile: "9090909090",
    email: "anjali.s@example.com",
    college: "NIT Trichy",
    admissionDate: daysFromNow(-120),
    courseId: "c-python",
    durationMonths: 3,
    courseFee: 11000,
    discount: 0,
    scholarship: 0,
    status: "completed",
    notes: [],
    installments: [
      { id: "i1", amount: 5500, dueDate: daysFromNow(-110), status: "paid", paidDate: daysFromNow(-110), paymentId: "p6" },
      { id: "i2", amount: 5500, dueDate: daysFromNow(-80), status: "paid", paidDate: daysFromNow(-80), paymentId: "p7" },
    ],
  },
];

export const seedPayments: Payment[] = [
  { id: "p1", studentId: "s-001", amount: 4000, date: daysFromNow(-30), method: "UPI", transactionId: "UPI78912", installmentId: "i1" },
  { id: "p2", studentId: "s-002", amount: 6000, date: daysFromNow(-50), method: "Bank Transfer", transactionId: "BT55121", installmentId: "i1" },
  { id: "p3", studentId: "s-002", amount: 6000, date: daysFromNow(-19), method: "UPI", transactionId: "UPI66311", installmentId: "i2" },
  { id: "p4", studentId: "s-004", amount: 3000, date: daysFromNow(-80), method: "Cash", installmentId: "i1" },
  { id: "p5", studentId: "s-004", amount: 3000, date: daysFromNow(-49), method: "UPI", transactionId: "UPI99231", installmentId: "i2" },
  { id: "p6", studentId: "s-006", amount: 5500, date: daysFromNow(-110), method: "Bank Transfer", transactionId: "BT11023", installmentId: "i1" },
  { id: "p7", studentId: "s-006", amount: 5500, date: daysFromNow(-80), method: "UPI", transactionId: "UPI22988", installmentId: "i2" },
];

export const seedRequests: PaymentRequest[] = [
  { id: "pr-1", studentId: "s-003", amount: 4500, submittedAt: daysFromNow(-1), status: "pending", notes: "Paid via PhonePe" },
  { id: "pr-2", studentId: "s-005", amount: 9000, submittedAt: daysFromNow(0), status: "pending", notes: "GPay transaction" },
];

export const seedActivity: ActivityLog[] = [
  { id: "a1", type: "student", message: "New student Karan Mehta enrolled in MERN Stack", at: daysFromNow(-5) },
  { id: "a2", type: "payment", message: "Payment of ₹6,000 received from Priya Patel", at: daysFromNow(-19) },
  { id: "a3", type: "course", message: "Course pricing updated for Python & Data Science", at: daysFromNow(-7) },
];
