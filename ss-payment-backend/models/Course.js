const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  pricing: { 
    type: Map, 
    of: Number 
  }, // e.g., { "1": 5000, "3": 12000, "6": 20000 }
  durations: [Number]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);