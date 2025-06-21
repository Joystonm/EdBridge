const express = require('express');
const router = express.Router();
const { 
  getLessons, 
  getLesson, 
  createLesson, 
  updateLesson, 
  deleteLesson 
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

module.exports = router;
