const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
  amount: Number,
  dueDate: Date,
  status: { type: String, enum: ['upcoming', 'overdue', 'paid'], default: 'upcoming' },
  paidDate: Date
});

const noteSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: String,
  college: String,
  admissionDate: Date,
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  durationMonths: Number,
  courseFee: Number,
  discount: { type: Number, default: 0 },
  scholarship: { type: Number, default: 0 },
  installments: [installmentSchema],
  notes: [noteSchema],
  status: { type: String, enum: ['active', 'completed', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);