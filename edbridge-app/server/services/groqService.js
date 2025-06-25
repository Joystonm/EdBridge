const axios = require('axios');

/**
 * Service for interacting with the Groq API for AI-powered content generation
 */
class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.baseURL = 'https://api.groq.com/openai/v1';
    this.model = process.env.GROQ_MODEL || 'llama3-70b-8192';
    
    if (!this.apiKey) {
      console.error('GROQ_API_KEY is not set in environment variables');
    }
  }

  /**
   * Initialize the API client with authentication
   */
  getClient() {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Generate complete lesson content based on provided parameters
   */
  async generateLessonContent(params) {
    const { topic, subject, gradeLevel, additionalNotes } = params;
    
    console.log(`Generating lesson for topic: ${topic}, subject: ${subject}, grade: ${gradeLevel}`);
    
    const prompt = `
      You are an expert educator creating a comprehensive lesson for grade ${gradeLevel} students about "${topic}" in the subject of ${subject}.
      ${additionalNotes ? `Additional context: ${additionalNotes}` : ''}
      
      Please create a complete lesson with the following components:
      
      1. Title: A catchy, descriptive title for this lesson
      
      2. Explanation: A clear, grade-appropriate explanation of the topic that is engaging and informative. 
         Use simple language appropriate for grade ${gradeLevel} students.
      
      3. Learning Outcomes: 3-5 specific learning outcomes that students should achieve by the end of this lesson
      
      4. Activities: 2-3 engaging hands-on activities or exercises that reinforce the topic
      
      5. Quiz: 3-5 multiple-choice questions to assess understanding, each with 4 options (A, B, C, D) and the correct answer
      
      6. Real-World Examples: 2-3 current, real-world examples or applications of this topic that students can relate to
      
      Format your response as a JSON object with the following structure:
      {
        "title": "Lesson title",
        "explanation": "Detailed explanation of the topic",
        "learningOutcomes": ["outcome1", "outcome2", "outcome3"],
        "activities": ["activity1", "activity2", "activity3"],
        "quiz": [
          {
            "question": "Question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "A/B/C/D",
            "explanation": "Why this is the correct answer"
          }
        ],
        "realWorldExamples": ["example1", "example2", "example3"]
      }
    `;
    
    try {
      console.log('Calling Groq API...');
      const client = this.getClient();
      const response = await client.post('/chat/completions', {
        model: this.model,
        messages: [
          { role: 'system', content: 'You are an expert educator and curriculum designer. Create detailed, engaging, and pedagogically sound lesson content tailored to the appropriate grade level.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      });
      
      console.log('Groq API response received');
      const content = this.parseResponse(response.data);
      
      try {
        // Parse the JSON content
        const parsedContent = JSON.parse(content);
        console.log('Successfully parsed JSON response');
        return parsedContent;
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        console.log('Raw content:', content);
        
        // If parsing fails, return a structured error response
        return {
          title: `${topic} for Grade ${gradeLevel}`,
          explanation: "The lesson was generated but couldn't be properly formatted. Here's the raw content: " + content.substring(0, 500) + "...",
          learningOutcomes: ["Understand key concepts of " + topic],
          activities: ["Discuss " + topic + " in groups"],
          quiz: [{
            question: "What is the main concept of " + topic + "?",
            options: ["Option A", "Option B", "Option C", "Option D"],
            answer: "A",
            explanation: "This is a placeholder question."
          }],
          realWorldExamples: ["Example of " + topic + " in everyday life"]
        };
      }
    } catch (error) {
      console.error('Error calling Groq API:', error.response ? error.response.data : error.message);
      throw new Error(`Failed to generate lesson content: ${error.message}`);
    }
  }

  /**
   * Generate quiz questions based on topic and grade level
   */
  async generateQuiz(params) {
    const { topic, subject, gradeLevel, explanation, numberOfQuestions, difficulty } = params;
    
    const prompt = `
      Create ${numberOfQuestions} multiple-choice quiz questions about "${topic}" for grade ${gradeLevel} students studying ${subject}.
      The difficulty level should be ${difficulty || 'medium'}.
      
      ${explanation ? `Use this explanation as context: ${explanation.substring(0, 500)}...` : ''}
      
      For each question:
      1. Provide the question text
      2. Provide 4 possible answers (labeled A, B, C, D)
      3. Indicate the correct answer (A, B, C, or D)
      4. Provide a brief explanation for why the answer is correct
      
      Format the response as a JSON array of question objects.
    `;
    
    try {
      const client = this.getClient();
      const response = await client.post('/chat/completions', {
        model: this.model,
        messages: [
          { role: 'system', content: 'You are an expert educator specializing in assessment design. Create clear, relevant, and pedagogically sound quiz questions appropriate for the specified grade level.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });
      
      const content = this.parseResponse(response.data);
      
      try {
        // Parse the JSON content
        const parsedContent = JSON.parse(content);
        return parsedContent.questions || parsedContent;
      } catch (error) {
        console.error('Error parsing JSON quiz response:', error);
        return [];
      }
    } catch (error) {
      console.error('Error calling Groq API for quiz generation:', error);
      throw new Error('Failed to generate quiz questions');
    }
  }

  /**
   * Generate improvement suggestions for an existing lesson
   */
  async generateLessonImprovements(params) {
    const { topic, subject, gradeLevel, explanation, learningOutcomes, activities, quiz, realWorldExamples } = params;
    
    const lessonContent = {
      topic,
      subject,
      gradeLevel,
      explanation: explanation || '',
      learningOutcomes: learningOutcomes || [],
      activities: activities || [],
      quiz: quiz || [],
      realWorldExamples: realWorldExamples || []
    };
    
    const prompt = `
      As an expert educator, please analyze this lesson plan and provide specific suggestions for improvement.
      
      LESSON DETAILS:
      Topic: ${topic}
      Subject: ${subject}
      Grade Level: ${gradeLevel}
      
      CURRENT LESSON CONTENT:
      ${JSON.stringify(lessonContent, null, 2)}
      
      Please provide detailed improvement suggestions in the following categories:
      
      1. Content Enhancement: How can the explanation be improved for clarity, engagement, and depth?
      2. Learning Outcomes: Are the learning outcomes specific, measurable, and appropriate? How can they be improved?
      3. Activities: How can the activities be more engaging, effective, or innovative?
      4. Assessment: How can the quiz questions be improved or expanded?
      5. Real-World Relevance: How can the real-world examples be more current, relevant, or impactful?
      6. Differentiation: Suggestions for adapting this lesson for different learning styles or abilities
      7. Technology Integration: Ideas for incorporating educational technology
      
      For each category, provide at least 3-5 specific, actionable suggestions.
      
      Format your response as a JSON object with these categories as keys and detailed suggestions as string values.
      The JSON structure should be:
      {
        "contentEnhancement": "Detailed suggestions for content enhancement...",
        "learningOutcomes": "Detailed suggestions for learning outcomes...",
        "activities": "Detailed suggestions for activities...",
        "assessment": "Detailed suggestions for assessment...",
        "realWorldRelevance": "Detailed suggestions for real-world relevance...",
        "differentiation": "Detailed suggestions for differentiation...",
        "technologyIntegration": "Detailed suggestions for technology integration..."
      }
    `;
    
    try {
      console.log('Generating lesson improvement suggestions...');
      const client = this.getClient();
      const response = await client.post('/chat/completions', {
        model: this.model,
        messages: [
          { role: 'system', content: 'You are an expert educational consultant who specializes in curriculum improvement. Provide specific, actionable suggestions to enhance lesson plans.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: 'json_object' }
      });
      
      const content = this.parseResponse(response.data);
      console.log('Received improvement suggestions response');
      
      try {
        // Parse the JSON content
        const parsedContent = JSON.parse(content);
        console.log('Successfully parsed improvement suggestions JSON');
        
        // Ensure all expected categories are present
        const defaultSuggestions = {
          contentEnhancement: "Consider adding more detailed explanations and examples that connect to students' prior knowledge. Use visual aids and analogies to make complex concepts more accessible. Break down the topic into smaller, manageable chunks for better comprehension.",
          learningOutcomes: "Make learning outcomes more specific, measurable, and aligned with curriculum standards. Include outcomes that address different cognitive levels (remembering, understanding, applying, analyzing, evaluating, creating). Ensure outcomes are clearly communicated to students.",
          activities: "Incorporate more hands-on, inquiry-based activities that promote active learning. Include collaborative group work that encourages peer discussion and knowledge sharing. Add activities that cater to different learning styles and abilities.",
          assessment: "Include a variety of assessment types beyond multiple-choice questions. Add formative assessments throughout the lesson to check for understanding. Create rubrics for evaluating student work that align with learning outcomes.",
          realWorldRelevance: "Connect the topic to current events or issues that students can relate to. Include examples from different cultural contexts to make the content more inclusive. Show how the knowledge can be applied to solve real-world problems.",
          differentiation: "Provide options for visual, auditory, and kinesthetic learners. Create tiered assignments that allow students to work at their appropriate challenge level. Offer choice in how students demonstrate their learning.",
          technologyIntegration: "Incorporate educational apps or online tools that enhance the learning experience. Use digital collaboration tools to facilitate group work. Consider using multimedia resources to explain complex concepts."
        };
        
        // Merge with default suggestions for any missing categories
        const mergedSuggestions = {
          ...defaultSuggestions,
          ...parsedContent
        };
        
        return mergedSuggestions;
      } catch (error) {
        console.error('Error parsing JSON improvement suggestions:', error);
        console.log('Raw content:', content);
        
        // Return default suggestions if parsing fails
        return {
          contentEnhancement: "Consider adding more detailed explanations and examples that connect to students' prior knowledge. Use visual aids and analogies to make complex concepts more accessible. Break down the topic into smaller, manageable chunks for better comprehension.",
          learningOutcomes: "Make learning outcomes more specific, measurable, and aligned with curriculum standards. Include outcomes that address different cognitive levels (remembering, understanding, applying, analyzing, evaluating, creating). Ensure outcomes are clearly communicated to students.",
          activities: "Incorporate more hands-on, inquiry-based activities that promote active learning. Include collaborative group work that encourages peer discussion and knowledge sharing. Add activities that cater to different learning styles and abilities.",
          assessment: "Include a variety of assessment types beyond multiple-choice questions. Add formative assessments throughout the lesson to check for understanding. Create rubrics for evaluating student work that align with learning outcomes.",
          realWorldRelevance: "Connect the topic to current events or issues that students can relate to. Include examples from different cultural contexts to make the content more inclusive. Show how the knowledge can be applied to solve real-world problems.",
          differentiation: "Provide options for visual, auditory, and kinesthetic learners. Create tiered assignments that allow students to work at their appropriate challenge level. Offer choice in how students demonstrate their learning.",
          technologyIntegration: "Incorporate educational apps or online tools that enhance the learning experience. Use digital collaboration tools to facilitate group work. Consider using multimedia resources to explain complex concepts."
        };
      }
    } catch (error) {
      console.error('Error calling Groq API for lesson improvements:', error);
      
      // Return default suggestions if API call fails
      return {
        contentEnhancement: "Consider adding more detailed explanations and examples that connect to students' prior knowledge. Use visual aids and analogies to make complex concepts more accessible. Break down the topic into smaller, manageable chunks for better comprehension.",
        learningOutcomes: "Make learning outcomes more specific, measurable, and aligned with curriculum standards. Include outcomes that address different cognitive levels (remembering, understanding, applying, analyzing, evaluating, creating). Ensure outcomes are clearly communicated to students.",
        activities: "Incorporate more hands-on, inquiry-based activities that promote active learning. Include collaborative group work that encourages peer discussion and knowledge sharing. Add activities that cater to different learning styles and abilities.",
        assessment: "Include a variety of assessment types beyond multiple-choice questions. Add formative assessments throughout the lesson to check for understanding. Create rubrics for evaluating student work that align with learning outcomes.",
        realWorldRelevance: "Connect the topic to current events or issues that students can relate to. Include examples from different cultural contexts to make the content more inclusive. Show how the knowledge can be applied to solve real-world problems.",
        differentiation: "Provide options for visual, auditory, and kinesthetic learners. Create tiered assignments that allow students to work at their appropriate challenge level. Offer choice in how students demonstrate their learning.",
        technologyIntegration: "Incorporate educational apps or online tools that enhance the learning experience. Use digital collaboration tools to facilitate group work. Consider using multimedia resources to explain complex concepts."
      };
    }
  }

  /**
   * Generate homework assignments based on lesson content
   */
  async generateHomework(params) {
    const { 
      topic, 
      subject, 
      gradeLevel, 
      explanation, 
      learningOutcomes, 
      questionTypes = ['mcq', 'short_answer', 'diagram', 'creative'],
      numberOfQuestions = 10,
      difficulty = 'medium'
    } = params;
    
    const prompt = `
      As an expert educator, create a comprehensive homework assignment for grade ${gradeLevel} students about "${topic}" in the subject of ${subject}.
      
      ${explanation ? `Use this explanation as context: ${explanation.substring(0, 500)}...` : ''}
      
      ${learningOutcomes && learningOutcomes.length > 0 ? `Learning outcomes: ${learningOutcomes.join(', ')}` : ''}
      
      Create a homework assignment with ${numberOfQuestions} questions of difficulty level ${difficulty}.
      
      Include a mix of the following question types:
      ${questionTypes.includes('mcq') ? '- Multiple-choice questions (MCQs) with 4 options each and one correct answer' : ''}
      ${questionTypes.includes('short_answer') ? '- Short answer questions that require brief written responses' : ''}
      ${questionTypes.includes('diagram') ? '- Diagram-based questions that involve labeling, drawing, or interpreting visual information' : ''}
      ${questionTypes.includes('creative') ? '- Creative prompts that encourage critical thinking and application of knowledge' : ''}
      
      For each question:
      1. Provide clear instructions
      2. For MCQs, include 4 options (A, B, C, D) and indicate the correct answer
      3. For all questions, provide a brief explanation or rubric for grading
      
      Format the response as a JSON object with the following structure:
      {
        "title": "Homework assignment title",
        "description": "Brief description of the homework assignment",
        "questions": [
          {
            "question": "Question text",
            "type": "mcq/short_answer/diagram/creative",
            "options": ["Option A", "Option B", "Option C", "Option D"], // For MCQs only
            "answer": "Correct answer or grading criteria",
            "explanation": "Explanation or grading rubric",
            "points": 5 // Point value for this question
          }
        ],
        "totalPoints": 50 // Sum of all question points
      }
    `;
    
    try {
      const client = this.getClient();
      const response = await client.post('/chat/completions', {
        model: this.model,
        messages: [
          { role: 'system', content: 'You are an expert educator specializing in creating effective homework assignments. Design clear, engaging, and pedagogically sound homework that reinforces learning objectives and assesses student understanding.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      });
      
      const content = this.parseResponse(response.data);
      
      try {
        // Parse the JSON content
        const parsedContent = JSON.parse(content);
        console.log('Successfully parsed homework JSON response');
        return parsedContent;
      } catch (error) {
        console.error('Error parsing JSON homework response:', error);
        console.log('Raw content:', content);
        
        // If parsing fails, return a structured error response
        return {
          title: `${topic} Homework Assignment`,
          description: `Homework assignment for ${topic} (Grade ${gradeLevel})`,
          questions: [
            {
              question: `What is the main concept of ${topic}?`,
              type: 'mcq',
              options: ["Option A", "Option B", "Option C", "Option D"],
              answer: "A",
              explanation: "This is a placeholder question.",
              points: 5
            }
          ],
          totalPoints: 5
        };
      }
    } catch (error) {
      console.error('Error calling Groq API for homework generation:', error);
      throw new Error('Failed to generate homework assignment');
    }
  }

  /**
   * Parse the response from Groq API
   */
  parseResponse(responseData) {
    if (responseData && responseData.choices && responseData.choices.length > 0) {
      return responseData.choices[0].message.content;
    }
    throw new Error('Invalid response format from Groq API');
  }
}

module.exports = new GroqService();
