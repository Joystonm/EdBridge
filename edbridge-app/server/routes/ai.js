const express = require('express');
const router = express.Router();
const { 
  generateLessonPlan, 
  generateQuiz, 
  searchResources,
  improveLessonSuggestions
} = require('../controllers/ai');
const { protect } = require('../middleware/auth');

router.post('/generate-lesson', protect, generateLessonPlan);
router.post('/generate-quiz', protect, generateQuiz);
router.post('/search-resources', protect, searchResources);
router.post('/improve-lesson', protect, improveLessonSuggestions);

module.exports = router;
