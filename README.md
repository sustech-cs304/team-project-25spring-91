<div align=center>

#                                        **SUSTracker**

### (CS304 Software Engineering Project)

</div>

### Description

All-in-one personal health assistant web application designed to help you stay motivated, organized, and on track with your fitness journey. This wellness tracking app can help you set and achieve personalized workout goals, log your daily meals to monitor your calorie intake, and keep a detailed record as well as overall statistics of your completed workouts. With features like AI chatbot assistant to answer ur health and workout related questions, easy gym booking and engaging user competitions, SUSTracker not only promotes healthy habits but also lets you compete with other like-minded individuals to stay motivated.



### Tech Stack

- Frontend

  <p align="left">
      <a href="https://developer.mozilla.org/en-US/docs/Web/HTML" target="_blank" rel="noreferrer">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/38/HTML5_Badge.svg" alt="html5" width="40" height="40"/>
      </a>
      <a href="https://developer.mozilla.org/en-US/docs/Web/CSS" target="_blank" rel="noreferrer">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/62/CSS3_logo.svg" alt="css3" width="40" height="40"/>
      </a>
      <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer"> 
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg" alt="typescript" width="40" height="40"/>
      </a>
      <a href="https://nextjs.org//" target="_blank" rel="noreferrer"> 
          <img src="https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg" alt="next.js" width="70" height="70"/>
      </a>
  </p>

- Backend

  <p align="left">
      <a href="https://nodejs.org/en" target="_blank" rel="noreferrer">
          <img src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg" alt="node.js" width="40" height="40"/>
      </a>
      <a href="https://expressjs.com/" target="_blank" rel="noreferrer">
          <img src="https://img.icons8.com/?size=512&id=SDVmtZ6VBGXt&format=png" alt="express.js" width="40" height="40"/>
      </a>
      <a href="https://www.postgresql.org" target="_blank" rel="noreferrer">
          <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original-wordmark.svg" alt="postgresql" width="40" height="40"/>
  </p>

  

### **Features** 

#### For User,

- #### Training Task Management

  - Users can set fitness goals and track progress.
  - Users can set actual workout goals(exercises, sets, reps) manually or if he can follow his planned goals, he can just do with one click.

- #### Gym Appointment Scheduling

  - Users can choose gyms and buy memberships related to a specific gym with Visa or Master card.
  - User can sees available class sessions depending on specific date, view schedule, select specific time and book.
  - User can see upcoming bookings, confirmed bookings ,membership plans for specific gyms in MyBookings dashboard and can cancel the upcoming bookings and memberships.

- #### Training Statistics Dashboard

  - Displays user training stats: calories consumed and calorie burned in the past 6 and 12 months with the histogram.
  - Display performance metrics such as longest streak, current streak, total completion and completion rate.
  - Display Total Workouts Completed Per Month in the last 5 years with bar graph.
  - Display Top 3 Most Frequently Scheduled Exercises and best records of all time.

- #### Online Competitions

  - User can join fitness challenges related to specific gym created by gym owners.
  - User can see ongoing competitions, available competitions and completed competitions.
  - User can see subtasks under competitions, update the completed unit of task, and track the completion percentage of tasks and competitions.
  - In leaderboard user can see the rank and compare performance with friends or other users.

- #### Diet Program

  - Users can log calorie intake and plan meals to meet fitness goals.
  - Provides basic meal suggestions based on calorie targets.

- #### AI Coach

  - A chatbot answers health/training/workout related questions (implemented with DeepSeek V3 API)

- #### User Setting

  - Update profile picture and personal information(Display Name, DOB, gender, height, weight) .

    

### For Gym Owner,

- #### Owner Dashboard (Gym, Competition Management system)

  - Display number of gyms, number of total bookings, and revenue of this month

  - manage all related to gym, subscription, classes, booking features

  - manage all related to competition features

    

### For Admin,

- #### Admin Dashboard (Admin Management System)

  - The Analytics section provides a clear overview of key platform metrics, including the total number of gyms, users, and gym owners.
  - features a bar chart displaying user sign-up trends by month, offering valuable insights into platform growth over time.
  - features user table which lists detailed information about all registered accounts. You can easily filter users by role or search for specific entries using the built-in search bar, making it simple to manage and monitor user activity.
  - As an administrator, you are also able the view all gyms or create a gym as detailed in the user and gym owner's section.



#### Detail User Documentation (including more features) => [User Documentation](./user-documentation-team91.md)

#### Detail API Documentation (around 115 API endpoints) => [API Documentation](./documents/WorkoutTrackerAPIDocumentation.markdown)

#### Detail Testing Documentation => [Testing Documentation](./documents/TestingDocumentation.md)



### Metrics

#### Lines of Code (LoC) & Number of Source Files

```
-------------------------------------------------------------------------------  
Language                     files          blank        comment           code  
-------------------------------------------------------------------------------  
TypeScript                     146           2356            750          21927  
JavaScript                     103           2650           1262          16031  
Prisma Schema                    1             48              7            301  
CSS                              1             63            116            250  
-------------------------------------------------------------------------------  
SUM:                           251           5117           2135          38509  
-------------------------------------------------------------------------------  
```



#### Cyclomatic Complexity

```
Total cyclomatic complexity for backend/eslint-report-backend.json: 919  
Total cyclomatic complexity for frontend/eslint-report-frontend.json: 2296  
  
--------------------------------------------------  
Overall Project Cyclomatic Complexity: 3215  
--------------------------------------------------  
```



**Number of tables in database = 20**

**Number of API endpoints =**  **115**



- U can also check how metrics are measured, User docs, Developer Docs, Testing, Building, Deployment in Final Documentation => [Final Documentation](./documents/final-report-team91.md)



### Installation

- This is the installation guideline to test our app in your local machine.

  - First of all, make sure u have all necessary packages to run this tech stack (Next, Node(Express)).

  - Clone this repo.

  - Connect with your local or cloud Postgres database in (DATABASE_URL= (your database credentials) in .env file in backend).

  - Backend Setup

    - Navigate to the backend directory:

      ```
      cd backend
      ```

    - Install dependencies:

      ```
      npm i
      ```

    - Build and run with npm:

      ```
      npm run dev
      ```

  - Frontend Setup

    - Navigate to the frontend directory:

      ```
      cd frontend
      ```

    - Install dependencies:

      ```
      npm i
      ```

    - Build and run with npm:

      ```
      npm run dev
      ```



**Note - Since we have fully documented API endpoints for this project, you can implement frontend on your own with your preference framework or language.**



### Contribution

| Name                      | Role     |
| ------------------------- | -------- |
| Wai Yan Kyaw              | Backend  |
| Sean Sovann               | Frontend |
| Kevin Evan Ko             | Frontend |
| Charissa Deanna Angelicha | Frontend |