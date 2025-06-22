# EdBridge - Real-Time Curriculum Enhancer for Teachers

EdBridge is an AI-powered platform that helps teachers create, enhance, and personalize curriculum materials in real-time. By leveraging Groq's LLM capabilities and Tavily's search functionality, EdBridge streamlines the lesson planning process and provides teachers with high-quality educational resources.

## 🚀 Features

- **AI-Powered Lesson Generation**: Create complete lesson plans with explanations, activities, and assessments
- **Auto-Generated Quizzes**: Get grade-appropriate assessment questions with answer explanations
- **Real-World Examples**: Connect classroom concepts to current events and applications
- **Resource Discovery**: Find relevant educational videos, articles, and interactive content
- **Time-Saving**: Create complete lesson materials in minutes instead of hours
- **Personalization**: Tailor content to specific grade levels and subjects

## 🛠️ Tech Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **External APIs**:
  - Groq (LLM for content generation)
  - Tavily (Search API for educational resources)
- **Authentication**: JWT

## 🏁 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Groq API key
- Tavily API key

### Installation

1. Clone the repository

   ```
   git clone https://github.com/Joystonm/edbridge-app.git
   cd edbridge-app
   ```

2. Install server dependencies

   ```
   cd server
   npm install
   cp .env.example .env
   ```

3. Install client dependencies

   ```
   cd ../client
   npm install
   cp .env.example .env
   ```

4. Configure environment variables
   - Update the `.env` files in both the server and client directories with your API keys and configuration

### Running the Application

1. Start the server

   ```
   cd server
   npm run dev
   ```

2. Start the client

   ```
   cd client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## 📋 How EdBridge Works

### Step 1: Input from Teacher

- Teacher enters:
  - Topic (e.g., "Photosynthesis")
  - Grade Level (e.g., "7th")
  - Subject (e.g., "Biology")

### Step 2: AI Processing

- **Groq AI**:
  - Summarizes the topic in grade-appropriate language
  - Generates 3-5 quiz questions with answers
  - Creates activity/experiment suggestions
  - Provides key learning outcomes
- **Tavily API**:
  - Pulls live, real-world examples related to the topic
  - Finds relevant educational videos and articles
  - Discovers interactive resources

### Step 3: Output to Dashboard

- Displays results in an organized, tabbed interface
- Options to:
  - Save to user dashboard
  - Download as PDF
  - Share via link

## 🧪 Example Use Case

**Teacher Input**: "I'm teaching Photosynthesis to 7th grade science students tomorrow."

**EdBridge Output**:

- **Explanation**: Clear paragraph explaining how plants make food using sunlight, water, and carbon dioxide
- **Quiz Questions**:
  - What gas do plants take in during photosynthesis?
  - Which part of the plant absorbs sunlight?
- **Activities**:
  - Perform a leaf starch test
  - Create a diagram showing the photosynthesis process
- **Resources**:
  - Link to YouTube video on photosynthesis experiments
  - Article on NASA's plant growth experiments in space

## 🔮 Future Enhancements

- Multi-language support for global classrooms
- Student mode with interactive learning paths
- Analytics dashboard for tracking usage and performance
- Voice input for conversational lesson creation
- Integration with popular LMS platforms
