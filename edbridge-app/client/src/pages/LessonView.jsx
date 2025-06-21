import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaDownload, FaShare, FaTrash, FaSpinner, FaCalendarAlt } from 'react-icons/fa';
import Layout from '../components/Layout';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import LessonImprovement from '../components/LessonImprovement';

const LessonView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('explanation');
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  
  const contentRef = useRef(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchLesson = async () => {
      try {
        const response = await fetch(`/api/lessons/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        
        const data = await response.json();
        
        if (response.ok) {
          setLesson(data.data);
        } else {
          setError(data.message || 'Failed to fetch lesson');
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
        setError('An error occurred while fetching the lesson');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id, navigate]);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    
    setIsDownloading(true);
    
    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(66, 66, 200);
      pdf.text(lesson.title || lesson.topic, pageWidth / 2, 20, { align: 'center' });
      
      // Add metadata
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Subject: ${lesson.subject} | Grade: ${lesson.gradeLevel}`, pageWidth / 2, 30, { align: 'center' });
      
      // Add explanation
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Explanation', 20, 45);
      
      // Add explanation content with word wrapping
      pdf.setFontSize(12);
      const splitExplanation = pdf.splitTextToSize(lesson.explanation || 'No explanation available.', pageWidth - 40);
      pdf.text(splitExplanation, 20, 55);
      
      let yPosition = 55 + (splitExplanation.length * 7);
      
      // Add learning outcomes
      if (lesson.learningOutcomes && lesson.learningOutcomes.length > 0) {
        yPosition += 10;
        pdf.setFontSize(16);
        pdf.text('Learning Outcomes', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        lesson.learningOutcomes.forEach((outcome, index) => {
          pdf.text(`${index + 1}. ${outcome}`, 20, yPosition);
          yPosition += 7;
          
          // Add new page if needed
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
        });
      }
      
      // Add activities
      if (lesson.activities && lesson.activities.length > 0) {
        yPosition += 10;
        pdf.setFontSize(16);
        pdf.text('Activities', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        lesson.activities.forEach((activity, index) => {
          pdf.text(`Activity ${index + 1}:`, 20, yPosition);
          yPosition += 7;
          
          const splitActivity = pdf.splitTextToSize(activity, pageWidth - 40);
          pdf.text(splitActivity, 25, yPosition);
          yPosition += (splitActivity.length * 7) + 5;
          
          // Add new page if needed
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
        });
      }
      
      // Add quiz questions
      if (lesson.quiz && lesson.quiz.length > 0) {
        // Add new page for quiz
        pdf.addPage();
        yPosition = 20;
        
        pdf.setFontSize(16);
        pdf.text('Quiz Questions', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        lesson.quiz.forEach((question, index) => {
          pdf.text(`Question ${index + 1}: ${question.question}`, 20, yPosition);
          yPosition += 10;
          
          question.options.forEach((option, optIndex) => {
            const letter = String.fromCharCode(65 + optIndex);
            const isCorrect = letter === question.answer;
            
            if (isCorrect) {
              pdf.setTextColor(0, 128, 0); // Green for correct answer
            }
            
            pdf.text(`${letter}. ${option}`, 25, yPosition);
            yPosition += 7;
            
            if (isCorrect) {
              pdf.setTextColor(0, 0, 0); // Reset to black
            }
          });
          
          yPosition += 5;
          
          // Add new page if needed
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
        });
      }
      
      // Save the PDF
      pdf.save(`${lesson.title || lesson.topic}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    // Implement share functionality
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };
  
  const handleDeleteLesson = async () => {
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/lessons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        navigate('/dashboard');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete lesson');
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setError('An error occurred while deleting the lesson');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleScheduleLesson = () => {
    // In a real app, this would save to a database
    if (scheduleDate) {
      alert(`Lesson scheduled for ${scheduleDate}`);
      setShowScheduleModal(false);
    } else {
      alert('Please select a date');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !lesson) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-4">{error || "The lesson you're looking for doesn't exist or you don't have permission to view it."}</p>
          <Link to="/dashboard" className="btn btn-primary mt-6 inline-block">Back to Dashboard</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4">
        <header className="mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <h1 className="text-3xl font-bold">{lesson.title || lesson.topic}</h1>
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              <button 
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-md text-sm"
              >
                <FaCalendarAlt className="mr-2" /> Schedule
              </button>
              <button 
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <FaDownload className="mr-2" /> PDF
                  </>
                )}
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
              >
                <FaShare className="mr-2" /> Share
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm"
              >
                <FaTrash className="mr-2" /> Delete
              </button>
            </div>
          </div>
          <div className="mt-2 text-gray-600">
            <span className="mr-4">Grade: {lesson.gradeLevel}</span>
            <span>Subject: {lesson.subject}</span>
          </div>
        </header>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Delete Lesson</h3>
              <p className="mb-6">Are you sure you want to delete this lesson? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteLesson}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash className="mr-2" /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Schedule Lesson</h3>
              <p className="mb-4">Select a date to schedule this lesson:</p>
              
              <div className="mb-6">
                <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="scheduleDate"
                  name="scheduleDate"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleScheduleLesson}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center"
                >
                  <FaCalendarAlt className="mr-2" /> Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={contentRef}>
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
            <button 
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'improve' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'}`} 
              onClick={() => setActiveTab('improve')}
            >
              Improve
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
                          {question.options && question.options.map((option, optIndex) => (
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
                          resource.type === 'image' ? 'bg-green-500' : 
                          resource.type === 'document' ? 'bg-orange-500' : 'bg-gray-500'
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
            
            {activeTab === 'improve' && (
              <div className="improve">
                <LessonImprovement lessonId={id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LessonView;
