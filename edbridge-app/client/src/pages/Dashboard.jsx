import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch } from 'react-icons/fa';
import Layout from '../components/Layout';

const Dashboard = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch user's lessons from API
    const fetchLessons = async () => {
      try {
        // Replace with actual API call
        const response = await fetch('/api/lessons', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.status === 401) {
          // Unauthorized, token might be expired
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        
        const data = await response.json();
        
        if (response.ok) {
          setLessons(data.data || []);
        } else {
          throw new Error(data.message || 'Failed to fetch lessons');
        }
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [navigate]);

  // Filter lessons based on search term and subject filter
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.topic.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         lesson.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || lesson.subject === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Get unique subjects for filter dropdown
  const subjects = ['all', ...new Set(lessons.map(lesson => lesson.subject))];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">My Lessons</h1>
          
          <Link 
            to="/lessons/create" 
            className="btn btn-primary flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Create New Lesson
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search lessons..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="md:w-48">
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Subjects</option>
                {subjects.filter(subject => subject !== 'all').map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {filteredLessons.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">No lessons found</h2>
                <p className="text-gray-500 mb-6">
                  {lessons.length === 0 
                    ? "You haven't created any lessons yet." 
                    : "No lessons match your search criteria."}
                </p>
                {lessons.length === 0 && (
                  <Link to="/lessons/create" className="btn btn-primary inline-block">
                    Create Your First Lesson
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLessons.map((lesson) => (
                  <div key={lesson._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className={`h-2 ${
                      lesson.subject === 'Math' ? 'bg-blue-500' :
                      lesson.subject === 'Science' ? 'bg-green-500' :
                      lesson.subject === 'English' ? 'bg-yellow-500' :
                      lesson.subject === 'History' ? 'bg-red-500' :
                      lesson.subject === 'Social Studies' ? 'bg-purple-500' :
                      lesson.subject === 'Computer Science' ? 'bg-indigo-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg mb-1 line-clamp-1">{lesson.title || lesson.topic}</h3>
                          <div className="text-sm text-gray-600 mb-3">
                            <span className="mr-3">Grade {lesson.gradeLevel}</span>
                            <span>{lesson.subject}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4 line-clamp-2">
                        {lesson.explanation ? 
                          lesson.explanation.substring(0, 100) + '...' : 
                          `A lesson about ${lesson.topic} for grade ${lesson.gradeLevel} students.`
                        }
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Created: {new Date(lesson.createdAt).toLocaleDateString()}
                        </span>
                        <Link 
                          to={`/lessons/${lesson._id}`}
                          className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                        >
                          View Lesson →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
