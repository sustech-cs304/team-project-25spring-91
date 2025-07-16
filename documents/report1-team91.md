# **CS304 Team Project Proposal: Personal Health Assistant**

**Team Members**: Charissa Deanna Angelicha (12310948), Sean Sovann (12312526), Kevin Evan Ko (12310501), Wai Yan Kyaw (12312638)



------



## **Preliminary Requirement Analysis**

### **1. Functional Requirements**

The SUSTracker is a web-based application designed to help users maintain a healthy lifestyle by managing fitness routines, tracking progress, and fostering motivation through social and AI-driven features. Below are the key features of the proposed system:

1. **Training Task Management**
   - Users can create, edit, and delete daily or weekly training tasks (e.g., "Run 5km").
   - Users can set fitness goals (e.g., "Burn 10000 calories this month through exercise") and track progress.
   - The system sends reminders for upcoming workouts (e.g., browser notifications, emails).
   - Based on a dataset of user activity, the system recommends training tasks (e.g., "Try stretching to increase flexibility").
2. **Gym Appointment Scheduling**
   - Users can book gym sessions or classes through the platform.
   - Displays availability based on mock data or integration with a gym’s schedule.
3. **Training Statistics Dashboard**
   - Displays user training stats: calories burned, workout duration, and progress over time.
   - Visualizes data with charts (e.g., line graph, bar graph for weekly calories burned).
   - Tracks progress against fitness goals (e.g., "75% to daily 1000-calorie goal").
4. **Online Competitions**
   - Users can join fitness challenges (e.g., "Most calories burned in a week").
   - Features a leaderboard to compare performance with friends or other users.
5. **Diet Program**
   - Users can log calorie intake and plan meals to meet fitness goals.
   - Provides basic meal suggestions based on calorie targets.
   - Sends periodic reminders to drink water (e.g., every 4 hours via notification).
6. **AI Coach**
   - A chatbot answers health/training questions (e.g., "How do I improve endurance?").
   - Assists with troubleshooting workout issues (e.g., "Rest if you’re sore").



------



### **2. Non-Functional Requirements**

- **Usability**
  - The interface must be intuitive, with clear navigation and minimal learning curve for non-technical users.
  - Features like charts and reminders should be visually appealing and easy to understand.
- **Security**
  - User data (e.g., workout logs, diet info) must be protected with authentication (e.g., email/password login) and encrypted storage.
  - API keys for external services (e.g., LLM API) must be securely managed.
- **Performance**
  - Page load times should be under 2 seconds for a smooth user experience.
  - The system should handle multiple concurrent users without significant lag (scalable for demo purposes).
- **Reliability**
  - The web app should remain stable during testing by multiple users.
- **Portability**
  - The web app should work across modern browsers (Chrome, Firefox, Safari) on desktop and mobile devices.



------



### **3. Data Requirements**

- **User Profile Data**
  - Required: User ID, email, password, name (optional).
  - Source: Collected during registration via a sign-up form.
- **Training Data**
  - Required: Workout details (date, duration, calories burned, type), goals (target calories, timeframe).
  - Source: User input via task management feature; stored in a database.
- **Diet Data**
  - Required: Calorie intake, meal logs (food items, quantities).
  - Source: User input; optionally supplemented by a food database (e.g., Nutritionix API or manual list).
- **Gym Schedule Data**
  - Required: Available session times, class types.
  - Source: Mock data created by the team or fetched from a gym API.
- **Competition Data**
  - Required: Challenge details (e.g., metric, duration), participant scores.
  - Source: Generated from user activity logs and stored in the database.
- **AI Coach Data**
  - Required: User queries, contextual data (e.g., goals, recent workouts).
  - Source: User input; processed via an LLM API (e.g., OpenAI).
- **Hydration Data**
  - Required: Reminder frequency (e.g., every 2 hours).
  - Source: Default settings or user preferences.

**How to Get the Data**: Most data will be user-generated and stored in a database (e.g., Postgres). External APIs (e.g., Nutritionix for diet, Deepseek for AI Coach) will supplement where needed. Mock data will be used for gym scheduling and initial testing.



------



### **4. Technical Requirements**

- **Operating Environment**
  - **Client-Side**: Web-based application accessible via modern browsers (Chrome, Edge, Firefox, Safari) on desktop and mobile.
  - **Server-Side**: Hosted on a cloud platform (e.g., Heroku for back-end, Vercel for front-end) for deployment and demo.
  - **Development**: Local development on team members’ machines (Windows/Mac/Linux).
  
- **Tech Stack**
  - **Programming Language: JavaScript**
  - **Front-End**:
    - **React.js, Next.js(optional)**: For dynamic UI (dashboard, task management, chatbot).
    - **CSS/Material-UI**: For styling and responsive design.
  - **Back-End**:
    - **Node.js + Express.js**: For server-side logic and API endpoints.
    - **Postgres** : For storing user data, workouts, and diet logs 
  - **Authentication**: JSON Web Tokens (JWT) and OAuth
  - **External APIs**:
    - **Deepseek API**: For the AI Coach chatbot.
    - **Nutritionix API**: For diet data.
  - **Notifications**: Browser notifications (Web Push API) or Nodemailer for email reminders.
  - **Version Control**: Git/GitHub for team collaboration.
  - **Testing**: Postman for API testing, manual testing for UI.
  
- **Development Tools**
  - **IDE**: VS Code for coding.
  - **Project Management**:  GitHub Projects for task tracking.
  - **Design**: Figma for wireframes and UI mockups.
  
- **Hardware Requirements**
  - Standard laptops/desktops with a browser and internet access.
  
  - Standard smartphones with a browser and internet access.
  
    


