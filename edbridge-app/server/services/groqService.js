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
      
      Format your response as a JSON object with these categories as keys and detailed suggestions as values.
    `;
    
    try {
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
      
      try {
        // Parse the JSON content
        return JSON.parse(content);
      } catch (error) {
        console.error('Error parsing JSON improvement suggestions:', error);
        return {
          contentEnhancement: "Consider adding more detailed explanations and examples.",
          learningOutcomes: "Make learning outcomes more specific and measurable.",
          activities: "Add more interactive and hands-on activities.",
          assessment: "Include a variety of question types in your assessment.",
          realWorldRelevance: "Connect the topic to current events or students' daily lives.",
          differentiation: "Provide options for visual, auditory, and kinesthetic learners.",
          technologyIntegration: "Consider incorporating educational apps or online resources."
        };
      }
    } catch (error) {
      console.error('Error calling Groq API for lesson improvements:', error);
      throw new Error('Failed to generate lesson improvement suggestions');
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
