const Course = require('../models/Course');

exports.getCourses = async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
};

exports.createCourse = async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json(course);
};

exports.updateCourse = async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params._id, req.body, { new: true });
  res.json(course);
};