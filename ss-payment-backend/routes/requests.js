const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
// Assume you have a PaymentRequest model

// GET /api/requests
router.get('/', protect, async (req, res) => {
  // return pending requests
  res.json([]);
});

module.exports = router;