const express = require('express');
const router = express.Router();
const { 
  getLessons, 
  getLesson, 
  createLesson, 
  updateLesson, 
  deleteLesson,
  getHomework,
  getSingleHomework,
  updateHomework,
  deleteHomework
} = require('../controllers/lessons');
const { protect } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getLessons)
  .post(protect, createLesson);

router
  .route('/:id')
  .get(protect, getLesson)
  .put(protect, updateLesson)
  .delete(protect, deleteLesson);

router
  .route('/:id/homework')
  .get(protect, getHomework);

router
  .route('/:id/homework/:homeworkId')
  .get(protect, getSingleHomework)
  .put(protect, updateHomework)
  .delete(protect, deleteHomework);

module.exports = router;
