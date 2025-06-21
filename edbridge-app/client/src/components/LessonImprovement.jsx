import React, { useState } from 'react';
import { FaLightbulb, FaSpinner } from 'react-icons/fa';

const LessonImprovement = ({ lessonId }) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  const getSuggestions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/improve-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lessonId })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuggestions(data.data);
        setActiveCategory('contentEnhancement');
      } else {
        setError(data.message || 'Failed to get improvement suggestions');
      }
    } catch (error) {
      console.error('Error getting improvement suggestions:', error);
      setError('An error occurred while getting improvement suggestions');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'contentEnhancement', label: 'Content Enhancement', icon: '📝' },
    { id: 'learningOutcomes', label: 'Learning Outcomes', icon: '🎯' },
    { id: 'activities', label: 'Activities', icon: '🧩' },
    { id: 'assessment', label: 'Assessment', icon: '📊' },
    { id: 'realWorldRelevance', label: 'Real-World Relevance', icon: '🌎' },
    { id: 'differentiation', label: 'Differentiation', icon: '🧠' },
    { id: 'technologyIntegration', label: 'Technology Integration', icon: '💻' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-primary-50 border-b border-primary-100 flex justify-between items-center">
        <div className="flex items-center">
          <FaLightbulb className="text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold">Lesson Improvement Suggestions</h3>
        </div>
        
        {!suggestions && !loading && (
          <button 
            onClick={getSuggestions}
            className="btn btn-primary py-2 px-4 text-sm"
          >
            Get Suggestions
          </button>
        )}
      </div>

      {loading && (
        <div className="p-8 flex flex-col items-center justify-center">
          <FaSpinner className="animate-spin text-primary-600 text-3xl mb-4" />
          <p className="text-gray-600">Analyzing your lesson and generating improvement suggestions...</p>
          <p className="text-gray-500 text-sm mt-2">This may take up to a minute</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {suggestions && !loading && (
        <div className="p-4">
          <div className="flex overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-3 py-2 mr-2 rounded-md whitespace-nowrap flex items-center ${
                  activeCategory === category.id 
                    ? 'bg-primary-100 text-primary-800' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{category.icon}</span> {category.label}
              </button>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-semibold mb-3">
              {categories.find(c => c.id === activeCategory)?.label} Suggestions
            </h4>
            <div className="prose max-w-none">
              {suggestions[activeCategory] ? (
                typeof suggestions[activeCategory] === 'string' ? (
                  <p>{suggestions[activeCategory]}</p>
                ) : Array.isArray(suggestions[activeCategory]) ? (
                  <ul className="list-disc pl-5 space-y-2">
                    {suggestions[activeCategory].map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No specific suggestions available for this category.</p>
                )
              ) : (
                <p>No specific suggestions available for this category.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonImprovement;
