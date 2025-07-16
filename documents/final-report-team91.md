# **Team Report (Sprint 2)**

# 1. Metrics

#### Description

To measure the complexity of the project, we used four main metrics: **Lines of Code (LoC)**, **number of source files**, **cyclomatic complexity**, and **number of dependencies**. Here's how we did it:

- **LoC & Number of Files**: We used `cloc` to count lines of actual code and the number of source files, ignoring things like `node_modules`, images, and build folders.

- **Cyclomatic Complexity**: We set up ESLint with a complexity plugin to check how complex each function is. Then we used a script to parse the results and sum up the total complexity across the project.

- **Dependencies**: We wrote a script that reads each `package.json` file (frontend and backend) to count how many dependencies and devDependencies are being used.

### 1. Lines of Code (LoC) & Number of Source Files

```bash  
# Using npm (globally)  
npm install -g cloc  
```

Then, from project's root directory:

```bash  
cloc \  
  --exclude-dir=node_modules,.next,dist,build,coverage,public,uploads \  --exclude-ext=env,log,stackdump,map,ico,lock,sql,svg,jpg,png,json,md,toml \  frontend \  backend  # To ALSO exclude backend tests:  
cloc \  
  --exclude-dir=node_modules,.next,dist,build,coverage,public,uploads,tests \  --exclude-ext=env,log,stackdump,map,ico,lock,sql,svg,jpg,png,json,md,toml \  frontend \  backend```  
  
### 2. Cyclomatic Complexity  
  
### Step 1: Install ESLint and Necessary Plugins  
  
For backend (JavaScript):  
  
```bash  
cd backend  
npm install eslint eslint-plugin-complexity --save-dev```  
  
For  frontend (TypeScript):  
  
```bash  
cd frontend  
  
npm install eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-complexity typescript-eslint --save-dev  
```

### Step 2: Configure ESLint

A. Backend ESLint Configuration (backend/eslint.config.js):

```javascript  
// backend/eslint.config.js  
const globals = require("globals");  
const pluginJs = require("@eslint/js");  
const complexityPlugin = require("eslint-plugin-complexity");  
  
module.exports = [   
  pluginJs.configs.recommended,  
  {    languageOptions: {      ecmaVersion: "latest",      sourceType: "module",      globals: {  
        ...globals.node,      },    },    files: ["src/**/*.js"],    plugins: {      complexity: complexityPlugin,    },    rules: {      "complexity": ["warn", { "max": 1 }],      "no-unused-vars": "warn",    },  },];  
```

B. Frontend ESLint Configuration (frontend/eslint.config.mjs):

```javascript  
// frontend/eslint.config.mjs  
import globals from "globals";  
import tseslint from "typescript-eslint";  
import complexityPlugin from "eslint-plugin-complexity";  
  
export default tseslint.config(  
  {    files: ["src/**/*.{ts,tsx}"],    extends: [...tseslint.configs.recommended],  
    languageOptions: {      parserOptions: {        project: "./tsconfig.json",      },  
      globals: {        ...globals.browser,        ...globals.node,      },  
    },    plugins: {      complexity: complexityPlugin,    },    rules: {      "complexity": ["warn", { "max": 1 }],      "@typescript-eslint/no-unused-vars": "warn",   
    },  
  },);  
```

### Step 3: Run ESLint and Generate JSON Output

For backend:

```bash  
cd backendnpx eslint . --format json --output-file eslint-report-backend.json
```

For frontend:

```bash  
cd frontend  
npx eslint . --format json --output-file eslint-report-frontend.json  
```

### Step 4: Script to Parse JSON and Sum Complexities

place this in project's root directory.

```javascript  
// calculate-total-complexity.js  
import fs from "fs";  
import path from "path";  
  
const reportFiles = [  
  "backend/eslint-report-backend.json","frontend/eslint-report-frontend.json", ];  
  
let totalCyclomaticComplexity = 0;  
const complexityRegex = /complexity of (\d+)/;  
  
reportFiles.forEach((reportPath) => {  
  const absoluteReportPath = path.resolve(reportPath);  let reportData;  
  try {    reportData = JSON.parse(fs.readFileSync(absoluteReportPath, "utf-8"));  } catch (error) {    console.error(`Error reading or parsing ${absoluteReportPath}:`, error);    return;  }  
  
  let fileSpecificComplexitySum = 0;  
  reportData.forEach((fileResult) => {    if (fileResult.messages) {      fileResult.messages.forEach((message) => {        if (message.ruleId === "complexity") {          const match = message.message.match(complexityRegex);          if (match && match[1]) {            const complexityValue = parseInt(match[1], 10);            fileSpecificComplexitySum += complexityValue;          }        }      });    }  });  console.log(    `Total cyclomatic complexity for ${reportPath}: ${fileSpecificComplexitySum}`,  );  totalCyclomaticComplexity += fileSpecificComplexitySum;});  
  
console.log(  
  "\n--------------------------------------------------",);  
console.log(  
  `Overall Project Cyclomatic Complexity: ${totalCyclomaticComplexity}`,);  
console.log(  
  "--------------------------------------------------",);  
```

Run it from project root:

```bash  
node calculate-total-complexity.js  
```

### 3. Number of Dependencies

Create a file, countDeps.js, in project root:

```javascript  
const fs = require("fs");  
const path = require("path");  
  
function countDependencies(projectPath, projectName) {  
  const packageJsonPath = path.join(projectPath, "package.json");  if (fs.existsSync(packageJsonPath)) {    const packageJson = JSON.parse(      fs.readFileSync(packageJsonPath, "utf-8"),    );    const deps = Object.keys(packageJson.dependencies || {}).length;    const devDeps = Object.keys(packageJson.devDependencies || {}).length;    console.log(`\n--- ${projectName} Dependencies ---`);    console.log(`Production Dependencies: ${deps}`);    console.log(`Development Dependencies: ${devDeps}`);    console.log(`Total Dependencies: ${deps + devDeps}`);  } else {    console.log(      `\n--- No package.json found for ${projectName} at ${projectPath} ---`,    );  }}  
  
console.log("Counting dependencies...");  
countDependencies(path.join(__dirname, "frontend"), "Frontend");  
countDependencies(path.join(__dirname, "backend"), "Backend");  
```

Run it from project root:

```bash  
node countDeps.js
```

### Results

### Lines of Code (LoC) & Number of Source Files

```txt  
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

### Cyclomatic Complexity

```txt  
Total cyclomatic complexity for backend/eslint-report-backend.json: 919  
Total cyclomatic complexity for frontend/eslint-report-frontend.json: 2296  
  
