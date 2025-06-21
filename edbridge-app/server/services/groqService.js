const axios = require('axios');

/**
 * Service for interacting with the Groq API for AI-powered content generation
 */
class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.baseURL = 'https://api.groq.com/v1';
    this.model = process.env.GROQ_MODEL || 'llama3-70b-8192';
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
      
      const content = this.parseResponse(response.data);
      
      try {
        // Parse the JSON content
        return JSON.parse(content);
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        // If parsing fails, return a structured error response
        return {
          title: `${topic} for Grade ${gradeLevel}`,
          explanation: "There was an error generating the lesson content. Please try again.",
          learningOutcomes: [],
          activities: [],
          quiz: [],
          realWorldExamples: []
        };
      }
    } catch (error) {
      console.error('Error calling Groq API for lesson content:', error);
      throw new Error('Failed to generate lesson content');
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
