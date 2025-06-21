const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: [true, 'Please provide a topic'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    trim: true
  },
  gradeLevel: {
    type: String,
    required: [true, 'Please provide a grade level'],
    trim: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
    default: function() {
      return `${this.topic} for Grade ${this.gradeLevel}`;
    }
  },
  explanation: {
    type: String,
    default: ''
  },
  learningOutcomes: {
    type: [String],
    default: []
  },
  activities: {
    type: [String],
    default: []
  },
  quiz: [
    {
      question: String,
      options: [String],
      answer: String,
      explanation: String
    }
  ],
  resources: [
    {
      title: String,
      description: String,
      url: String,
      type: {
        type: String,
        enum: ['video', 'article', 'interactive', 'image', 'document', 'other'],
        default: 'other'
      }
    }
  ],
  realWorldExamples: {
    type: [String],
    default: []
  },
  additionalNotes: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lesson', LessonSchema);
