const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');

const {
  getPayments,
  createPayment,
  getStudentPayments
} = require('../controllers/paymentController');

router.get('/', protect, getPayments);
router.post('/', protect, createPayment);
router.get('/student/:studentId', protect, getStudentPayments);

module.exports = router;