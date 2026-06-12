const Student = require('../models/Student');
const Course = require('../models/Course');

// Get all students
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('courseId', 'name');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single student
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params._id).populate('courseId', 'name');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new student
exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params._id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params._id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add note to student
exports.addNote = async (req, res) => {
  try {
    const { text } = req.body;
    const student = await Student.findById(req.params._id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    student.notes.push({ text });
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};