import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { FaSearch, FaPlus, FaComment, FaEye, FaThumbsUp, FaFilter } from 'react-icons/fa';

const Forum = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        let url = '/api/forum';
        const queryParams = [];
        
        if (searchTerm) {
          queryParams.push(`search=${encodeURIComponent(searchTerm)}`);
        }
        
        if (category) {
          queryParams.push(`category=${encodeURIComponent(category)}`);
        }
        
        if (queryParams.length > 0) {
          url += `?${queryParams.join('&')}`;
        }

        const response = await fetch(url, {
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
          setPosts(data.data);
        } else {
          setError(data.message || 'Failed to fetch forum posts');
        }
      } catch (error) {
        console.error('Error fetching forum posts:', error);
        setError('An error occurred while fetching forum posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [navigate, searchTerm, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    // The search is handled by the useEffect when searchTerm changes
  };

  const categories = [
    'All Categories',
    'Teaching Strategies',
    'Classroom Management',
    'Technology Integration',
    'Subject Specific',
    'Professional Development',
    'Resources',
    'General Discussion'
  ];

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Teacher Community Forum</h1>
          
          <Link 
            to="/forum/new" 
            className="btn btn-primary flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> New Discussion
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search discussions..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="md:w-auto flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              <FaFilter className="mr-2" /> Filters
            </button>
          </form>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value === 'All Categories' ? '' : e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {categories.map((cat, index) => (
                      <option key={index} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No discussions found</h2>
            <p className="text-gray-600 mb-6">
              {searchTerm || category ? 
                "No discussions match your search criteria." : 
                "Be the first to start a discussion!"}
            </p>
            <Link to="/forum/new" className="btn btn-primary">
              Start a New Discussion
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discussion
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link to={`/forum/${post._id}`} className="block">
                          <div className="text-lg font-medium text-primary-600 hover:text-primary-800">
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            by {post.userName} • {formatDate(post.createdAt)}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <div className="flex items-center mr-4">
                            <FaComment className="mr-1" />
                            {post.comments ? post.comments.length : 0}
                          </div>
                          <div className="flex items-center mr-4">
                            <FaEye className="mr-1" />
                            {post.views}
                          </div>
                          <div className="flex items-center">
                            <FaThumbsUp className="mr-1" />
                            {post.likes}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {post.comments && post.comments.length > 0 
                          ? formatDate(post.comments[post.comments.length - 1].createdAt)
                          : formatDate(post.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Forum;