--------------------------------------------------  
Overall Project Cyclomatic Complexity: 3215  
--------------------------------------------------  
```

### Number of Dependencies

```txt  
--- Frontend Dependencies ---  
Production Dependencies: 44  
Development Dependencies: 16  
Total Dependencies: 60  
  
--- Backend Dependencies ---  
Production Dependencies: 24  
Development Dependencies: 8  
Total Dependencies: 32  
```

# 2. Documentation

### (1) Documentation for end users
[User Documentation](../user-documentation-team91.md)
### (2) Documentation for developers
## SUSTracker API Documentation

This document provides comprehensive details for developers to understand and utilize the Workout Tracker API. The API is designed to support a fitness tracking application, enabling users to manage exercises, plan and log workouts, track diet, participate in gym classes and competitions, and interact with AI features. It is built using Express.js, Prisma ORM, and PostgreSQL, with authentication mechanisms including JWT and OAuth (Google, GitHub, Microsoft).

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
    - [Authentication Routes](#authentication-routes)
    - [User Routes](#user-routes)
    - [Exercise Routes](#exercise-routes)
    - [Planned Workout Routes](#planned-workout-routes)
    - [Actual Workout Routes](#actual-workout-routes)
    - [Statistics Routes](#statistics-routes)
    - [Gym Routes](#gym-routes)
    - [Membership Routes](#membership-routes)
    - [Membership Plan Routes](#membership-plan-routes)
    - [Class Routes](#class-routes)
    - [Class Schedule Routes](#class-schedule-routes)
    - [Booking Routes](#booking-routes)
    - [Competition Routes](#competition-routes)
    - [Competition Participant Routes](#competition-participant-routes)
    - [Competition Task Routes](#competition-task-routes)
    - [Competition Progress Routes](#competition-progress-routes)
    - [Membership Payment Routes](#membership-payment-routes)
    - [Food Item Routes](#food-item-routes)
    - [Diet Entry Routes](#diet-entry-routes)
    - [AI Interaction Routes](#ai-interaction-routes)
    - [Upload Routes](#upload-routes)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Middleware](#middleware)
7. [Setup and Configuration](#setup-and-configuration)

---
## Overview

The Workout Tracker API facilitates fitness-related functionalities for users, gym owners, and administrators. Key features include:

- User authentication via email/password or OAuth (Google, GitHub, Microsoft).
- Management of user profiles, exercises, workouts, gym memberships, and competitions.
- Diet tracking with food items and calorie logging.
- AI interactions for workout and diet advice.
- Image uploads for users, exercises, gyms, classes, and competitions.

The API is secured with JWT-based authentication and role-based access control (`admin`, `gym_owner`, `user`). Most routes require authentication, and specific actions (e.g., creating exercises) are restricted to administrators or gym owners.

---
## Authentication

The API uses JSON Web Tokens (JWT) for session management and supports OAuth for Google, GitHub, and Microsoft authentication. All protected routes require a valid JWT in the `Authorization` header as `Bearer <token>`.

- **JWT Authentication**:
    - Tokens are issued upon login or OAuth callback.
    - Tokens are validated by the `authMiddleware` (src/middleware/auth.js).
    - Token payload includes `userId` and expires after 7 days.
- **OAuth**:
    - Configured in `src/config/oauth.js` using Passport.js.
    - Supports Google, GitHub, and Microsoft providers.
    - Users are created or linked based on email or OAuth ID.

**Middleware**:

- `authMiddleware`: Verifies JWT and attaches user data (`id`, `email`, `displayName`, `role`) to `req.user`.
- `roleCheck`: Restricts access to specific roles (e.g., `admin`).
- `ownershipCheck`: Ensures users can only manage resources they own (e.g., gyms for gym owners).

-----
## API Endpoints

We have a total of 130 API endpoints. We write the documentation for every endpoint. Refer to this link for detail => [View the API Guide](./WorkoutTrackerAPIDocumentation.markdown)

-----
## Data Models

The API uses Prisma ORM with a PostgreSQL database. Below are the key models and their fields:

- **User**:
    - `id`, `email`, `passwordHash`, `displayName`, `dateOfBirth`, `gender`, `heightCm`, `weightKg`, `role`, `imageUrl`, `oauthProvider`, `oauthId`, `createdAt`.
    - Relations: `plannedWorkouts`, `actualWorkouts`, `userMemberships`, `userBookings`, `ownedGyms`, `competitionHistory`, `dietEntries`, `aiInteractions`.

- **Exercise**:
    - `id`, `name`, `category`, `description`, `imageUrl`, `createdAt`.
    - Relations: `plannedExercises`, `actualExercises`, `competitionTasks`.

- **PlannedWorkout**:
    - `id`, `userId`, `title`, `scheduledDate`, `estimatedDuration`, `reminderSent`, `createdAt`.
    - Relations: `user`, `plannedExercises`, `actualWorkouts`.

- **PlannedExercise**:
    - `id`, `plannedId`, `exerciseId`, `plannedSets`, `plannedReps`, `plannedWeight`, `plannedDuration`, `plannedCalories`.
    - Relations: `plannedWorkout`, `exercise`, `actualExercises`.

- **ActualWorkout**:
    - `id`, `plannedId`, `userId`, `title`, `completedDate`, `completedTime`, `actualDuration`, `createdAt`.
    - Relations: `user`, `plannedWorkout`, `actualExercises`.

- **ActualExercise**:
    - `id`, `actualId`, `exerciseId`, `plannedExerciseId`, `actualSets`, `actualReps`, `actualWeight`, `actualDuration`, `actualCalories`.
    - Relations: `actualWorkout`, `exercise`, `plannedExercise`.

- **Gym**:
    - `id`, `name`, `address`, `description`, `contactInfo`, `imageUrl`, `ownerId`, `createdAt`.
    - Relations: `owner`, `classes`, `membershipPlans`, `userMemberships`, `competitions`.

- **MembershipPlan**:
    - `id`, `gymId`, `name`, `description`, `durationDays`, `price`, `maxBookingsPerWeek`, `isActive`, `createdAt`.
    - Relations: `gym`, `userMemberships`.

- **UserMembership**:
    - `id`, `userId`, `gymId`, `planId`, `startDate`, `endDate`, `status`, `autoRenew`, `bookingsUsedThisWeek`, `lastBookingCountReset`, `createdAt`.
    - Relations: `user`, `gym`, `membershipPlan`, `membershipPayments`, `userBookings`.

- **MembershipPayment**:
    - `id`, `membershipId`, `amount`, `paymentDate`, `paymentMethod`, `transactionId`, `status`, `createdAt`.
    - Relations: `userMembership`.

- **GymClass**:
    - `id`, `gymId`, `name`, `description`, `maxCapacity`, `durationMinutes`, `imageUrl`, `membersOnly`, `difficultyLevel`, `isActive`, `createdAt`.
    - Relations: `gym`, `schedules`.

- **ClassSchedule**:
    - `id`, `classId`, `startTime`, `endTime`, `instructor`, `currentBookings`, `isCancelled`, `cancellationReason`, `createdAt`.
    - Relations: `gymClass`, `userBookings`.

- **UserBooking**:
    - `id`, `userId`, `membershipId`, `scheduleId`, `bookingTime`, `bookingStatus`, `cancellationReason`, `attended`, `createdAt`.
    - Relations: `user`, `userMembership`, `schedule`.

- **Competition**:
    - `id`, `gymId`, `name`, `description`, `startDate`, `endDate`, `imageUrl`, `maxParticipants`, `isActive`, `createdAt`.
    - Relations: `gym`, `competitionTasks`, `participants`.

- **CompetitionTask**:
    - `id`, `competitionId`, `exerciseId`, `name`, `description`, `targetValue`, `unit`, `pointsValue`.
    - Relations: `competition`, `exercise`, `userProgress`.

- **CompetitionUser**:
    - `id`, `userId`, `competitionId`, `joinDate`, `totalPoints`, `completionPct`, `rank`, `isActive`.
    - Relations: `user`, `competition`, `taskProgress`.

- **CompetitionProgress**:
    - `id`, `participantId`, `taskId`, `currentValue`, `isCompleted`, `completionDate`, `lastUpdated`, `notes`.
    - Relations: `participant`, `task`.

- **FoodItem**:
    - `id`, `name`, `description`, `caloriesPerUnit`, `servingUnit`, `imageUrl`, `createdAt`.
    - Relations: `dietEntries`.

- **DietEntry**:
    - `id`, `userId`, `foodId`, `quantity`, `calories`, `consumptionDate`, `mealType`, `notes`, `createdAt`.
    - Relations: `user`, `foodItem`.

- **AiInteraction**:
    - `id`, `userId`, `prompt`, `response`, `interactionType`, `createdAt`.
    - Relations: `user`.

---
## Error Handling

The API uses a centralized error handler (`src/middleware/errorHandler.js`) to manage errors consistently. Common error responses include:

- **400**: Validation errors (Zod schema or invalid input).

  ```json  
  {  
    "status": "error",    "message": "Validation error",    "error": [      {        "path": "string",        "message": "string"      }    ]  }  
  ```
- **401**: Authentication required or invalid token.

- **403**: Insufficient permissions (role or ownership).

- **404**: Resource not found.

- **409**: Resource conflict (e.g., duplicate name).

- **500**: Internal server error.

Prisma-specific errors are handled for unique constraint violations (`P2002`) and record not found (`P2025`).

---
## Middleware

- **authMiddleware** (`src/middleware/auth.js`): Verifies JWT and attaches user data.
- **roleCheck** (`src/middleware/roleCheck.js`): Restricts access to specified roles.
- **ownershipCheck** (`src/middleware/ownershipCheck.js`): Ensures resource ownership for gym-related actions.
- **validate** (`src/middleware/validate.js`): Validates request data using Zod schemas.
- **upload/processImage** (`src/middleware/upload.js`): Handles image uploads and processing with Sharp, storing as WebP.

---
## Setup and Configuration

- **Environment Variables**:

    - `DATABASE_URL`: PostgreSQL connection string.
    - `JWT_SECRET`: Secret for JWT signing.
    - `SESSION_SECRET`: Secret for session management.
    - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth credentials.
    - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`: GitHub OAuth credentials.
    - `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`: Microsoft OAuth credentials.
    - `PORT`: Server port (default: 5000).
    - `NODE_ENV`: Environment (`development`, `production`, `test`).

