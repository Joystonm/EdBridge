const Lesson = require('../models/Lesson');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all lessons for a user
// @route   GET /api/lessons
// @access  Private
exports.getLessons = asyncHandler(async (req, res, next) => {
  const lessons = await Lesson.find({ user: req.user.id }).sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: lessons.length,
    data: lessons
  });
});

// @desc    Get single lesson
// @route   GET /api/lessons/:id
// @access  Private
exports.getLesson = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);
  
  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user owns the lesson
  if (lesson.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this lesson`, 401));
  }
  
  res.status(200).json({
    success: true,
    data: lesson
  });
});

// @desc    Create new lesson
// @route   POST /api/lessons
// @access  Private
exports.createLesson = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;
  
  // Create lesson
  const lesson = await Lesson.create(req.body);
  
  res.status(201).json({
    success: true,
    data: lesson
  });
});

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private
exports.updateLesson = asyncHandler(async (req, res, next) => {
  let lesson = await Lesson.findById(req.params.id);
  
  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user owns the lesson
  if (lesson.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this lesson`, 401));
  }
  
  // Update timestamp
  req.body.updatedAt = Date.now();
  
  lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: lesson
  });
});

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private
exports.deleteLesson = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);
  
  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user owns the lesson
  if (lesson.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this lesson`, 401));
  }
  
  await Lesson.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    data: {}
  });
});
