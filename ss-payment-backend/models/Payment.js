const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer'], required: true },
  transactionId: String,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);