- **Dependencies**:

    - Express.js, Prisma, bcrypt, jwt, passport, multer, sharp, zod, helmet, cors, cookie-parser, express-session.

- **Database**: Use Prisma CLI to migrate and seed the database (`prisma migrate dev`, `node update-features.js`, `node competitionSeed.js`, `node dietSeed.js`).

- **Running the Server**:

  ```bash  
  npm install  
  npx prisma migrate dev  node src/index.js  ```  

---

This documentation provides a comprehensive guide for developers to understand and extend the Workout Tracker API. For further details, refer to the source code or contact the development team.

---
# Testing Documentation

This document provides an overview of the test suite for the Backend (“backend” package), including setup instructions, folder structure, and a summary of each test file’s purpose. All tests use **Jest** and **Supertest**, run against a separate test database configured in `tests/setup.js`.

---
## Table of Contents

1. [Overview](#overview)
2. [Prerequisites & Environment Variables](#prerequisites--environment-variables)
3. [Installation](#installation)
4. [Running the Tests](#running-the-tests)
5. [Test Directory Structure](#test-directory-structure)
6. [Global Setup & Teardown (`tests/setup.js`)](#global-setup--teardown-testssetupjs)
7. [Test Files Breakdown](#test-files-breakdown)
    - [Authentication Routes (`auth.test.js`)](#authentication-routes-authtestjs)
    - [Actual Workouts (`actualWorkout.test.js`)](#actual-workouts-actualworkouttestjs)
    - [AI Interactions (`aiInteraction.test.js`)](#ai-interactions-aiinteractiontestjs)
    - [Booking Routes (`booking.test.js`)](#booking-routes-bookingtestjs)
    - [Gym Classes (`classes.test.js`)](#gym-classes-classestestjs)
    - [Competitions (`competitions.test.js`)](#competitions-competitionstestjs)
    - [Diet Entries (`dietEntries.test.js`)](#diet-entries-dietentriestestjs)
    - [Exercises (`exercises.test.js`)](#exercises-exercisestestjs)
    - [Food Items (`foodItems.test.js`)](#food-items-fooditemstestjs)
    - [Gyms (`gyms.test.js`)](#gyms-gymstestjs)
    - [Membership Plans (`membershipPlans.test.js`)](#membership-plans-membershipplanstestjs)
    - [Memberships (`memberships.test.js`)](#memberships-membershipstestjs)
    - [Planned Workouts (`plannedWorkouts.test.js`)](#planned-workouts-plannedworkoutstestjs)
    - [Statistics (`statistics.test.js`)](#statistics-statisticstestjs)
    - [User Routes (`users.test.js`)](#user-routes-userstestjs)
    - [Utilities (`utils/auth.js`)](#utilities-utilsauthjs)
8. [Coverage Configuration](#coverage-configuration)
9. [Notes & Best Practices](#notes--best-practices)

---
## Overview

The test suite verifies all RESTful API endpoints, covering:

- **Authentication & Authorization**
- **CRUD operations** for resources such as Users, Gyms, Classes, Bookings, Workouts, Diet Entries, Exercises, and more
- **Route-level validation**, error handling, and permissions
- **Complex workflows**, including creating an actual workout from a planned workout, competition join/leave, membership payments, and summary endpoints

Tests run against a dedicated PostgreSQL database (`sustracker_test`) to avoid polluting development or production data.

---
## Prerequisites & Environment Variables

Before running tests, ensure you have:

1. **Node.js (v16+ recommended)**
2. **PostgreSQL** instance accessible locally or via a connection string
3. A `.env` or environment configuration providing:
    - `TEST_DATABASE_URL` (e.g., `postgresql://postgres:321123@localhost:5432/sustracker_test`)
    - `JWT_SECRET` (arbitrary long secret for signing tokens)
    - `NODE_ENV=test` (automatically set by `tests/setup.js`)
    - `ENABLE_NOTIFICATIONS=false` (optional; disable email/SMS in tests)

`tests/setup.js` overrides `process.env.DATABASE_URL` using `TEST_DATABASE_URL` and sets:

```bash  
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:321123@localhost:5432/sustracker_test';  
process.env.JWT_SECRET = '<your-test-jwt-secret>';process.env.NODE_ENV = 'test';process.env.ENABLE_NOTIFICATIONS = 'false';```  
  
---  
## Installation  
  
```bash  
# Clone the repo (if not already done)  
git clone <repository-url>  
cd backend  
  
# Install dependencies  
npm install  
```

---
## Running the Tests

All tests run via Jest (configured in `package.json`):

```bash  
# Run all tests once  
npm test  
  
# Watch for file changes and re-run relevant tests  
npm run test:watch  
  
# Collect coverage info  
npm run test:coverage  
```

Under the hood, `npm test` invokes:

```bash  
jest --runInBand --forceExit  
```

* `--runInBand`: run tests serially (important when sharing a database)
* `--forceExit`: ensures Jest exits even if open handles remain

By default, Jest uses `tests/setup.js` as `setupFilesAfterEnv`.

---
## Test Directory Structure

```  
backend/  
├── src/  
│   └── (application code)  
├── tests/  
│   ├── setup.js  
│   ├── utils/  
│   │   └── auth.js  
│   ├── actualWorkout.test.js  
│   ├── aiInteraction.test.js  
│   ├── auth.test.js  
│   ├── booking.test.js  
│   ├── classes.test.js  
│   ├── competitions.test.js  
│   ├── dietEntries.test.js  
│   ├── exercises.test.js  
│   ├── foodItems.test.js  
│   ├── gyms.test.js  
│   ├── membershipPlans.test.js  
│   ├── memberships.test.js  
│   ├── plannedWorkouts.test.js  
│   ├── statistics.test.js  
│   └── users.test.js  
├── package.json  
└── ...  
```

* **`tests/setup.js`**: Global setup/teardown hooks, database cleaning, and seed data creation.
* **`tests/utils/auth.js`**: JWT token generator and helper for Supertest.
* Each `*.test.js` file focuses on one resource or set of related endpoints.

---
## Global Setup & Teardown (`tests/setup.js`)

1. **Environment Configuration**

    * Overrides `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, and `ENABLE_NOTIFICATIONS`
    * Sets a higher Jest timeout (`30000ms`) to accommodate database operations

2. **`beforeAll` Hook**

    * Calls `cleanDatabase()` to wipe all tables
    * Creates three test users (`admin`, `gymOwner`, and `user`) with hashed passwords
    * Creates three base exercises (`Push-up`, `Squat`, `Running`)

3. **`afterAll` Hook**

    * Cleans database again
    * Disconnects Prisma client

4. **`beforeEach` Hook**

    * Deletes data from all tables except `users` and `exercises` (to ensure isolation)
    * Runs in correct order to avoid foreign key constraint violations

5. **Helper Functions**

    * `cleanDatabase()`: Truncates each table and resets serial sequences
    * `createTestUsers()`: Inserts three roles: `admin`, `gym_owner`, `user`
    * `createTestExercises()`: Inserts three base exercises for reference

6. **Global Exposures**

    * `global.prisma`: Prisma client instance
    * `global.testUsers`: Object with `{ admin, gymOwner, user }`
    * `global.testExercises`: Object with `{ pushup, squat, running }`

---
## Test Files Breakdown

Below is a summary of each test file’s responsibilities and notable test cases.

Since we have a total of 254 test cases, for each test case explanation, refer to this link => [View Testing Guide](./TestingDocumentation.md)

---
### Utilities (`utils/auth.js`)

* **Purpose**: Helper functions for generating JWT tokens and authorization headers used in Supertest calls.

* **Exports**:

    * `generateToken(user)`: Signs a JWT payload containing `{ id, email, role }` using `process.env.JWT_SECRET`.
    * `getAuthHeader(user)`: Returns `Bearer <token>`.

* **Usage**:

  ```js  
  const { getAuthHeader } = require('./utils/auth');  
  const tokenHeader = getAuthHeader(global.testUsers.user);  // e.g. .set('Authorization', tokenHeader)  ```  
---

## Coverage Configuration

In `package.json`, the `"jest"` section includes:

```jsonc  
"collectCoverageFrom": [  
  "src/**/*.js",  "!src/index.js",  "!src/app.js",  "!src/config/**",  "!src/middleware/upload.js"],  
"coverageDirectory": "coverage",  
"coverageReporters": [  
  "text",  "lcov",  "html"]  
```

* **Files Covered**: All source files under `src/`, excluding entry points, config files, and upload middleware.
* Coverage reports are generated in `coverage/` (HTML, LCOV, and plain text).

Run:

```bash  
npm run test:coverage
```

to produce a detailed coverage report.

---
## Notes & Best Practices

* **Isolation Between Tests**:

    * `tests/setup.js` clears all tables before/after run and between individual tests.
    * Shared data (e.g., `users`, `exercises`) is re-seeded in `beforeAll`.

* **Database Transactions**:

    * Tests rely on a clean state. Avoid using transactions to rollback—explicit truncation is used instead.
    * Always ensure new test records are created with the correct foreign keys (e.g., linking workouts to `userId`).

* **Authentication**:

    * All protected routes require `Authorization: Bearer <token>` using `getAuthHeader(global.testUsers.<role>)`.
    * `auth.test.js` covers invalid credentials, missing fields, and token generation.

* **Data Validation**:

    * Test cases explicitly check for validation errors (`400 Bad Request`) when required fields are missing or numeric constraints are violated (e.g., negative price, invalid IDs).
    * Conflict scenarios (`409 Conflict`) are tested for duplicate record creation (e.g., exercise name, food item name, membership plan name).

* **Role-Based Access Control**:

    * Models distinguish user roles: `admin`, `gym_owner`, `user`.
    * Test each endpoint with different roles to confirm proper authorization logic (`403 Forbidden`).

* **Date Handling**:

    * For endpoints requiring date filters (history, statistics, summary), use ISO strings (`.toISOString()`) and verify server response matches expected date ranges.
    * Reminder: The test environment’s “current date” is the system date when tests run—ensure scheduled vs. past vs. future logic is consistent.

* **Parallelization**:

    * `--runInBand` ensures tests run serially to prevent race conditions on the shared test database.
    * Avoid any hardcoded primary keys—always capture IDs from Prisma responses.

---
## Effectiveness of our tests

![Example Image](../images/coloredTest.png)

![Example Image](../images/terminalTest.png)

## Table Format for all testing files

| File                         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                                            |  
| ---------------------------- | ------- | -------- | ------- | ------- | ------------------------------------------------------------ |  
| All files                    | 73.32   | 52.38    | 79.7    | 73.4    |                                                              |  
| controllers                  | 70.93   | 50.45    | 83.78   | 70.93   |                                                              |  
| actual.controller.js         | 89.74   | 100      | 88.88   | 89.74   | 52-57                                                        |  
| ai.controller.js             | 75      | 66.66    | 80      | 75      | 6-14                                                         |  
| auth.controller.js           | 48      | 8.33     | 66.66   | 48      | 23,36-86                                                     |  
| booking.controller.js        | 96.87   | 90       | 100     | 96.87   | 38                                                           |  
| class.controller.js          | 55.88   | 45       | 77.77   | 55.88   | 22,79,116,125-135,160,184-189,217,246,269-406                |  
| competition.controller.js    | 46.84   | 28.57    | 58.82   | 46.84   | 44-86,153-249,265,294-353,461-469                            |  
| dietEntry.controller.js      | 100     | 100      | 100     | 100     |                                                              |  
| exercises.controller.js      | 100     | 100      | 100     | 100     |                                                              |  
| foodItem.controller.js       | 100     | 100      | 100     | 100     |                                                              |  
| gym.controller.js            | 76.82   | 75       | 90      | 76.82   | 94-96,109,143,148-161,165,187,191-196                        |  
| membership.controller.js     | 100     | 100      | 100     | 100     |                                                              |  
| membershipPlan.controller.js | 100     | 100      | 100     | 100     |                                                              |  
| planned.controller.js        | 96.29   | 100      | 100     | 96.29   | 79                                                           |  
| statistics.controller.js     | 100     | 100      | 100     | 100     |                                                              |  
| stripe.controller.js         | 24.24   | 100      | 0       | 24.24   | 7-15,20-25,31-42,47-59                                       |  
| users.controller.js          | 63.63   | 40       | 88.88   | 63.63   | 25-39,57-74,114-118                                          |  
| middleware                   | 72.54   | 46.05    | 100     | 72      |                                                              |  
| auth.js                      | 82.6    | 62.5     | 100     | 82.6    | 17,27,41,44                                                  |  
| errorHandler.js              | 47.61   | 20.68    | 100     | 47.61   | 11,17-35,52-55                                               |  
| ownershipCheck.js            | 70.96   | 57.89    | 100     | 70.96   | 12,46-68,77                                                  |  
| roleCheck.js                 | 90      | 66.66    | 100     | 90      | 11                                                           |  
| validate.js                  | 82.35   | 66.66    | 100     | 80      | 8-9,32                                                       |  
| routes                       | 96.45   | 100      | 33.33   | 96.45   |                                                              |  
| actual.routes.js             | 100     | 100      | 100     | 100     |                                                              |  
| ai.routes.js                 | 100     | 100      | 100     | 100     |                                                              |  
| auth.routes.js               | 94.44   | 100      | 0       | 94.44   | 68                                                           |  
| booking.routes.js            | 100     | 100      | 100     | 100     |                                                              |  
| class.routes.js              | 100     | 100      | 100     | 100     |                                                              |  
| competition.routes.js        | 100     | 100      | 100     | 100     |                                                              |  
| dietEntry.routes.js          | 100     | 100      | 100     | 100     |                                                              |  
| exercises.routes.js          | 100     | 100      | 100     | 100     |                                                              |  
| foodItem.routes.js           | 100     | 100      | 100     | 100     |                                                              |  
| gym.routes.js                | 100     | 100      | 100     | 100     |                                                              |  
| membership.routes.js         | 100     | 100      | 100     | 100     |                                                              |  
| membershipPlan.routes.js     | 100     | 100      | 100     | 100     |                                                              |  
| planned.routes.js            | 100     | 100      | 100     | 100     |                                                              |  
| statistics.routes.js         | 100     | 100      | 100     | 100     |                                                              |  
| stripe.routes.js             | 100     | 100      | 100     | 100     |                                                              |  
| uploads.routes.js            | 57.14   | 100      | 50      | 57.14   | 12-31                                                        |  
| users.routes.js              | 100     | 100      | 100     | 100     |                                                              |  
| services                     | 68.15   | 52.13    | 74.86   | 68.18   |                                                              |  
| actual.service.js            | 74.53   | 44.32    | 73.07   | 74.19   | ...177,213-220,242-270,285,298,420,439,528-534,536,543-560,609,697 |  
| ai.service.js                | 46.25   | 52.63    | 80      | 46.57   | 25-30,35-119                                                 |  
| auth.service.js              | 100     | 72.22    | 100     | 100     | 30-55,84-95                                                  |  
| booking.service.js           | 91.66   | 72.54    | 100     | 91.56   | 48,130-135,237,274,279,436                                   |  
| class.service.js             | 84.44   | 65.51    | 100     | 83.72   | 35-40,97,110,113,128,132                                     |  
| competition.service.js       | 57.33   | 41.8     | 50      | 57.82   | ...374-375,390-415,444,458,480-481,524,537,542,556,598,666,775-819 |  
| dietEntry.service.js         | 95.4    | 73.91    | 100     | 95.29   | 126,147,178,310                                              |  
| exercises.service.js         | 81.25   | 60       | 100     | 84.09   | 76,81-94,120,129,137                                         |  
| foodItem.service.js          | 85.71   | 62.5     | 100     | 85.71   | 100,105-110,128                                              |  
| gym.service.js               | 88.09   | 58.82    | 87.5    | 88.09   | 169-185                                                      |  
| membership.service.js        | 78.12   | 85       | 81.81   | 79.03   | 35,200,238,287-319                                           |  
| membershipPlan.service.js    | 90.47   | 87.5     | 100     | 90.47   | 72,87,134,138                                                |  
| notifications.service.js     | 15.87   | 12.5     | 11.11   | 16.12   | 9,28-33,48-182,189                                           |  
| planned.service.js           | 76.47   | 56.52    | 80      | 77.55   | 153,174-191,221,240,249-254                                  |  
| statistics.service.js        | 79      | 52.29    | 87.5    | 78.91   | 35-46,53,66,82,104-116,125-133,174-203,218,251               |  
| stripe.service.js            | 4.09    | 0        | 0       | 4.09    | 9-395                                                        |  
| users.service.js             | 92.53   | 65.51    | 100     | 92.42   | 26,36,88,93,103                                              |  
| utils                        | 71.42   | 100      | 75      | 69.23   |                                                              |  
| ApiError.js                  | 100     | 100      | 100     | 100     |                                                              |  
| asyncHandler.js              | 100     | 100      | 100     | 100     |                                                              |  
| oauthUtils.js                | 0       | 100      | 0       | 0       | 2-12                                                         |  
| validators                   | 88.97   | 68.75    | 84.04   | 88.97   |                                                              |  
| actual.validator.js          | 87.5    | 85.71    | 84.61   | 87.5    | 12,95                                                        |  
| ai.validator.js              | 100     | 100      | 100     | 100     |                                                              |  
| auth.validator.js            | 100     | 50       | 100     | 100     | 15                                                           |  
| booking.validator.js         | 100     | 50       | 100     | 100     | 14-15                                                        |  
| class.validator.js           | 80      | 50       | 75      | 80      | 90-107                                                       |  
| competition.validator.js     | 66.66   | 33.33    | 60      | 66.66   | 33,83,148-152                                                |  
| diet.validator.js            | 85.71   | 100      | 83.33   | 85.71   | 118,180-186                                                  |  
| exercises.validator.js       | 100     | 100      | 100     | 100     |                                                              |  
| gym.validator.js             | 100     | 50       | 100     | 100     | 15-16                                                        |  
| actual.validator.js          | 87.5    | 85.71    | 84.61   | 87.5    | 12,95                                                        |  
| ai.validator.js              | 100     | 100      | 100     | 100     |                                                              |  
| auth.validator.js            | 100     | 50       | 100     | 100     | 15                                                           |  
| booking.validator.js         | 100     | 50       | 100     | 100     | 14-15                                                        |  
| class.validator.js           | 80      | 50       | 75      | 80      | 90-107                                                       |  
| competition.validator.js     | 66.66   | 33.33    | 60      | 66.66   | 33,83,148-152                                                |  
| diet.validator.js            | 85.71   | 100      | 83.33   | 85.71   | 118,180-186                                                  |  
| exercises.validator.js       | 100     | 100      | 100     | 100     |                                                              |  
| gym.validator.js             | 100     | 50       | 100     | 100     | 15-16                                                        |  
| membership.validator.js      | 100     | 100      | 100     | 100     |                                                              |  
| membershipPlan.validator.js  | 100     | 100      | 100     | 100     |                                                              |  
| planned.validator.js         | 87.5    | 0        | 80      | 87.5    | 57                                                           |  
| statistics.validator.js      | 100     | 100      | 100     | 100     |                                                              |  
| users.validator.js           | 100     | 100      | 100     | 100     |                                                              |  
| membership.validator.js      | 100     | 100      | 100     | 100     |                                                              |  
| membershipPlan.validator.js  | 100     | 100      | 100     | 100     |                                                              |  
| planned.validator.js         | 87.5    | 0        | 80      | 87.5    | 57                                                           |  
| statistics.validator.js      | 100     | 100      | 100     | 100     |                                                              |  
| users.validator.js           | 100     | 100      | 100     | 100     |                                                              |  
Test Suites: 15 passed, 15 total  
Tests:       254 passed, 254 total



The test coverage report indicates that the tests are effective in evaluating a substantial portion of the codebase. Overall, the tests achieve a statement coverage of **73.32%**, branch coverage of **52.38%**, function coverage of **79.7%**, and line coverage of **73.4%**. These metrics demonstrate that the tests exercise a significant amount of the code, particularly in key areas such as functions and statements, ensuring that critical components are validated.

Notably, several files, including dietEntry.controller.js, exercises.controller.js, membership.controller.js, and multiple route files, achieve 100% coverage across all metrics, indicating comprehensive testing in those modules. Other files, such as booking.controller.js (96.87% line coverage) and planned.controller.js (96.29% line coverage), also show high coverage, reflecting thorough testing of their functionality. The tests effectively target essential logic paths, as evidenced by the strong function coverage (79.7%) across the project.

This coverage suggests that the tests are well-designed to verify the core functionality of the application, providing confidence in the reliability of the codebase while identifying areas for potential enhancement in future testing efforts.

-----
# 4. Build

## Build Process Report

### Technology/Tools/Frameworks/Approaches

The project employs a structured build process utilizing Node.js and npm(node package manager) as the primary tools for managing dependencies and executing build tasks. The build process is orchestrated through a root package.json file, which coordinates the build operations for both the backend and frontend sub-projects. Key technologies and tools include:

- **Node.js and npm**: Used for dependency management and script execution across both backend and frontend.
- **Prisma**: For generating the Prisma client in the backend, ensuring database schema alignment.
- **Jest**: For running unit tests and generating test coverage reports in the backend.
- **Next.js**: For building the frontend, leveraging its built-in build system to generate optimized static and server-side rendered assets.
- **ESLint**: For linting the frontend codebase to ensure code quality and adherence to coding standards.
- **TypeScript**: Used in the frontend to enforce type safety, requiring compilation during the build process.
- **Tailwind CSS**: For compiling styles in the frontend, integrated via PostCSS.

The approach is modular, with separate package.json files for the backend, frontend, and root project, allowing independent management of each component while coordinating the overall build through the root script.

## Tasks Executed in a Build

The build process encompasses several tasks to ensure a robust and production-ready application. These tasks are defined in the scripts section of the respective package.json files and executed via the root package.json. The tasks include:

1. **Dependency Installation**:

    - Backend: npm ci in the backend directory installs dependencies listed in backend/package.json reproducibly.
    - Frontend: npm ci in the frontend directory installs dependencies listed in frontend/package.json.

2. **Prisma Client Generation** (Backend):

    - npx prisma generate generates the Prisma client based on the schema defined in prisma/schema.prisma, ensuring the backend can interact with the database.

3. **Testing and Test Report Generation** (Backend):

    - npm run test:ci executes Jest tests with the --coverage flag to generate test coverage reports in text, LCOV, and HTML formats.
    - Tests are run in-band with a forced exit to ensure completion in a CI environment.
    - Coverage is collected from src/**/*.js, excluding specific files (src/index.js, src/app.js, src/config/**, src/middleware/upload.js).

4. **Linting** (Frontend):

    - npm run lint runs ESLint to check the frontend codebase for code quality issues, using the configuration from eslint-config-next.

5. **Compilation and Packaging** (Frontend):

    - npm run build in the frontend directory triggers Next.js to compile TypeScript code, bundle JavaScript, and process Tailwind CSS styles.
    - This produces optimized static assets and server-side rendered pages in the .next directory.

6. **Build Coordination** (Root):

    - The root package.json script npm run build sequentially executes build:backend and build:frontend, ensuring both components are built in order.



### Final Artifacts Produced by a Successful Build

A successful build produces the following artifacts:

- **Backend**:
    - **Prisma Client**: Generated client code in backend/node_modules/@prisma/client, used for database operations.
    - **Test Coverage Reports**: Located in backend/coverage, including:
        - text: A text-based summary of test coverage.
        - lcov: An LCOV file for integration with CI tools.
        - html: An HTML report for detailed coverage analysis.
    - **Executable Code**: The backend source code in backend/src is ready to run with node src/index.js, though no additional compilation is required as it uses CommonJS.
    
- **Frontend**:
- **Next.js Build Output**: The .next directory in frontend, containing:
    
    - Compiled JavaScript bundles.
        - Optimized static assets (e.g., CSS, images).
        - Server-side rendering configurations.
        - Static HTML pages for static site generation (if applicable).
    
- **TypeScript Artifacts**: Compiled JavaScript files from TypeScript source code, included in the .next directory.



### Buildfile and Related Artifacts

The build process is driven by the following package.json files, which define the scripts and configurations for the build tasks:

1. **Root package.json**:
    - Coordinates the build process for both backend and frontend.
    - Defines the build, build:backend, and build:frontend scripts.
    - Defines the start: the backend and frontend build file are run simultaneously using concurrently library.

```json  
{
  "name": "fullstack-project",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build:backend": "cd backend && npm ci && npx prisma generate",
    "build:frontend": "cd frontend && npm ci && npm run build",
    "build": "npm run build:backend && npm run build:frontend",
    "start": "concurrently \"cd backend && npm run start\" \"cd frontend && npm run start\""
  },
  "devDependencies": {
    "concurrently": "^9.1.2"
  }
}

```

2. Backend package.json:

   ```json  
   {
     "name": "backend",
     "version": "1.0.0",
     "description": "",
     "main": "index.js",
     "scripts": {
       "dev": "nodemon src/index.js",
       "start": "node src/index.js",
       "test": "jest --runInBand --forceExit",
       "test:watch": "jest --watch --runInBand",
       "test:coverage": "jest --coverage --runInBand --forceExit",
       "test:ci": "jest --coverage --watchAll=false --runInBand --forceExit"
     },
     "jest": {
       "testEnvironment": "node",
       "setupFilesAfterEnv": [
         "<rootDir>/tests/setup.js"
       ],
       "testMatch": [
         "<rootDir>/tests/**/*.test.js"
       ],
       "collectCoverageFrom": [
         "src/**/*.js",
         "!src/index.js",
         "!src/app.js",
         "!src/config/**",
         "!src/middleware/upload.js"
       ],
       "coverageDirectory": "coverage",
       "coverageReporters": [
         "text",
         "lcov",
         "html"
       ],
       "testTimeout": 30000
     },
     "prisma": {
       "seed": "node prisma/seed.js"
     },
     "keywords": [],
     "author": "",
     "license": "ISC",
     "type": "commonjs",
     "dependencies": {
       "@prisma/client": "^6.5.0",
       "@supabase/supabase-js": "^2.49.3",
       "cookie-parser": "^1.4.7",
       "cors": "^2.8.5",
       "dotenv": "^16.4.7",
       "express": "^4.21.2",
       "express-session": "^1.18.1",
       "firebase-admin": "^13.2.0",
       "helmet": "^8.1.0",
       "jsonwebtoken": "^9.0.2",
       "multer": "^2.0.0",
       "node-cron": "^3.0.3",
       "nodemailer": "^6.10.0",
       "openai": "^5.0.1",
       "passport": "^0.7.0",
       "passport-facebook": "^3.0.0",
       "passport-github2": "^0.1.12",
       "passport-google-oauth20": "^2.0.0",
       "passport-microsoft": "^2.1.0",
       "sharp": "^0.34.2",
       "stripe": "^18.1.0",
       "uuid": "^11.1.0",
       "zod": "^3.24.2",
       "bcryptjs": "^2.4.3"
     },
     "devDependencies": {
       "@types/jest": "^29.5.14",
       "@types/supertest": "^6.0.3",
       "jest": "^29.7.0",
       "nodemon": "^3.1.9",
       "prisma": "^6.5.0",
       "supertest": "^7.1.1"
     }
   }
   
   ```

3. Frontend package.json:

   ```json  
   {
     "name": "frontend",
     "version": "0.1.0",
     "private": true,
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint"
     },
     "dependencies": {
       "@hookform/resolvers": "^5.0.0",
       "@radix-ui/react-accordion": "^1.2.11",
       "@radix-ui/react-alert-dialog": "^1.1.13",
       "@radix-ui/react-avatar": "^1.1.3",
       "@radix-ui/react-checkbox": "^1.2.3",
       "@radix-ui/react-dialog": "^1.1.6",
       "@radix-ui/react-dropdown-menu": "^2.1.6",
       "@radix-ui/react-label": "^2.1.2",
       "@radix-ui/react-popover": "^1.1.13",
       "@radix-ui/react-progress": "^1.1.4",
       "@radix-ui/react-radio-group": "^1.3.4",
       "@radix-ui/react-scroll-area": "^1.2.6",
       "@radix-ui/react-select": "^2.1.6",
       "@radix-ui/react-separator": "^1.1.2",
       "@radix-ui/react-slot": "^1.2.2",
       "@radix-ui/react-switch": "^1.2.2",
       "@radix-ui/react-tabs": "^1.1.4",
       "@radix-ui/react-tooltip": "^1.1.8",
       "@tanstack/react-table": "^8.21.3",
       "axios": "^1.8.4",
       "class-variance-authority": "^0.7.1",
       "clsx": "^2.1.1",
       "cmdk": "^1.1.1",
       "cohere-ai": "^7.17.0",
       "date-fns": "^3.6.0",
       "firebase": "^11.5.0",
       "js-cookie": "^3.0.5",
       "jsonwebtoken": "^9.0.2",
       "jwt-decode": "^4.0.0",
       "lucide-react": "^0.485.0",
       "motion": "^12.6.2",
       "next": "15.2.4",
       "next-themes": "^0.4.6",
       "openai": "^5.0.1",
       "react": "^18.2.0",
       "react-day-picker": "^8.10.1",
       "react-dom": "^18.2.0",
       "react-hook-form": "^7.55.0",
       "recharts": "^2.15.2",
       "sonner": "^2.0.2",
       "styled-components": "^6.1.17",
       "tailwind-merge": "^3.0.2",
       "tw-animate-css": "^1.2.5",
       "zod": "^3.24.2"
     },
     "devDependencies": {
       "@eslint/eslintrc": "^3",
       "@tailwindcss/postcss": "^4",
       "@types/js-cookie": "^3.0.6",
       "@types/jsonwebtoken": "^9.0.9",
       "@types/node": "^20",
       "@types/react": "^19",
       "@types/react-dom": "^19",
       "cross-env": "^7.0.3",
       "eslint": "^9",
       "eslint-config-next": "15.2.4",
       "tailwindcss": "^4",
       "typescript": "^5"
     }
   }
   
   ```
   
   ---
# 5. Deployment

Two different approaches were used to deploy the frontend and backend. To deploy our frontend, we used Vercel because our web application uses Next.js as the framework. Since Vercel is optimized for frontend deployment, we turned to Render for the backend instead, as it supports long-running server processes and has a generous free tier we could use. For the frontend, we deployed directly from the git repository forked to my github as Vercel needed the permission of the organization owner to access the repo. For the backend, we deployed using a docker image I had pushed to my dockerhub. As the most stable distribution, we used Debian to ensure compatibility, especially with packages like `bcrypt`, which failed to build properly when we tried it on Alpine. We also included a `.dockerignore` file to exclude unnecessary files and reduce build time, as the initial builds were taking too long.
### Script and related artifacts

**`Dockerfile` :**

```  
# STAGE 1: Builder  
FROM --platform=linux/amd64 node:18-slim AS builder  
WORKDIR /app  
  
# Install system dependencies  
RUN apt-get update && apt-get install -y --no-install-recommends \  
    libvips-dev \  
    build-essential \  
    python3 \  
    && rm -rf /var/lib/apt/lists/*  
  
COPY package.json package-lock.json ./  
  
RUN npm ci  
  
COPY . .  
RUN npx prisma generate  
  
# Clean up dev dependencies  
RUN npm prune --production  
  
# STAGE 2: Runner  
FROM --platform=linux/amd64 node:18-slim AS runner  
WORKDIR /app  
  
RUN apt-get update && apt-get install -y --no-install-recommends \  
    libvips42 \  
    && rm -rf /var/lib/apt/lists/*  
  
ENV NODE_ENV=production  
ENV PORT=${PORT:-5000}  
  
RUN groupadd --system --gid 1001 nodejs && \  
    useradd --system --uid 1001 --gid nodejs nodejs  
  
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules  
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json  
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma  
COPY --from=builder --chown=nodejs:nodejs /app/src ./src  
  
USER nodejs  
EXPOSE ${PORT}  
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
```

**`.dockerignore` :**

```  
# Node modules  
node_modules  
  
# Git  
.git  
.gitignore  
  
# IDE and OS files  
.vscode  
.idea  
*.swp  
*.swo  
Thumbs.db  
.DS_Store  
  
# Local environment files  
.env  
.env.*  
!/.env.example  
  
# Logs  
npm-debug.log*  
yarn-debug.log*  
yarn-error.log*  
logs  
*.log  
  
# Build outputs  
dist  
build    
  
# Test coverage reports  
coverage  
lcov-report 
```

### Proof of successful containerization

**Successful docker build:**

![Example Image](../images/docker-build.png)

Full message:

```  
charissa@LAPTOP-65FOE8UH:/mnt/c/Users/USER/Documents/My Files/Uni Stuff/Y2_Sem2/Software Engineering/Project/Project/team-project-25spring-91/backend$ docker build -t chromics/sustracker-backend:v2.0 .
[+] Building 15.3s (20/20) FINISHED                                                                                                  docker:default
 => [internal] load build definition from Dockerfile                                                                                           0.1s
 => => transferring dockerfile: 1.20kB                                                                                                         0.0s 
 => [internal] load metadata for docker.io/library/node:18-slim                                                                                3.1s 
 => [auth] library/node:pull token for registry-1.docker.io                                                                                    0.0s
 => [internal] load .dockerignore                                                                                                              0.0s
 => => transferring context: 385B                                                                                                              0.0s 
 => [builder 1/8] FROM docker.io/library/node:18-slim@sha256:f9ab18e354e6855ae56ef2b290dd225c1e51a564f87584b9bd21dd651838830e                  0.0s 
 => [internal] load build context                                                                                                              2.0s 
 => => transferring context: 376.94kB                                                                                                          2.0s 
 => CACHED [builder 2/8] WORKDIR /app                                                                                                          0.0s
 => CACHED [builder 3/8] RUN apt-get update && apt-get install -y --no-install-recommends     libvips-dev     build-essential     python3      0.0s 
 => CACHED [builder 4/8] COPY package.json package-lock.json ./                                                                                0.0s 
 => CACHED [builder 5/8] RUN npm ci                                                                                                            0.0s 
 => [builder 6/8] COPY . .                                                                                                                     0.2s
 => [builder 7/8] RUN npx prisma generate                                                                                                      3.4s 
 => [builder 8/8] RUN npm prune --production                                                                                                   2.3s 
 => CACHED [runner 3/8] RUN apt-get update && apt-get install -y --no-install-recommends     libvips42     && rm -rf /var/lib/apt/lists/*      0.0s 
 => CACHED [runner 4/8] RUN groupadd --system --gid 1001 nodejs &&     useradd --system --uid 1001 --gid nodejs nodejs                         0.0s 
 => CACHED [runner 5/8] COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules                                             0.0s 
 => CACHED [runner 6/8] COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json                                             0.0s 
 => CACHED [runner 7/8] COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma                                                         0.0s 
 => [runner 8/8] COPY --from=builder --chown=nodejs:nodejs /app/src ./src                                                                      0.1s 
 => exporting to image                                                                                                                         0.1s 
 => => exporting layers                                                                                                                        0.1s 
 => => writing image sha256:34153b1fa3e342b17da1929771a1d04aca966c811498a53fbeaa632f6b0ca157                                                   0.0s 
 => => naming to docker.io/chromics/sustracker-backend:v2.0   
```

**Dockerhub:**

![Example Image](../images/docker-push.png)
![Example Image](../images/dockerhub.png)