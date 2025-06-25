import React, { useState } from 'react';
import { FaLightbulb, FaSpinner, FaBug } from 'react-icons/fa';
import axiosInstance from '../utils/axiosConfig';

const LessonImprovement = ({ lessonId }) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [rawResponse, setRawResponse] = useState(null);

  const getSuggestions = async () => {
    setLoading(true);
    setError('');
    setRawResponse(null);
    
    try {
      const response = await axiosInstance.post('/ai/improve-lesson', { lessonId });
      
      // Store raw response for debugging
      setRawResponse(response.data);
      
      if (response.data.success) {
        const suggestionData = response.data.data;
        console.log('Suggestion data:', suggestionData);
        
        // Check if we have valid suggestion data
        if (suggestionData && typeof suggestionData === 'object') {
          setSuggestions(suggestionData);
          
          // Find the first category that has content
          const categories = [
            'contentEnhancement', 'learningOutcomes', 'activities', 
            'assessment', 'realWorldRelevance', 'differentiation', 
            'technologyIntegration'
          ];
          
          const firstValidCategory = categories.find(cat => 
            suggestionData[cat] && 
            (typeof suggestionData[cat] === 'string' || 
             Array.isArray(suggestionData[cat]) || 
             typeof suggestionData[cat] === 'object')
          ) || 'contentEnhancement';
          
          setActiveCategory(firstValidCategory);
        } else {
          setError('Received invalid suggestion data from the server');
        }
      } else {
        setError(response.data.message || 'Failed to get improvement suggestions');
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

  // Function to render suggestion content based on its type
  const renderSuggestionContent = (content) => {
    if (!content) {
      return <p>No specific suggestions available for this category.</p>;
    }
    
    if (typeof content === 'string') {
      return <p>{content}</p>;
    }
    
    if (Array.isArray(content)) {
      return (
        <ul className="list-disc pl-5 space-y-2">
          {content.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }
    
    if (typeof content === 'object') {
      return (
        <ul className="list-disc pl-5 space-y-2">
          {Object.entries(content).map(([key, value], index) => (
            <li key={index}>
              <strong>{key}:</strong> {value}
            </li>
          ))}
        </ul>
      );
    }
    
    return <p>No specific suggestions available for this category.</p>;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-primary-50 border-b border-primary-100 flex justify-between items-center">
        <div className="flex items-center">
          <FaLightbulb className="text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold">Lesson Improvement Suggestions</h3>
        </div>
        
        <div className="flex items-center">
          {!suggestions && !loading && (
            <button 
              onClick={getSuggestions}
              className="btn btn-primary py-2 px-4 text-sm"
            >
              Get Suggestions
            </button>
          )}
          
          <button 
            onClick={() => setDebugMode(!debugMode)}
            className="ml-2 text-gray-500 hover:text-gray-700"
            title="Toggle Debug Mode"
          >
            <FaBug />
          </button>
        </div>
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

      {debugMode && rawResponse && (
        <div className="p-4 bg-gray-100 border-b border-gray-200">
          <h4 className="font-mono text-sm font-bold mb-2">Debug Information:</h4>
          <pre className="text-xs overflow-auto max-h-60 bg-gray-800 text-gray-100 p-2 rounded">
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
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
              {renderSuggestionContent(suggestions[activeCategory])}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonImprovement;
