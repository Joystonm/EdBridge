import React from 'react';

const Test = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-primary-600 mb-4">Tailwind CSS Test</h1>
        <p className="text-gray-700 mb-6">
          If you can see this text styled with a gray color and the heading above in the primary color,
          then Tailwind CSS is working correctly!
        </p>
        <div className="space-y-4">
          <div className="bg-primary-100 text-primary-800 p-4 rounded-md">
            This is a primary colored box
          </div>
          <div className="bg-secondary-100 text-secondary-800 p-4 rounded-md">
            This is a secondary colored box
          </div>
          <button className="btn btn-primary w-full">
            Primary Button
          </button>
          <button className="btn btn-secondary w-full">
            Secondary Button
          </button>
        </div>
      </div>
    </div>
  );
};

export default Test;
