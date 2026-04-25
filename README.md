# 🎓 Campus Pocket - Academic Portal

Campus Pocket is a modern, AI-powered academic management platform designed to bridge the gap between schools, parents, and students. Built with **React Native (Expo)** and **Supabase**, it provides real-time insights, automated scheduling, and performance analytics to enhance the educational experience.

## 🚀 Key Features

### 👨‍👩‍👧 Parent Portal
- **Child Dashboard**: Switch between multiple children to see their individual academic profiles.
- **Smart Analysis (AI Insights)**: Uses **Linear Regression Growth Modeling (LRGM)** to analyze historical quiz and exam data, providing personalized growth trends and study tips.
- **Academic Info**: Direct access to Class Mentor contact details and a dynamic weekly timetable.
- **Performance Tab**: View detailed report cards across multiple academic years and examination terms (SI-1, SI-2, Half-Yearly, etc.).
- **Attendance & Fees**: Track monthly attendance trends and manage school fee payments with status indicators.
- **Achievements**: A digital trophy cabinet celebrating your child's academic, sports, and extracurricular recognition.

### 👨‍🎓 Student Portal
- **Study Hub**: View your personalized weekly timetable and upcoming exam schedule.
- **Growth Tracker**: See your own AI-generated performance summaries to identify strengths and areas for improvement.
- **Event Slideshow**: Stay updated with school events (Sports Day, Science Fair, etc.) through an interactive dashboard.

### 📅 Academic Calendar
- **Categorized Events**: Holidays, events, and exams are clearly categorized and color-coded.
- **Exam indicators**: Never miss an assessment with clear markers for upcoming tests and mid-terms.

### 🎮 Gamification & Engagement
- **Student Streaks**: Track daily attendance and study streaks to encourage consistency.
- **Badge Shelf**: Earn achievement badges for perfect attendance, study milestones, and late-night study sessions.

### 🤖 Student Curriculum Chatbot
- **Context-Aware Assistance**: Ask questions about specific subjects powered by Groq API (Llama 3 8B).
- **Focused Learning**: The chatbot keeps conversations strictly to academic topics to maintain focus.

### 🌐 Additional Capabilities
- **Offline Read Cache**: Access essential data like attendance, grades, and events even without an active internet connection.
- **Multi-Language Support**: Available in English, Telugu, and Hindi for broader accessibility.

## ✨ Unique AI Capabilities

Campus Pocket stands out by integrating advanced AI models seamlessly into both the parent and student experiences, powered by the **Groq API (Llama 3 8B)** and custom algorithms:

### 1. AI Parent Performance Summary
Parents can instantly generate a plain-language summary of their child's academic health. The AI analyzes multiple data points (attendance, grades, pending assignments, upcoming exams, fee status) and provides:
- **Strengths & Areas for Improvement**: Easy-to-understand breakdown of where the student excels and where they need help.
- **Cost-Efficient Minimal RAG**: Instead of sending massive datasets to the LLM, the app pre-aggregates data using efficient SQL queries into a compact JSON context. This drastically reduces token usage and API costs.
- **Smart Caching**: Summaries are cached in the database for 24 hours to ensure fast loading and zero redundant API calls.

### 2. Student Curriculum Chatbot
A built-in study assistant designed specifically for the student's grade level.
- **Subject-Restricted via Local Checks**: The chatbot is explicitly constrained to answer only questions related to enrolled subjects. Off-topic queries are rejected *client-side* before any API call is made, saving significant AI credits.
- **Minimal RAG Implementation**: Injects the student's specific curriculum context and grade level into the prompt dynamically, ensuring highly relevant answers without complex or expensive vector databases.
- **Safety & Usage Limits**: Built-in limits (max messages per session, daily message caps) ensure the tool is used constructively and stays well within the free tier limits of the Groq API.

### 3. LRGM (Linear Regression Growth Modeling)
The platform features a custom algorithmic implementation of **Linear Regression Growth Modeling**. Unlike static reports, it:
1. Maps academic performance across chronological exam terms.
2. Calculates the **Slope of Improvement** using multi-year data points.
3. Identifies **Consistency Metrics** to predict future grade outcomes.
4. Generates **Actionable Feedback** based on specific subject-wise variances.

## 🛠️ Tech Stack

- **Frontend Framework**: React Native, Expo (SDK 51+), Expo Router
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Data Visualization**: Victory Native + react-native-svg
- **Icons**: Lucide-React-Native
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Database Features**: Real-time subscriptions and RLS (Row Level Security)
- **AI Models**: Groq API (Llama 3 8B)
- **Notifications & SMS**: Expo Push Notifications, Fast2SMS REST API

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- Expo Go app on your mobile device
- Supabase Project (with Auth, Storage, and Realtime enabled)
- Groq API Account (for free-tier Llama 3)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/ft-harshtz0/campus-pocket.git
   cd Campus-Pocket
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add your keys:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
   ```

4. Run the application:
   ```bash
   npx expo start --clear
   ```

## 📂 Project Structure

- `app/`: Expo Router file-based navigation.
  - `(auth)/`: Login and OTP flows.
  - `(parent)/`: RBAC guarded parent dashboard and features.
  - `(student)/`: RBAC guarded student dashboard and features.
- `components/`: Reusable UI components (ChildSwitcher, ChatbotModal, ScoreSparkline, etc.).
- `hooks/`: Custom React hooks (useChild, useAuthStore, etc.).
- `lib/`: Clients for Supabase, Groq, and Notification helpers.
- `constants/`: RBAC roles, trigger types, typography, and color tokens.

---
*Built with ❤️ for the future of education.*
