import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LessonCreate from './pages/LessonCreate';
import LessonView from './pages/LessonView';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Test from './pages/Test';
import Profile from './pages/Profile';
import Forum from './pages/Forum';
import ForumPost from './pages/ForumPost';
import ForumCreate from './pages/ForumCreate';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lessons/create" element={<LessonCreate />} />
        <Route path="/lessons/:id" element={<LessonView />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/test" element={<Test />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/new" element={<ForumCreate />} />
        <Route path="/forum/:id" element={<ForumPost />} />
      </Routes>
    </Router>
  );
}

export default App;

