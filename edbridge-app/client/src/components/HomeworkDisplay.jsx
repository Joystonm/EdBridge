import React, { useState, useRef } from 'react';
import { FaDownload, FaSpinner } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const HomeworkDisplay = ({ homework, lessonTitle, lessonSubject, lessonGrade }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [isDownloading, setIsDownloading] = useState(false);
  const homeworkRef = useRef(null);
  
  if (!homework) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    
    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF();
      
      // Set document properties
      pdf.setProperties({
        title: homework.title || 'Homework Assignment',
        subject: lessonSubject || '',
        author: 'EdBridge',
        keywords: 'homework, education',
        creator: 'EdBridge'
      });
      
      // Add header
      pdf.setFontSize(20);
      pdf.setTextColor(0, 0, 150);
      pdf.text(homework.title || 'Homework Assignment', 105, 20, { align: 'center' });
      
      // Add subject and grade info
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      const subjectGradeText = `${lessonSubject || ''} ${lessonGrade ? `- Grade ${lessonGrade}` : ''}`;
      pdf.text(subjectGradeText, 105, 30, { align: 'center' });
      
      // Add description
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Description:', 20, 45);
      
      const descriptionLines = pdf.splitTextToSize(homework.description || '', 170);
      pdf.text(descriptionLines, 20, 52);
      
      // Add due date if available
      let yPosition = 52 + (descriptionLines.length * 7);
      if (homework.dueDate) {
        pdf.setFontSize(11);
        pdf.setTextColor(200, 0, 0);
        pdf.text(`Due Date: ${formatDate(homework.dueDate)}`, 20, yPosition);
        yPosition += 10;
      } else {
        yPosition += 5;
      }
      
      // Add total points
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Total Points: ${homework.totalPoints}`, 20, yPosition);
      yPosition += 15;
      
      // Group questions by type
      const questionsByType = homework.questions.reduce((acc, question) => {
        if (!acc[question.type]) {
          acc[question.type] = [];
        }
        acc[question.type].push(question);
        return acc;
      }, {});
      
      // Add questions by type
      Object.entries(questionsByType).forEach(([type, questions]) => {
        // Add section header for question type
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text(getQuestionTypeLabel(type), 20, yPosition);
        yPosition += 8;
        
        // Add questions
        questions.forEach((question, index) => {
          // Check if we need a new page
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
          
          // Question number and text
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          pdf.text(`${index + 1}. ${question.question} (${question.points} ${question.points === 1 ? 'point' : 'points'})`, 20, yPosition);
          yPosition += 8;
          
          // For MCQs, add options
          if (question.type === 'mcq' && question.options) {
            question.options.forEach((option, optIndex) => {
              const letter = String.fromCharCode(65 + optIndex);
              pdf.setFontSize(10);
              
              // Highlight correct answer in teacher's copy
              if (letter === question.answer) {
                pdf.setTextColor(0, 100, 0);
              } else {
                pdf.setTextColor(0, 0, 0);
              }
              
              pdf.text(`${letter}. ${option}`, 30, yPosition);
              yPosition += 6;
            });
          }
          
          // Add space between questions
          yPosition += 5;
          
          // Check if we need a new page
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
        });
        
        // Add space between sections
        yPosition += 10;
        
        // Check if we need a new page
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
      });
      
      // Create a student version (without answers)
      pdf.addPage();
      
      // Add header for student version
      pdf.setFontSize(20);
      pdf.setTextColor(0, 0, 150);
      pdf.text(`${homework.title || 'Homework Assignment'} - Student Copy`, 105, 20, { align: 'center' });
      
      // Add subject and grade info
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(subjectGradeText, 105, 30, { align: 'center' });
      
      // Add student name field
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Name: ________________________________', 20, 45);
      
      // Add description
      pdf.text('Description:', 20, 60);
      const studentDescLines = pdf.splitTextToSize(homework.description || '', 170);
      pdf.text(studentDescLines, 20, 67);
      
      // Reset y position for student version
      yPosition = 67 + (studentDescLines.length * 7);
      
      // Add due date if available
      if (homework.dueDate) {
        pdf.setFontSize(11);
        pdf.setTextColor(200, 0, 0);
        pdf.text(`Due Date: ${formatDate(homework.dueDate)}`, 20, yPosition);
        yPosition += 10;
      } else {
        yPosition += 5;
      }
      
      // Add total points
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Total Points: ${homework.totalPoints}`, 20, yPosition);
      yPosition += 15;
      
      // Add questions by type (without answers)
      Object.entries(questionsByType).forEach(([type, questions]) => {
        // Add section header for question type
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text(getQuestionTypeLabel(type), 20, yPosition);
        yPosition += 8;
        
        // Add questions
        questions.forEach((question, index) => {
          // Check if we need a new page
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
          
          // Question number and text
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          pdf.text(`${index + 1}. ${question.question} (${question.points} ${question.points === 1 ? 'point' : 'points'})`, 20, yPosition);
          yPosition += 8;
          
          // For MCQs, add options (without highlighting the answer)
          if (question.type === 'mcq' && question.options) {
            question.options.forEach((option, optIndex) => {
              const letter = String.fromCharCode(65 + optIndex);
              pdf.setFontSize(10);
              pdf.setTextColor(0, 0, 0);
              pdf.text(`${letter}. ${option}`, 30, yPosition);
              yPosition += 6;
            });
          }
          
          // For short answer questions, add lines for answers
          if (question.type === 'short_answer') {
            pdf.setDrawColor(200, 200, 200);
            for (let i = 0; i < 3; i++) {
              pdf.line(30, yPosition + (i * 6), 190, yPosition + (i * 6));
              yPosition += 6;
            }
          }
          
          // For diagram questions, add space for drawing
          if (question.type === 'diagram') {
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(30, yPosition, 160, 40);
            yPosition += 45;
          }
          
          // For creative questions, add more lines
          if (question.type === 'creative') {
            pdf.setDrawColor(200, 200, 200);
            for (let i = 0; i < 5; i++) {
              pdf.line(30, yPosition + (i * 6), 190, yPosition + (i * 6));
              yPosition += 6;
            }
          }
          
          // Add space between questions
          yPosition += 5;
          
          // Check if we need a new page
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
        });
        
        // Add space between sections
        yPosition += 10;
        
        // Check if we need a new page
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
      });
      
      // Save the PDF
      pdf.save(`${homework.title || 'homework'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const filterQuestions = (type) => {
    if (type === 'all') {
      return homework.questions;
    }
    return homework.questions.filter(q => q.type === type);
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'mcq': return 'Multiple Choice';
      case 'short_answer': return 'Short Answer';
      case 'diagram': return 'Diagram-based';
      case 'creative': return 'Creative';
      default: return 'Other';
    }
  };

  const renderQuestion = (question, index) => {
    return (
      <div key={index} className="bg-white rounded-lg shadow-sm p-4 mb-4 border-l-4 border-blue-500">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-medium">
            Question {index + 1} <span className="text-sm font-normal text-gray-500">({getQuestionTypeLabel(question.type)})</span>
          </h4>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            {question.points} {question.points === 1 ? 'point' : 'points'}
          </span>
        </div>
        
        <p className="mb-3">{question.question}</p>
        
        {question.type === 'mcq' && question.options && (
          <div className="ml-4 mb-3">
            {question.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-start mb-1">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${
                  String.fromCharCode(65 + optIndex) === question.answer 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {String.fromCharCode(65 + optIndex)}
                </div>
                <p>{option}</p>
              </div>
            ))}
          </div>
        )}
        
        {question.answer && question.type !== 'mcq' && (
          <div className="mb-3">
            <p className="font-medium text-sm text-gray-700">Answer/Grading Criteria:</p>
            <p className="ml-4">{question.answer}</p>
          </div>
        )}
        
        {question.explanation && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Explanation:</span> {question.explanation}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Get unique question types
  const questionTypes = ['all', ...new Set(homework.questions.map(q => q.type))];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">{homework.title}</h2>
          <p className="text-gray-600 mb-2">{homework.description}</p>
          {homework.dueDate && (
            <p className="text-sm text-gray-500">
              Due: {formatDate(homework.dueDate)}
            </p>
          )}
        </div>
        <div className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded">
          Total: {homework.totalPoints} points
        </div>
      </div>
      
      {/* Question type tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex flex-wrap -mb-px">
          {questionTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === type
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {type === 'all' ? 'All Questions' : getQuestionTypeLabel(type)}
              {type !== 'all' && (
                <span className="ml-1 bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-0.5">
                  {homework.questions.filter(q => q.type === type).length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Questions */}
      <div>
        {filterQuestions(activeTab).map((question, index) => renderQuestion(question, index))}
      </div>
      
      <div className="flex justify-end mt-6 gap-3">
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition duration-300">
          Edit
        </button>
        <button 
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300 flex items-center"
        >
          {isDownloading ? (
            <>
              <FaSpinner className="animate-spin mr-2" /> Generating PDF...
            </>
          ) : (
            <>
              <FaDownload className="mr-2" /> Download PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default HomeworkDisplay;
