import axiosInstance from '../utils/axiosConfig';

/**
 * Generate a homework assignment for a lesson
 * @param {string} lessonId - ID of the lesson
 * @param {Array} questionTypes - Array of question types (mcq, short_answer, diagram, creative)
 * @param {number} numberOfQuestions - Number of questions to generate
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @param {string} dueDate - Optional due date for the homework
 * @returns {Promise} - Promise with the generated homework data
 */
export const generateHomework = async (lessonId, questionTypes, numberOfQuestions, difficulty, dueDate) => {
  try {
    const response = await axiosInstance.post('/ai/generate-homework', {
      lessonId,
      questionTypes,
      numberOfQuestions,
      difficulty,
      dueDate
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error generating homework:', error);
    throw error;
  }
};

/**
 * Get all homework assignments for a lesson
 * @param {string} lessonId - ID of the lesson
 * @returns {Promise} - Promise with the homework assignments
 */
export const getHomeworkByLessonId = async (lessonId) => {
  try {
    const response = await axiosInstance.get(`/lessons/${lessonId}`);
    return response.data.data.homework || [];
  } catch (error) {
    console.error('Error fetching homework assignments:', error);
    throw error;
  }
};

/**
 * Delete a homework assignment
 * @param {string} lessonId - ID of the lesson
 * @param {string} homeworkId - ID of the homework to delete
 * @returns {Promise} - Promise with the result
 */
export const deleteHomework = async (lessonId, homeworkId) => {
  try {
    const response = await axiosInstance.delete(`/lessons/${lessonId}/homework/${homeworkId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting homework assignment:', error);
    throw error;
  }
};

/**
 * Update a homework assignment
 * @param {string} lessonId - ID of the lesson
 * @param {string} homeworkId - ID of the homework to update
 * @param {Object} homeworkData - Updated homework data
 * @returns {Promise} - Promise with the updated homework
 */
export const updateHomework = async (lessonId, homeworkId, homeworkData) => {
  try {
    const response = await axiosInstance.put(`/lessons/${lessonId}/homework/${homeworkId}`, homeworkData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating homework assignment:', error);
    throw error;
  }
};

/**
 * Export homework as PDF
 * @param {string} lessonId - ID of the lesson
 * @param {string} homeworkId - ID of the homework to export
 * @returns {Promise} - Promise with the PDF data
 */
export const exportHomeworkAsPdf = async (lessonId, homeworkId) => {
  try {
    const response = await axiosInstance.get(`/lessons/${lessonId}/homework/${homeworkId}/export`, {
      responseType: 'blob'
    });
    
    // Create a download link and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'homework.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting homework as PDF:', error);
    throw error;
  }
};
