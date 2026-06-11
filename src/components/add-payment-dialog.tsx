import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useData, studentTotals } from "@/lib/store";
import type { PaymentMethod } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  studentId?: string;
}

export function AddPaymentDialog({ open, onOpenChange, studentId }: Props) {
  const { students, addPayment } = useData();
  const [sid, setSid] = useState(studentId ?? "");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [txn, setTxn] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // Reset form when dialog opens with new studentId
  useEffect(() => {
    if (open) {
      setSid(studentId ?? "");
      setAmount("");
      setTxn("");
      setNotes("");
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [open, studentId]);

  const effectiveSid = studentId ?? sid;
  const student = students.find((s) => s.id === effectiveSid);

  const submit = () => {
    if (!effectiveSid) return toast.error("Select a student");
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");

    addPayment({
      studentId: effectiveSid,
      amount: amt,
      method,
      date: new Date(date).toISOString(),
      transactionId: txn || undefined,
      notes: notes || undefined,
    });

    toast.success("Payment recorded");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            {student
              ? `Remaining: ₹${studentTotals(student).remaining.toLocaleString("en-IN")}`
              : "Add a new payment for a student"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!studentId && (
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={sid} onValueChange={setSid}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} · {s.mobile}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transaction ID</Label>
              <Input
                value={txn}
                onChange={(e) => setTxn(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Save Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}