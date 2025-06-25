const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const groqService = require('../services/groqService');
const tavilyService = require('../services/tavilyService');
const Lesson = require('../models/Lesson');

// @desc    Generate complete lesson using Groq and Tavily
// @route   POST /api/ai/generate-lesson
// @access  Private
exports.generateLessonPlan = asyncHandler(async (req, res, next) => {
  const { topic, subject, gradeLevel, additionalNotes } = req.body;
  
  if (!topic || !subject || !gradeLevel) {
    return next(new ErrorResponse('Please provide topic, subject, and grade level', 400));
  }
  
  try {
    console.log(`Starting lesson generation for: ${topic} (${subject}, Grade ${gradeLevel})`);
    
    // Step 1: Generate lesson content using Groq
    let lessonContent;
    try {
      lessonContent = await groqService.generateLessonContent({
        topic,
        subject,
        gradeLevel,
        additionalNotes: additionalNotes || ''
      });
      console.log('Lesson content generated successfully');
    } catch (error) {
      console.error('Error generating lesson content with Groq:', error);
      
      // Create a fallback lesson content if Groq fails
      lessonContent = {
        title: `${topic} for Grade ${gradeLevel}`,
        explanation: `This is a lesson about ${topic} for grade ${gradeLevel} students studying ${subject}.`,
        learningOutcomes: [
          `Understand the basic concepts of ${topic}`,
          `Apply knowledge of ${topic} in practical situations`,
          `Analyze the importance of ${topic} in ${subject}`
        ],
        activities: [
          `Class discussion about ${topic}`,
          `Group activity related to ${topic}`
        ],
        quiz: [
          {
            question: `What is the main concept of ${topic}?`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            answer: "A",
            explanation: "This is a placeholder question."
          }
        ],
        realWorldExamples: [
          `Example of ${topic} in everyday life`
        ]
      };
    }
    
    // Step 2: Search for relevant resources using Tavily
    let resources = [];
    try {
      const searchQuery = `${topic} ${subject} grade ${gradeLevel} educational resources`;
      resources = await tavilyService.searchResources({
        topic: searchQuery,
        maxResults: 5
      });
      console.log(`Found ${resources.length} resources from Tavily`);
    } catch (error) {
      console.error('Error searching for resources with Tavily:', error);
      // Continue with empty resources if Tavily fails
    }
    
    // Step 3: Create lesson in database
    try {
      const lesson = await Lesson.create({
        topic,
        subject,
        gradeLevel,
        title: lessonContent.title || `${topic} for Grade ${gradeLevel}`,
        explanation: lessonContent.explanation || `Lesson about ${topic}`,
        learningOutcomes: lessonContent.learningOutcomes || [],
        activities: lessonContent.activities || [],
        quiz: lessonContent.quiz || [],
        realWorldExamples: lessonContent.realWorldExamples || [],
        resources,
        additionalNotes,
        user: req.user.id
      });
      
      console.log(`Lesson created with ID: ${lesson._id}`);
      
      res.status(201).json({
        success: true,
        data: lesson
      });
    } catch (dbError) {
      console.error('Error saving lesson to database:', dbError);
      return next(new ErrorResponse(`Error saving lesson to database: ${dbError.message}`, 500));
    }
  } catch (error) {
    console.error('Error in lesson generation process:', error);
    return next(new ErrorResponse(`Error generating lesson plan: ${error.message}`, 500));
  }
});

// @desc    Generate additional quiz questions for an existing lesson
// @route   POST /api/ai/generate-quiz
// @access  Private
exports.generateQuiz = asyncHandler(async (req, res, next) => {
  const { lessonId, numberOfQuestions, difficulty } = req.body;
  
  if (!lessonId) {
    return next(new ErrorResponse('Please provide a lesson ID', 400));
  }
  
  try {
    // Find the lesson
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson) {
      return next(new ErrorResponse(`Lesson not found with id of ${lessonId}`, 404));
    }
    
    // Make sure user owns the lesson
    if (lesson.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`User not authorized to modify this lesson`, 401));
    }
    
    // Generate quiz questions using Groq
    const quizQuestions = await groqService.generateQuiz({
      topic: lesson.topic,
      subject: lesson.subject,
      gradeLevel: lesson.gradeLevel,
      explanation: lesson.explanation,
      numberOfQuestions: numberOfQuestions || 5,
      difficulty: difficulty || 'medium'
    });
    
    // Update the lesson with new quiz questions
    lesson.quiz = [...lesson.quiz, ...quizQuestions];
    lesson.updatedAt = Date.now();
    await lesson.save();
    
    res.status(200).json({
      success: true,
      data: quizQuestions
    });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return next(new ErrorResponse('Error generating quiz questions', 500));
  }
});

