const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');

const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  addNote
} = require('../controllers/studentController');

// All routes are protected (require login)
router.get('/', protect, getStudents);
router.get('/:id', protect, getStudent);
router.post('/', protect, createStudent);
router.put('/:id', protect, updateStudent);
router.delete('/:id', protect, deleteStudent);
router.post('/:id/notes', protect, addNote);

module.exports = router;