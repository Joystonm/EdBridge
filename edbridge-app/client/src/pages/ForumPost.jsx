import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { FaUser, FaReply, FaThumbsUp, FaTrash, FaEdit, FaSpinner } from 'react-icons/fa';

const ForumPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Get user ID from token
        try {
          const userResponse = await fetch('/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserId(userData.data._id);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }

        const response = await fetch(`/api/forum/${id}`, {
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
          setPost(data.data);
        } else {
          setError(data.message || 'Failed to fetch post');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('An error occurred while fetching the post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/forum/${id}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setPost(data.data);
      } else {
        setError(data.message || 'Failed to like post');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      setError('An error occurred while liking the post');
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/forum/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: comment })
      });

      const data = await response.json();
      
      if (response.ok) {
        setPost(data.data);
        setComment('');
      } else {
        setError(data.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('An error occurred while adding your comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/forum/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        navigate('/forum');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('An error occurred while deleting the post');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/forum/${id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setPost(data.data);
      } else {
        setError(data.message || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('An error occurred while deleting the comment');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  if (error || !post) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-4">{error || "The post you're looking for doesn't exist or you don't have permission to view it."}</p>
          <Link to="/forum" className="btn btn-primary mt-6 inline-block">Back to Forum</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link to="/forum" className="text-primary-600 hover:text-primary-800">
            &larr; Back to Forum
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
              
              {post.user === userId && (
                <div className="flex space-x-2">
                  <Link 
                    to={`/forum/${post._id}/edit`}
                    className="p-2 text-gray-500 hover:text-primary-600"
                  >
                    <FaEdit />
                  </Link>
                  <button 
                    onClick={handleDeletePost}
                    className="p-2 text-gray-500 hover:text-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <FaUser className="mr-1" />
                {post.userName}
              </div>
              <span className="mx-2">•</span>
              <span>{formatDate(post.createdAt)}</span>
              <span className="mx-2">•</span>
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                {post.category}
              </span>
            </div>
            
            <div className="prose max-w-none mb-6">
              <p>{post.content}</p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleLike}
                  className="flex items-center text-gray-500 hover:text-primary-600"
                >
                  <FaThumbsUp className="mr-1" />
                  <span>{post.likes} likes</span>
                </button>
                
                <div className="flex items-center text-gray-500">
                  <FaReply className="mr-1" />
                  <span>{post.comments ? post.comments.length : 0} replies</span>
                </div>
              </div>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Comments</h2>
            
            {post.comments && post.comments.length > 0 ? (
              <div className="space-y-6">
                {post.comments.map((comment) => (
                  <div key={comment._id} className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <div className="flex items-center">
                          <FaUser className="mr-1" />
                          {comment.userName}
                        </div>
                        <span className="mx-2">•</span>
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                      
                      {comment.user === userId && (
                        <button 
                          onClick={() => handleDeleteComment(comment._id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <FaTrash size={12} />
                        </button>
                      )}
                    </div>
                    
                    <p className="text-gray-800">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Add a Comment</h2>
            
            <form onSubmit={handleSubmitComment}>
              <div className="mb-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your comment here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <button 
                type="submit"
                className="btn btn-primary flex items-center justify-center"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaReply className="mr-2" />
                    Post Comment
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForumPost;
