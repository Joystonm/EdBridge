import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { FaUser, FaEnvelope, FaUserGraduate, FaSave, FaSpinner } from 'react-icons/fa';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('/api/users/me', {
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
          setUser(data.data);
          setFormData({
            name: data.data.name,
            email: data.data.email,
            role: data.data.role
          });
        } else {
          setError(data.message || 'Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('An error occurred while fetching your profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
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
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/updatedetails', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email
        })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.data);
        setSuccess('Profile updated successfully');
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('An error occurred while updating your profile');
    } finally {
      setUpdating(false);
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

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 text-green-700">
            <p>{success}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="name" className="flex items-center font-medium text-gray-700 mb-1">
                    <FaUser className="mr-2 text-gray-500" /> Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="flex items-center font-medium text-gray-700 mb-1">
                    <FaEnvelope className="mr-2 text-gray-500" /> Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role" className="flex items-center font-medium text-gray-700 mb-1">
                    <FaUserGraduate className="mr-2 text-gray-500" /> Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role === 'teacher' ? 'Teacher' : 
                           formData.role === 'administrator' ? 'School Administrator' : 
                           formData.role === 'other' ? 'Other Education Professional' : 
                           formData.role}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="font-medium text-gray-700 mb-1">Member Since</label>
                  <input
                    type="text"
                    value={new Date(user.createdAt).toLocaleDateString()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    disabled
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="btn btn-primary py-2 px-4 flex items-center justify-center"
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" /> Updating...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Account Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {user.lessonCount || 0}
                </div>
                <div className="text-gray-600">Lessons Created</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {user.resourceCount || 0}
                </div>
                <div className="text-gray-600">Saved Resources</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {user.commentCount || 0}
                </div>
                <div className="text-gray-600">Forum Comments</div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </Layout>
  );
};

export default Profile;
