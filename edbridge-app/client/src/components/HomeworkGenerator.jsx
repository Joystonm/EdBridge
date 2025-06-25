import React, { useState } from 'react';
import axiosInstance from '../utils/axiosConfig';

const HomeworkGenerator = ({ lessonId, onHomeworkGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    questionTypes: ['mcq', 'short_answer', 'diagram', 'creative'],
    numberOfQuestions: 10,
    difficulty: 'medium',
    dueDate: ''
  });

  const handleCheckboxChange = (type) => {
    const updatedTypes = [...formData.questionTypes];
    
    if (updatedTypes.includes(type)) {
      // Remove the type if it's already selected
      const filteredTypes = updatedTypes.filter(t => t !== type);
      // Ensure at least one type is selected
      if (filteredTypes.length > 0) {
        setFormData({ ...formData, questionTypes: filteredTypes });
      }
    } else {
      // Add the type if it's not already selected
      setFormData({ ...formData, questionTypes: [...updatedTypes, type] });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/ai/generate-homework', {
        lessonId,
        questionTypes: formData.questionTypes,
        numberOfQuestions: parseInt(formData.numberOfQuestions),
        difficulty: formData.difficulty,
        dueDate: formData.dueDate || undefined
      });

      if (onHomeworkGenerated) {
        onHomeworkGenerated(response.data.data);
        
        // Show success message
        alert('Homework generated successfully!');
        
        // Refresh the page to show the new homework
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate homework');
      console.error('Error generating homework:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Generate Homework Assignment</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Question Types</label>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.questionTypes.includes('mcq')}
                onChange={() => handleCheckboxChange('mcq')}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Multiple Choice</span>
            </label>
            
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.questionTypes.includes('short_answer')}
                onChange={() => handleCheckboxChange('short_answer')}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Short Answer</span>
            </label>
            
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.questionTypes.includes('diagram')}
                onChange={() => handleCheckboxChange('diagram')}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Diagram-based</span>
            </label>
            
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.questionTypes.includes('creative')}
                onChange={() => handleCheckboxChange('creative')}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Creative Prompts</span>
            </label>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Number of Questions
            </label>
            <input
              type="number"
              name="numberOfQuestions"
              value={formData.numberOfQuestions}
              onChange={handleInputChange}
              min="1"
              max="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Difficulty Level
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Generating...' : 'Generate Homework'}
        </button>
      </form>
    </div>
  );
};

export default HomeworkGenerator;
