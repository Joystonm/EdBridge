import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { FaSpinner } from 'react-icons/fa';

const LessonCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    topic: '',
    subject: '',
    gradeLevel: '',
    additionalNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Show a message that this might take a minute
      setError('Generating your lesson plan. This may take up to a minute...');

      // Make API call to generate lesson
      const response = await fetch('/api/ai/generate-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        navigate(`/lessons/${data.data._id}`);
      } else {
        setError(data.message || 'Failed to create lesson. Please try again.');
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      setError('Network error or server unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Create New Lesson</h1>
        
        {error && (
          <div className={`mb-6 p-4 ${error.includes('Generating') ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700' : 'bg-red-50 border-l-4 border-red-500 text-red-700'}`}>
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="topic" className="font-medium text-gray-700">Topic</label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="e.g., Photosynthesis, Civil War, Fractions"
                className="mt-1"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="subject" className="font-medium text-gray-700">Subject</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="mt-1"
                required
              >
                <option value="">Select Subject</option>
                <option value="Math">Math</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="History">History</option>
                <option value="Social Studies">Social Studies</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Art">Art</option>
                <option value="Music">Music</option>
                <option value="Physical Education">Physical Education</option>
                <option value="Foreign Language">Foreign Language</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="gradeLevel" className="font-medium text-gray-700">Grade Level</label>
              <select
                id="gradeLevel"
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
                className="mt-1"
                required
              >
                <option value="">Select Grade</option>
                <option value="K">Kindergarten</option>
                <option value="1">1st Grade</option>
                <option value="2">2nd Grade</option>
                <option value="3">3rd Grade</option>
                <option value="4">4th Grade</option>
                <option value="5">5th Grade</option>
                <option value="6">6th Grade</option>
                <option value="7">7th Grade</option>
                <option value="8">8th Grade</option>
                <option value="9">9th Grade</option>
                <option value="10">10th Grade</option>
                <option value="11">11th Grade</option>
                <option value="12">12th Grade</option>
                <option value="College">College</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="additionalNotes" className="font-medium text-gray-700">Additional Notes (Optional)</label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                placeholder="Any specific requirements or focus areas? E.g., 'Focus on CBSE curriculum' or 'Include hands-on activities'"
                className="mt-1"
                rows="3"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full btn btn-primary mt-6 py-3 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Generating Lesson...
                </>
              ) : 'Create Lesson'}
            </button>
          </form>
        </div>
        
        <div className="mt-6 bg-gray-50 p-4 rounded-md text-sm text-gray-600">
          <p className="font-medium mb-2">Note:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Lesson generation may take up to a minute to complete.</li>
            <li>The AI will create content appropriate for the selected grade level.</li>
            <li>You can edit the generated lesson after creation if needed.</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default LessonCreate;