// @desc    Search for additional educational resources using Tavily
// @route   POST /api/ai/search-resources
// @access  Private
exports.searchResources = asyncHandler(async (req, res, next) => {
  const { lessonId, resourceType, maxResults } = req.body;
  
  if (!lessonId) {
    return next(new ErrorResponse('Please provide a lesson ID', 400));
  }
  
  try {
    // Find the lesson
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson) {
      return next(new ErrorResponse(`Lesson not found with id of ${lessonId}`, 404));
    }
    
    // Make sure user owns the lesson
    if (lesson.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`User not authorized to modify this lesson`, 401));
    }
    
    // Search for resources using Tavily
    const searchQuery = `${lesson.topic} ${lesson.subject} grade ${lesson.gradeLevel} ${resourceType || ''} educational resources`;
    const resources = await tavilyService.searchResources({
      topic: searchQuery,
      resourceType: resourceType || 'all',
      maxResults: maxResults || 5
    });
    
    // Update the lesson with new resources
    lesson.resources = [...lesson.resources, ...resources];
    lesson.updatedAt = Date.now();
    await lesson.save();
    
    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Error searching for resources:', error);
    return next(new ErrorResponse('Error searching for educational resources', 500));
  }
});

// @desc    Get improvement suggestions for a lesson
// @route   POST /api/ai/improve-lesson
// @access  Private
exports.improveLessonSuggestions = asyncHandler(async (req, res, next) => {
  const { lessonId } = req.body;
  
  if (!lessonId) {
    return next(new ErrorResponse('Please provide a lesson ID', 400));
  }
  
  try {
    // Find the lesson
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson) {
      return next(new ErrorResponse(`Lesson not found with id of ${lessonId}`, 404));
    }
    
    // Make sure user owns the lesson
    if (lesson.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`User not authorized to access this lesson`, 401));
    }
    
    console.log(`Generating improvement suggestions for lesson: ${lessonId}`);
    
    // Generate improvement suggestions using Groq
    try {
      const suggestions = await groqService.generateLessonImprovements({
        topic: lesson.topic,
        subject: lesson.subject,
        gradeLevel: lesson.gradeLevel,
        explanation: lesson.explanation,
        learningOutcomes: lesson.learningOutcomes,
        activities: lesson.activities,
        quiz: lesson.quiz,
        realWorldExamples: lesson.realWorldExamples
      });
      
      console.log('Successfully generated improvement suggestions');
      
      res.status(200).json({
        success: true,
        data: suggestions
      });
    } catch (aiError) {
      console.error('Error from Groq service:', aiError);
      
      // Provide fallback suggestions if AI service fails
      const fallbackSuggestions = {
        contentEnhancement: "Consider adding more detailed explanations and examples that connect to students' prior knowledge. Use visual aids and analogies to make complex concepts more accessible.",
        learningOutcomes: "Make learning outcomes more specific, measurable, and aligned with curriculum standards. Include outcomes that address different cognitive levels.",
        activities: "Incorporate more hands-on, inquiry-based activities that promote active learning. Include collaborative group work that encourages peer discussion.",
        assessment: "Include a variety of assessment types beyond multiple-choice questions. Add formative assessments throughout the lesson to check for understanding.",
        realWorldRelevance: "Connect the topic to current events or issues that students can relate to. Include examples from different cultural contexts to make the content more inclusive.",
        differentiation: "Provide options for visual, auditory, and kinesthetic learners. Create tiered assignments that allow students to work at their appropriate challenge level.",
        technologyIntegration: "Incorporate educational apps or online tools that enhance the learning experience. Use digital collaboration tools to facilitate group work."
      };
      
      res.status(200).json({
        success: true,
        data: fallbackSuggestions,
        note: "These are fallback suggestions as the AI service encountered an error."
      });
    }
  } catch (error) {
    console.error('Error in improveLessonSuggestions controller:', error);
    return next(new ErrorResponse('Error generating improvement suggestions', 500));
  }
});
// @desc    Generate homework assignment for an existing lesson
// @route   POST /api/ai/generate-homework
// @access  Private
exports.generateHomework = asyncHandler(async (req, res, next) => {
  const { 
    lessonId, 
    questionTypes = ['mcq', 'short_answer', 'diagram', 'creative'], 
    numberOfQuestions = 10, 
    difficulty = 'medium',
    dueDate
  } = req.body;
  
  if (!lessonId) {
    return next(new ErrorResponse('Please provide a lesson ID', 400));
  }
  
  try {
    // Find the lesson
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson) {
      return next(new ErrorResponse(`Lesson not found with id of ${lessonId}`, 404));
    }
    
    // Make sure user owns the lesson
    if (lesson.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`User not authorized to modify this lesson`, 401));
    }
    
    // Generate homework assignment using Groq
    const homeworkAssignment = await groqService.generateHomework({
      topic: lesson.topic,
      subject: lesson.subject,
      gradeLevel: lesson.gradeLevel,
      explanation: lesson.explanation,
      learningOutcomes: lesson.learningOutcomes,
      questionTypes,
      numberOfQuestions,
      difficulty
    });
    
    // Add due date if provided
    if (dueDate) {
      homeworkAssignment.dueDate = new Date(dueDate);
    }
    
    // Add the homework assignment to the lesson
    lesson.homework = lesson.homework || [];
    lesson.homework.push(homeworkAssignment);
    lesson.updatedAt = Date.now();
    await lesson.save();
    
    res.status(200).json({
      success: true,
      data: homeworkAssignment
    });
  } catch (error) {
    console.error('Error generating homework assignment:', error);
    return next(new ErrorResponse('Error generating homework assignment', 500));
  }
});
