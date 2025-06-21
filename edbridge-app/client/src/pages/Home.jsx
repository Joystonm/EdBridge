import React from 'react';
import { Link } from 'react-router-dom';
import { FaLightbulb, FaSearch, FaQuestionCircle, FaVideo, FaRocket } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary-600">EdBridge</h1>
          <div className="space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
          </div>
        </div>
      </header>

      <section className="py-12 md:py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Real-Time Curriculum Enhancer for Teachers
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Empower your teaching with AI-driven lesson plans, examples, and activities — tailored in seconds.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" className="btn btn-primary text-lg py-3 px-8">
              Get Started Free
            </Link>
            <a href="#how-it-works" className="btn btn-secondary text-lg py-3 px-8">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white" id="features">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How EdBridge Helps Teachers</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FaLightbulb size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Clear Explanations</h3>
              <p className="text-gray-600">
                Get grade-appropriate explanations of any topic, tailored to your students' level of understanding.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FaQuestionCircle size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Auto-Generated Quizzes</h3>
              <p className="text-gray-600">
                Create assessment questions instantly with multiple-choice options and answer explanations.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FaRocket size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Creative Activities</h3>
              <p className="text-gray-600">
                Get fresh ideas for hands-on activities and experiments that reinforce learning objectives.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FaSearch size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-World Examples</h3>
              <p className="text-gray-600">
                Connect classroom concepts to current events and real-world applications that students can relate to.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FaVideo size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Curated Resources</h3>
              <p className="text-gray-600">
                Discover videos, articles, and interactive content from trusted educational sources.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Save Time</h3>
              <p className="text-gray-600">
                Create complete lesson materials in minutes instead of hours, freeing up time for what matters most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50" id="how-it-works">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How EdBridge Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Input Your Topic</h3>
              <p className="text-gray-600">
                Enter the topic, subject, and grade level you're teaching.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">AI Processing</h3>
              <p className="text-gray-600">
                Our AI generates explanations, activities, quizzes, and finds relevant resources.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Ready to Teach</h3>
              <p className="text-gray-600">
                Use the materials in your classroom, download as PDF, or save for later.
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link to="/signup" className="btn btn-primary text-lg py-3 px-8">
              Try It Now
            </Link>
          </div>
        </div>
      </section>

      {/* Example Use Case */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">See EdBridge in Action</h2>
          
          <div className="bg-gray-50 rounded-lg p-6 md:p-8 shadow-md">
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-xl font-bold mb-2">Teacher Input:</h3>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-gray-800">"I'm teaching Photosynthesis to 7th grade science students tomorrow."</p>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-4">EdBridge Output:</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-primary-600 mb-2">Explanation</h4>
                <div className="bg-white p-4 rounded border border-gray-200 mb-6">
                  <p className="text-gray-800">
                    Photosynthesis is the process plants use to make their own food. Plants take in carbon dioxide from the air through tiny openings called stomata in their leaves. They absorb water through their roots. Using energy from sunlight captured by chlorophyll (the green pigment in leaves), plants convert carbon dioxide and water into glucose (sugar) and oxygen...
                  </p>
                </div>
                
                <h4 className="font-semibold text-primary-600 mb-2">Quiz Questions</h4>
                <div className="bg-white p-4 rounded border border-gray-200">
                  <p className="font-medium mb-2">1. What gas do plants take in during photosynthesis?</p>
                  <ul className="list-disc pl-5 mb-2 text-gray-700">
                    <li>Oxygen</li>
                    <li>Carbon Dioxide</li>
                    <li>Nitrogen</li>
                    <li>Hydrogen</li>
                  </ul>
                  <p className="text-green-700 text-sm">Answer: B. Carbon Dioxide</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-primary-600 mb-2">Activities</h4>
                <div className="bg-white p-4 rounded border border-gray-200 mb-6">
                  <p className="font-medium mb-1">1. Leaf Starch Test</p>
                  <p className="text-gray-700 mb-3">
                    Students can perform a simple experiment to show that photosynthesis produces starch by testing variegated leaves with iodine solution.
                  </p>
                  
                  <p className="font-medium mb-1">2. Photosynthesis Diagram</p>
                  <p className="text-gray-700">
                    Create a visual diagram showing how sunlight, water, and carbon dioxide combine to create glucose and oxygen.
                  </p>
                </div>
                
                <h4 className="font-semibold text-primary-600 mb-2">Resources</h4>
                <div className="bg-white p-4 rounded border border-gray-200">
                  <div className="mb-3 pb-3 border-b border-gray-100">
                    <p className="font-medium">Photosynthesis: Crash Course Biology</p>
                    <p className="text-xs text-gray-500">youtube.com | Video</p>
                  </div>
                  <div>
                    <p className="font-medium">NASA's Plant Growth Experiments in Space</p>
                    <p className="text-xs text-gray-500">nasa.gov | Article</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Teaching?</h2>
          <p className="text-xl mb-8">
            Join thousands of educators using EdBridge to create engaging, up-to-date lesson materials in minutes.
          </p>
          <Link to="/signup" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-md font-medium text-lg inline-block">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold">EdBridge</h2>
              <p className="text-gray-400">Real-Time Curriculum Enhancer for Teachers</p>
            </div>
            <div className="flex space-x-6">
              <a href="#features" className="hover:text-gray-300">Features</a>
              <a href="#how-it-works" className="hover:text-gray-300">How It Works</a>
              <Link to="/login" className="hover:text-gray-300">Login</Link>
              <Link to="/signup" className="hover:text-gray-300">Sign Up</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} EdBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
