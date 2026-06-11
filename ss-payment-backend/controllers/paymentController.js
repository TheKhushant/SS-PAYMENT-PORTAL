const Payment = require('../models/Payment');
const Student = require('../models/Student');

// Get all payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('studentId', 'name mobile')
      .sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new payment (and update installment status)
exports.createPayment = async (req, res) => {
  try {
    const { studentId, amount, method, transactionId, notes } = req.body;

    // Create payment record
    const payment = await Payment.create({
      studentId,
      amount,
      method,
      transactionId,
      notes
    });

    // Find student and update installments
    const student = await Student.findById(studentId);
    if (student) {
      let remaining = amount;

      for (let installment of student.installments) {
        if (remaining <= 0) break;
        if (installment.status === 'paid') continue;

        if (installment.amount <= remaining) {
          installment.status = 'paid';
          installment.paidDate = new Date();
          remaining -= installment.amount;
        } else {
          // Partial payment
          installment.amount -= remaining; // reduce remaining amount
          remaining = 0;
        }
      }
      await student.save();
    }

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get payments by student
exports.getStudentPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ studentId: req.params.studentId })
      .sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};