import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaDownload, FaShare, FaEdit, FaTrash } from 'react-icons/fa';

const LessonView = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('explanation');

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        // Replace with actual API call
        const response = await fetch(`/api/lessons/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (response.ok) {
          setLesson(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch lesson');
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  const handleDownloadPDF = () => {
    // Implement PDF download functionality
    alert('PDF download functionality will be implemented here');
  };

  const handleShare = () => {
    // Implement share functionality
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600">Lesson not found</h2>
        <p className="mt-4">The lesson you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link to="/dashboard" className="btn btn-primary mt-6 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <h1 className="text-3xl font-bold">{lesson.title || lesson.topic}</h1>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
            >
              <FaDownload className="mr-2" /> PDF
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
            >
              <FaShare className="mr-2" /> Share
            </button>
          </div>
        </div>
        <div className="mt-2 text-gray-600">
          <span className="mr-4">Grade: {lesson.gradeLevel}</span>
          <span>Subject: {lesson.subject}</span>
        </div>
      </header>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide border-b">
          <button 
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'explanation' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'}`} 
            onClick={() => setActiveTab('explanation')}
          >
            Explanation
          </button>
          <button 
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'activities' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'}`} 
            onClick={() => setActiveTab('activities')}
          >
            Activities
          </button>
          <button 
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'quiz' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'}`} 
            onClick={() => setActiveTab('quiz')}
          >
            Quiz
          </button>
          <button 
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'resources' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'}`} 
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </button>
          <button 
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'examples' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'}`} 
            onClick={() => setActiveTab('examples')}
          >
            Real-World Examples
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'explanation' && (
            <div className="explanation">
              <h2 className="text-xl font-bold mb-4">Topic Explanation</h2>
              <div className="prose max-w-none">
                {lesson.explanation ? (
                  <div dangerouslySetInnerHTML={{ __html: lesson.explanation }} />
                ) : (
                  <p className="text-gray-500 italic">No explanation available.</p>
                )}
              </div>
              
              {lesson.learningOutcomes && lesson.learningOutcomes.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-2">Learning Outcomes</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {lesson.learningOutcomes.map((outcome, index) => (
                      <li key={index}>{outcome}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'activities' && (
            <div className="activities">
              <h2 className="text-xl font-bold mb-4">Suggested Activities</h2>
              {lesson.activities && lesson.activities.length > 0 ? (
                <div className="space-y-4">
                  {lesson.activities.map((activity, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-semibold mb-2">Activity {index + 1}</h3>
                      <p>{activity}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No activities available.</p>
              )}
            </div>
          )}
          
          {activeTab === 'quiz' && (
            <div className="quiz">
              <h2 className="text-xl font-bold mb-4">Quiz Questions</h2>
              {lesson.quiz && lesson.quiz.length > 0 ? (
                <div className="space-y-6">
                  {lesson.quiz.map((question, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-semibold mb-3">Question {index + 1}</h3>
                      <p className="mb-3">{question.question}</p>
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-start">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center mr-2 ${
                              String.fromCharCode(65 + optIndex) === question.answer ? 'bg-green-100 border-green-500 text-green-700' : 'border-gray-300'
                            }`}>
                              {String.fromCharCode(65 + optIndex)}
                            </div>
                            <span>{option}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-sm bg-green-50 p-3 rounded border border-green-200">
                        <span className="font-medium text-green-800">Answer:</span> {question.answer}
                        {question.explanation && (
                          <p className="mt-1 text-green-700">{question.explanation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No quiz questions available.</p>
              )}
            </div>
          )}
          
          {activeTab === 'resources' && (
            <div className="resources">
              <h2 className="text-xl font-bold mb-4">Learning Resources</h2>
              {lesson.resources && lesson.resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lesson.resources.map((resource, index) => (
                    <div key={index} className="border rounded-md overflow-hidden">
                      <div className={`p-1 text-xs text-white uppercase tracking-wide font-medium ${
                        resource.type === 'video' ? 'bg-red-500' : 
                        resource.type === 'article' ? 'bg-blue-500' : 
                        resource.type === 'interactive' ? 'bg-purple-500' : 
                        resource.type === 'image' ? 'bg-green-500' : 'bg-gray-500'
                      }`}>
                        {resource.type}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">{resource.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                        >
                          View Resource →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No resources available.</p>
              )}
            </div>
          )}
          
          {activeTab === 'examples' && (
            <div className="examples">
              <h2 className="text-xl font-bold mb-4">Real-World Examples</h2>
              {lesson.realWorldExamples && lesson.realWorldExamples.length > 0 ? (
                <div className="space-y-4">
                  {lesson.realWorldExamples.map((example, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md">
                      <p>{example}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No real-world examples available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonView;
