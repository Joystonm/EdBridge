const express = require('express');
const router = express.Router();
const { 
  generateLessonPlan, 
  generateQuiz, 
  searchResources 
} = require('../controllers/ai');
const { protect } = require('../middleware/auth');

router.post('/generate-lesson', protect, generateLessonPlan);
router.post('/generate-quiz', protect, generateQuiz);
router.post('/search-resources', protect, searchResources);

module.exports = router;
