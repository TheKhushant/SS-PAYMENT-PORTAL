const express = require('express');
const { getCourses, createCourse, updateCourse } = require('../controllers/courseController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getCourses);
router.post('/', protect, createCourse);
router.put('/:id', protect, updateCourse);

module.exports = router;