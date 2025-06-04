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
process.env.JWT_SECRET = '<your-test-jwt-secret>';
process.env.NODE_ENV = 'test';
process.env.ENABLE_NOTIFICATIONS = 'false';
```

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

### Authentication Routes (`auth.test.js`)

* **Endpoints Covered**:

  * `POST /api/auth/register`
  * `POST /api/auth/login`

* **Key Tests**:

  * **Registration**

    * Successful registration with valid data
    * `409 Conflict` when email already exists
    * `400 Bad Request` for invalid email or short password
  * **Login**

    * Successful login returns JWT token and user info
    * `401 Unauthorized` for invalid credentials or non-existent user

* **Notes**:

  * Uses an email already inserted in `setup.js` (`user@test.com`) to test duplicate registration.
  * Checks payload structure (`status`, `message`, `data`).

---

### Actual Workouts (`actualWorkout.test.js`)

* **Endpoints Covered**:

  * `GET    /api/actual-workouts`
  * `POST   /api/actual-workouts`
  * `POST   /api/actual-workouts/from-planned/:plannedId`
  * `GET    /api/actual-workouts/history`
  * `GET    /api/actual-workouts/comparison`
  * `PUT    /api/actual-workouts/:id`
  * `DELETE /api/actual-workouts/:id`
  * `GET    /api/actual-workouts/monthly-calories`

* **Key Tests**:

  1. **GET /api/actual-workouts**

     * Returns an array of workouts for the authenticated user
     * Verifies `status === "success"` and correct result count

  2. **POST /api/actual-workouts**

     * Creates a new actual workout with multiple exercises
     * Verifies returned `title`, number of `actualExercises`, and `message`
     * Creates from a **planned workout** (passes `plannedId`), ensuring `plannedId` is set

  3. **POST /api/actual-workouts/from-planned/\:plannedId**

     * Creates actual workout using only `plannedId`, defaulting to planned exercises
     * `404 Not Found` when `plannedId` does not exist
     * **Enhanced**: Supports custom overrides of planned exercises (e.g. `plannedExerciseId`, custom `actualCalories`)
     * Prevents duplicate completions of the same planned workout (`400 Bad Request`)

  4. **GET /api/actual-workouts/history**

     * Pagination: query parameters `page` & `limit`
     * Date filtering: `startDate` & `endDate` in ISO format

  5. **GET /api/actual-workouts/comparison**

     * Returns planned vs actual adherence rate and list of workouts

  6. **PUT /api/actual-workouts/\:id**

     * Updates an existing workout’s fields (`title`, `actualDuration`, etc.)
     * `404 Not Found` if workout belongs to a different user

  7. **DELETE /api/actual-workouts/\:id**

     * Deletes an actual workout and verifies it no longer exists in DB

  8. **GET /api/actual-workouts/monthly-calories**

     * Returns an array of `{ month, totalCalories }` for the past `months` param (default 12)
     * `400 Bad Request` if `months` > 12 or invalid
     * Verifies structure and correct length of the returned array

---

### AI Interactions (`aiInteraction.test.js`)

* **Endpoints Covered**:

  * `POST   /api/ai/interactions`
  * `GET    /api/ai/interactions`
  * `GET    /api/ai/interactions/:id`
  * `DELETE /api/ai/interactions/:id`

* **Key Tests**:

  1. **POST /api/ai/interactions**

     * Creates an AI interaction record (`prompt`, `response`, `interactionType`) for the user
     * `400 Bad Request` when required fields are missing or `prompt.length > 5000`
     * `401 Unauthorized` if no auth header provided

  2. **GET /api/ai/interactions**

     * Returns a paginated list of the authenticated user’s interactions, default `page=1`, `limit=10`
     * Filters by `interactionType` (e.g. `WORKOUT_PLAN`, `DIET_ADVICE`)
     * `401 Unauthorized` if no auth header provided

  3. **GET /api/ai/interactions/\:id**

     * Returns a single AI interaction if it belongs to the authenticated user
     * `404 Not Found` for non-existent ID
     * `403 Forbidden` if interaction belongs to a different user

  4. **DELETE /api/ai/interactions/\:id**

     * Deletes a user’s AI interaction by ID
     * `403 Forbidden` if trying to delete another user’s interaction

---

### Booking Routes (`booking.test.js`)

* **Endpoints Covered**:

  * `GET    /api/bookings/my-bookings`
  * `GET    /api/bookings/upcoming`
  * `GET    /api/bookings/history`
  * `POST   /api/bookings`
  * `PUT    /api/bookings/:id/cancel`
  * `PUT    /api/bookings/:id/mark-attended`
  * `GET    /api/bookings/:id`

* **Setup for Each Test Group**:

  * Create a **Gym** owned by `gymOwner`
  * Create a **Gym Class** under that gym
  * Create a **Class Schedule** (future or past)
  * Create a **Membership Plan** & **User Membership** for the test user

* **Key Tests**:

  1. **GET /api/bookings/my-bookings**

     * Returns all bookings for authenticated user
     * `401 Unauthorized` if no auth header

  2. **GET /api/bookings/upcoming**

     * Returns all future bookings (no pagination in this test)

  3. **GET /api/bookings/history**

     * Pagination: `page`, `limit`
     * Should return past bookings only

  4. **POST /api/bookings**

     * Creates a booking given `scheduleId` & `membershipId`
     * `404 Not Found` if `scheduleId` does not exist
     * `400 Bad Request` if class is cancelled or schedule is past
     * `409 Conflict` for duplicate booking
     * `403 Forbidden` if membership’s weekly booking limit is reached

  5. **PUT /api/bookings/\:id/cancel**

     * Cancels an existing booking (`bookingStatus` → `cancelled`)
     * Decrements `currentBookings` on `classSchedule`
     * `404 Not Found` for invalid booking ID
     * `400 Bad Request` if booking is already cancelled or class is in the past

  6. **PUT /api/bookings/\:id/mark-attended**

     * Marks a past booking as `attended`
     * `400 Bad Request` for future class or already cancelled booking

  7. **GET /api/bookings/\:id**

     * Returns booking details by ID for authenticated user
     * `404 Not Found` if booking does not exist or belongs to another user

---

### Gym Classes (`classes.test.js`)

* **Endpoints Covered**:

  * `GET    /api/classes`
  * `GET    /api/classes/:id`
  * `POST   /api/classes`
  * `GET    /api/classes/:id/schedules`
  * `POST   /api/classes/:id/schedules`
  * `PUT    /api/classes/:id`
  * `DELETE /api/classes/:id`

* **Setup for Each Test Group**:

  * Create a **Gym** owned by `gymOwner`
  * Create a **Gym Class** (with fields: `name`, `description`, `maxCapacity`, `durationMinutes`, `membersOnly`, `difficultyLevel`, `isActive`)

* **Key Tests**:

  1. **GET /api/classes**

     * Returns a paginated list of all classes (`page=1`, `limit=10` by default)
     * Filters by `gymId`, `difficultyLevel`, and `search` (partial `name` match)

  2. **GET /api/classes/\:id**

     * Returns a single class by ID
     * `404 Not Found` if class does not exist

  3. **POST /api/classes**

     * Creates a new class (allowed roles: `gym_owner` for their own gym, `admin`)
     * `403 Forbidden` for regular users or gym owners creating for gyms they don’t own
     * `400 Bad Request` on missing required fields

  4. **GET /api/classes/\:id/schedules**

     * Returns all schedules for a class, optionally filtered by `startDate` & `endDate`

  5. **POST /api/classes/\:id/schedules**

     * Creates a class schedule (allowed roles: `gym_owner` for that class’s gym, `admin`)
     * Validates `startTime < endTime` → `400 Bad Request` if invalid

  6. **PUT /api/classes/\:id**

     * Updates class metadata (`description`, `maxCapacity`, etc.) (roles: `gym_owner` for that gym, `admin`)
     * `403 Forbidden` for unauthorized users

  7. **DELETE /api/classes/\:id**

     * If the class has future schedules, marks `isActive=false` (“deactivate”)
     * Otherwise, hard-deletes the class record (roles: `gym_owner` for that gym, `admin`)

---

### Competitions (`competitions.test.js`)

* **Endpoints Covered**:

  * `GET    /api/competitions`
  * `GET    /api/competitions/:id`
  * `POST   /api/competitions`
  * `POST   /api/competitions/:id/join`
  * `DELETE /api/competitions/:id/leave`
  * `POST   /api/competitions/:id/tasks`
  * `GET    /api/competitions/:id/leaderboard`
  * `GET    /api/competitions/user/competitions`
  * `GET    /api/competitions/:competitionId/tasks-list`
  * `PUT    /api/competitions/tasks/:taskId/progress`

* **Setup for Each Test Group**:

  * Create a **Gym** owned by `gymOwner`
  * Create a **Competition** under that gym (fields: `name`, `description`, `startDate`, `endDate`, `maxParticipants`, `isActive`)

* **Key Tests**:

  1. **GET /api/competitions**

     * Returns paginated list of competitions (filters: `gymId`, `isActive`, `search`)

  2. **GET /api/competitions/\:id**

     * Returns details of a single competition (`404` if not found)

  3. **POST /api/competitions**

     * Creates a competition (allowed roles: `gym_owner` for that gym, `admin`)
     * `403 Forbidden` for unauthorized users or gym owners creating for gyms they don’t own
     * `400 Bad Request` if `endDate < startDate`

  4. **POST /api/competitions/\:id/join**

     * Authenticated user joins a competition (`201 Created`)
     * `400 Bad Request` if already joined
     * `404 Not Found` if competition does not exist

  5. **DELETE /api/competitions/\:id/leave**

     * Authenticated user leaves a competition (`200 OK`)
     * `404 Not Found` if user has not joined or competition does not exist

  6. **POST /api/competitions/\:id/tasks**

     * Creates a competition task (`name`, `description`, `targetValue`, `unit`, `pointsValue`, `exerciseId`) (roles: `gym_owner` for that gym, `admin`)
     * `403 Forbidden` for unauthorized users

  7. **GET /api/competitions/\:id/leaderboard**

     * Returns scoreboard for competition, paginated (`page`, `limit`)

  8. **GET /api/competitions/user/competitions**

     * Returns list of competitions the authenticated user has joined, with optional `active=true|false` filter

  9. **GET /api/competitions/\:competitionId/tasks-list**

     * Returns all tasks for a competition

  10. **PUT /api/competitions/tasks/\:taskId/progress**

      * Updates a user’s progress on a specific task (fields: `currentValue`, `notes`)
      * Marks task as completed if `currentValue >= targetValue`

---

### Diet Entries (`dietEntries.test.js`)

* **Endpoints Covered**:

  * `GET    /api/diet`
  * `GET    /api/diet/all`
  * `POST   /api/diet`
  * `GET    /api/diet/:id`
  * `PUT    /api/diet/:id`
  * `DELETE /api/diet/:id`
  * `GET    /api/diet/summary`
  * `GET    /api/diet/monthly-calories-consumed`

* **Setup for Each Test Group**:

  * **beforeEach**: Create one `FoodItem` (`testFoodItem`) in the test database

* **Key Tests**:

  1. **GET /api/diet**

     * Returns paginated diet entries (filters: `startDate`, `endDate`, `mealType`)

  2. **GET /api/diet/all**

     * Returns all diet entries for user (no pagination)

  3. **POST /api/diet**

     * Creates a diet entry (`foodId`, `quantity`, `consumptionDate`, `mealType`, `notes`)
     * Automatically calculates `calories = food.caloriesPerUnit * quantity`
     * `404 Not Found` for invalid `foodId`
     * `400 Bad Request` for missing required fields
     * **Enhanced Validation**:

       * Accepts any string for `mealType` (defaults to `Uncategorized` if missing)
       * Allows `notes` to be `null`

  4. **GET /api/diet/\:id**

     * Returns a single diet entry by ID if it belongs to the authenticated user
     * `404 Not Found` if not found, `403 Forbidden` if belongs to another user

  5. **PUT /api/diet/\:id**

     * Updates `quantity`, `mealType`, `notes`; recalculates `calories` based on new quantity
     * `403 Forbidden` if entry belongs to another user

  6. **DELETE /api/diet/\:id**

     * Deletes a diet entry by ID; verifies removal from DB
     * `403 Forbidden` if entry belongs to another user

  7. **GET /api/diet/summary**

     * Returns summary stats for authenticated user:

       * `totalEntries`
       * `totalCalories`
       * `dailyCalories` (array of `{ date, totalCalories }`)
       * `mealTypeSummary` (object mapping each mealType to total calories)
     * Optional date-range filter

  8. **GET /api/diet/monthly-calories-consumed**

     * Returns an array of `{ month, totalCalories }` for the past `months` param (default 12)
     * `400 Bad Request` if `months` > 12 or invalid
     * Verifies that “current month” entry has non-zero calories when entries exist

---

### Exercises (`exercises.test.js`)

* **Endpoints Covered**:

  * `GET    /api/exercises`
  * `GET    /api/exercises/:id`
  * `POST   /api/exercises`
  * `PUT    /api/exercises/:id`
  * `DELETE /api/exercises/:id`

* **Key Tests**:

  1. **GET /api/exercises**

     * Returns all exercises for authenticated user (pagination, filters: `category`, `search`)

  2. **GET /api/exercises/\:id**

     * Returns one exercise by ID
     * `404 Not Found` if not found
     * `400 Bad Request` if `:id` is not a valid integer

  3. **POST /api/exercises**

     * Creates a new exercise (`name`, `category`, `description`, `imageUrl`) (roles: `admin` only)
     * `403 Forbidden` for non-admin users or missing auth
     * `409 Conflict` for duplicate `name`

  4. **PUT /api/exercises/\:id**

     * Updates fields (`description`, `imageUrl`, etc.) (role: `admin` only)
     * `403 Forbidden` for non-admin

  5. **DELETE /api/exercises/\:id**

     * Deletes an exercise (role: `admin`)
     * `403 Forbidden` for non-admin users
     * Verifies exercise no longer exists in DB

---

### Food Items (`foodItems.test.js`)

* **Endpoints Covered**:

  * `GET    /api/food-items`
  * `GET    /api/food-items/all`
  * `GET    /api/food-items/:id`
  * `POST   /api/food-items`
  * `PUT    /api/food-items/:id`
  * `DELETE /api/food-items/:id`

* **Key Tests**:

  1. **GET /api/food-items**

     * Returns paginated list of all food items (filters: `search`)

  2. **GET /api/food-items/all**

     * Returns all food items without pagination

  3. **GET /api/food-items/\:id**

     * Returns one food item by ID
     * `404 Not Found` if not found

  4. **POST /api/food-items**

     * Creates a new food item (`name`, `caloriesPerUnit`, `servingUnit`, `description`) (role: `admin`)
     * `403 Forbidden` for non-admin
     * `409 Conflict` for duplicate `name`

  5. **PUT /api/food-items/\:id**

     * Updates fields (`description`, `caloriesPerUnit`, etc.) (role: `admin`)
     * `403 Forbidden` for non-admin

  6. **DELETE /api/food-items/\:id**

     * Deletes a food item if it is not referenced in any `dietEntry`
     * If used in existing diet entries, returns `400 Bad Request` with message indicating the item “is used in”
     * `403 Forbidden` for non-admin

---

### Gyms (`gyms.test.js`)

* **Endpoints Covered**:

  * `GET    /api/gyms`
  * `GET    /api/gyms/:id`
  * `POST   /api/gyms`
  * `PUT    /api/gyms/:id`
  * `DELETE /api/gyms/:id`
  * `GET    /api/gyms/statistics/total-count`
  * `GET    /api/gyms?paginate=false` (enhanced pagination)
  * `GET    /api/gyms/all/user-view`
  * `GET    /api/gyms/owned/my-gyms`
  * `GET    /api/gyms/:id/classes`
  * `GET    /api/gyms/:id/membership-plans`

* **Key Tests**:

  1. **GET /api/gyms**

     * Default pagination (`page=1`, `limit=10`)
     * `paginate=false` returns all gyms without pagination
     * Filters: `search` (by `name`)

  2. **GET /api/gyms/\:id**

     * Returns one gym by ID
     * `404 Not Found` if gym does not exist

  3. **POST /api/gyms**

     * Creates a new gym (`name`, `address`, `description`, `contactInfo`) (roles: `gym_owner` or `admin`)
     * If `gym_owner`, sets `ownerId = authenticated user.id`
     * `403 Forbidden` for regular users
     * `401 Unauthorized` if no auth header

  4. **PUT /api/gyms/\:id**

     * Updates gym fields (`description`, `contactInfo`, `name`, etc.) (roles: `gym_owner` if they own it, or `admin`)
     * `403 Forbidden` if a different user tries to update

  5. **DELETE /api/gyms/\:id**

     * Deletes a gym (role: `admin` only)
     * `403 Forbidden` for non-admin

  6. **GET /api/gyms/statistics/total-count**

     * Returns `{ totalGyms: <number> }` (role: `admin`)
     * `403 Forbidden` for non-admin

  7. **GET /api/gyms/all/user-view**

     * Returns all gyms for any authenticated user (`admin`, `gym_owner`, or `user`)

  8. **GET /api/gyms/owned/my-gyms**

     * Returns paginated list of gyms owned by the authenticated `gym_owner`
     * `403 Forbidden` for non-`gym_owner`

  9. **GET /api/gyms/\:id/classes**

     * Returns the classes (`gymClass`) under a specific gym, paginated
     * `404 Not Found` if gym does not exist

  10. **GET /api/gyms/\:id/membership-plans**

      * Returns membership plans under a gym, paginated

---

### Membership Plans (`membershipPlans.test.js`)

* **Endpoints Covered**:

  * `GET    /api/membership-plans/plans/:planId`
  * `PUT    /api/membership-plans/plans/:planId`
  * `DELETE /api/membership-plans/plans/:planId`
  * `POST   /api/gyms/:gymId/membership-plans`

* **Setup for Each Test Group**:

  * Create a **Gym** owned by `gymOwner`
  * Create a **Membership Plan** under that gym (`name`, `description`, `durationDays`, `price`, `maxBookingsPerWeek`, `isActive`)

* **Key Tests**:

  1. **GET /api/membership-plans/plans/\:planId**

     * Returns one membership plan by ID
     * `404 Not Found` if not found

  2. **PUT /api/membership-plans/plans/\:planId**

     * Updates a plan’s fields (`description`, `price`, `maxBookingsPerWeek`, `name`) (roles: `gym_owner` for that gym, `admin`)
     * `403 Forbidden` if gym owner doesn’t own that gym or regular user
     * `409 Conflict` when trying to rename to a name that already exists within the same gym
     * `400 Bad Request` for invalid data (e.g., negative price)

  3. **DELETE /api/membership-plans/plans/\:planId**

     * If no active subscriptions exist for that plan, hard-delete the plan (role: `gym_owner` or `admin`)
     * If active `userMembership` records exist, mark `isActive=false` (“deactivate”) instead of deletion
     * `403 Forbidden` for unauthorized users

  4. **POST /api/gyms/\:gymId/membership-plans**

     * Creates a new membership plan under a specific gym (roles: `gym_owner` for that gym, `admin`)
     * `404 Not Found` if gym does not exist
     * `403 Forbidden` if a gym owner tries to create for a gym they don’t own
     * `409 Conflict` if a plan with the same `name` already exists under that gym
     * `400 Bad Request` for missing required fields

---

### Memberships (`memberships.test.js`)

* **Endpoints Covered**:

  * `GET    /api/memberships/my-memberships`
  * `GET    /api/memberships/:id`
  * `POST   /api/memberships/subscribe`
  * `PUT    /api/memberships/:id`
  * `POST   /api/memberships/:id/cancel`
  * `GET    /api/memberships/:id/payments`

* **Setup for Each Test Group**:

  * Create a **Gym** owned by `gymOwner`
  * Create a **Membership Plan** under that gym
  * Create a **User Membership** record for the test user (`status: "active"`, `autoRenew: false`, etc.)

* **Key Tests**:

  1. **GET /api/memberships/my-memberships**

     * Returns all memberships for the authenticated user (`status`, `startDate`, `endDate`, etc.)
     * `401 Unauthorized` if no auth header

  2. **GET /api/memberships/\:id**

     * Returns one membership by ID if owned by the authenticated user
     * `404 Not Found` if not found or belongs to another user

  3. **POST /api/memberships/subscribe**

     * Creates a new user membership subscription (fields: `gymId`, `planId`, `autoRenew`, `paymentMethod`)
     * Automatically creates a `membershipPayment` record (fields: `amount`, `paymentDate`, `paymentMethod`, `status`, `transactionId`)
     * `404 Not Found` if `planId` does not exist
     * `409 Conflict` if user already has an active membership at that gym
     * `400 Bad Request` for missing required fields

  4. **PUT /api/memberships/\:id**

     * Updates fields on an existing membership (e.g. toggle `autoRenew`)
     * `400 Bad Request` if membership is no longer active (`status !== "active"`)

  5. **POST /api/memberships/\:id/cancel**

     * Cancels an active membership (`status → “cancelled”`, `autoRenew → false`)
     * Verifies in DB that membership fields are updated
     * `400 Bad Request` if already cancelled

  6. **GET /api/memberships/\:id/payments**

     * Returns a list of all payments associated with a membership (`membershipPayment` records)
     * `404 Not Found` if membership belongs to another user

---

### Planned Workouts (`plannedWorkouts.test.js`)

* **Endpoints Covered**:

  * `GET    /api/planned-workouts`
  * `POST   /api/planned-workouts`
  * `GET    /api/planned-workouts/upcoming`
  * `GET    /api/planned-workouts/:id`
  * `PUT    /api/planned-workouts/:id`
  * `DELETE /api/planned-workouts/:id`

* **Key Tests**:

  1. **GET /api/planned-workouts**

     * Returns all planned workouts for the authenticated user
     * `401 Unauthorized` if no auth header

  2. **POST /api/planned-workouts**

     * Creates a planned workout (`title`, `scheduledDate`, `estimatedDuration`, `exercises` array)
     * Each exercise has `exerciseId`, `plannedSets`, `plannedReps`, optional `plannedWeight`
     * `400 Bad Request` if any `exerciseId` does not exist or `exercises` is empty

  3. **GET /api/planned-workouts/upcoming**

     * Returns planned workouts scheduled in the future (optional `days` filter)

  4. **GET /api/planned-workouts/\:id**

     * Returns one planned workout by ID if owned by user
     * `404 Not Found` if not found or belongs to another user

  5. **PUT /api/planned-workouts/\:id**

     * Updates metadata (`title`, `scheduledDate`, `estimatedDuration`)
     * `400 Bad Request` if the planned workout has already been “completed” (i.e., an `actualWorkout` exists with `plannedId`)

  6. **DELETE /api/planned-workouts/\:id**

     * Deletes a planned workout if no actual workout is linked
     * `400 Bad Request` if an `actualWorkout` already exists for that `plannedId`

---

### Statistics (`statistics.test.js`)

* **Endpoints Covered**:

  * `GET /api/statistics/dashboard`
  * `GET /api/statistics/exercise/:exerciseId`

* **Setup for Each Test Group**:

  * Create at least one **Actual Workout** dated in the past (e.g., `completedDate = 7 days ago`) with one exercise subrecord

* **Key Tests**:

  1. **GET /api/statistics/dashboard**

     * Returns a comprehensive stats object:

       * `completedWorkoutSessions` (count of all completed workouts)
       * `currentMonthCompletionRate` (percentage)
       * `monthlyCompletedWorkouts` (array of `{ month, count }`)
       * `workoutsByYear` (array of yearly completion counts)
       * `longestStreak`, `currentStreak` (max consecutive days/weeks with ≥1 workout)
       * `bestRecords` (personal records for each tracked exercise)
       * `topExercises` (array of most frequently performed exercises)
     * `401 Unauthorized` if no auth header

  2. **GET /api/statistics/exercise/\:exerciseId**

     * Returns progress data for one exercise (`id`, `name`, and an array of `{ date, value }` for past sessions)
     * `404 Not Found` if exercise does not exist
     * `400 Bad Request` if `:exerciseId` is not an integer

---

### User Routes (`users.test.js`)

* **Endpoints Covered**:

  * `GET    /api/users/profile`
  * `PUT    /api/users/profile`
  * `GET    /api/users/admin/all-users`
  * `PUT    /api/users/admin/change-role/:id`
  * `GET    /api/users/admin/statistics/counts`
  * `GET    /api/users/admin/statistics/monthly-signups`
  * `GET    /api/users/gym-owner/dashboard-stats`
  * `PUT    /api/users/profile/image`

* **Key Tests**:

  1. **GET /api/users/profile**

     * Returns authenticated user’s profile (`email`, `displayName`, `role`)
     * `401 Unauthorized` if no auth header

  2. **PUT /api/users/profile**

     * Updates fields (`displayName`, `gender`, `heightCm`, `weightKg`, `dateOfBirth`)
     * Updates password if both `currentPassword` and `newPassword` are provided and valid
     * `400 Bad Request` if `newPassword` is provided without `currentPassword` or if `currentPassword` is incorrect

  3. **GET /api/users/admin/all-users**

     * Returns paginated list of all users (filter by `role`, `search` on email or name) (role: `admin`)
     * `403 Forbidden` for non-admin

  4. **PUT /api/users/admin/change-role/\:id**

     * Changes a user’s `role` to one of `[admin, gym_owner, user]` (role: `admin`)
     * `403 Forbidden` for non-admin, `400 Bad Request` for invalid role

  5. **GET /api/users/admin/statistics/counts**

     * Returns `{ totalUsers, totalAdmins, totalGymOwners, totalRegularUsers }` (role: `admin`)
     * `403 Forbidden` for non-admin

  6. **GET /api/users/admin/statistics/monthly-signups**

     * Returns an array of `{ month (YYYY-MM), count }` for recent months
     * `403 Forbidden` for non-admin

  7. **GET /api/users/gym-owner/dashboard-stats**

     * Returns stats specific to a gym owner:

       * `totalOwnedGyms`
       * `totalBookingsInOwnedGyms`
       * `revenueThisMonth` (sum of membership payments for gyms owned)
     * `403 Forbidden` for any role other than `gym_owner`

  8. **PUT /api/users/profile/image**

     * Endpoint to upload or update profile image (no file provided in tests → expects `400` or `500`)
     * `401 Unauthorized` if no auth header

---

### Utilities (`utils/auth.js`)

* **Purpose**: Helper functions for generating JWT tokens and authorization headers used in Supertest calls.

* **Exports**:

  * `generateToken(user)`: Signs a JWT payload containing `{ id, email, role }` using `process.env.JWT_SECRET`.
  * `getAuthHeader(user)`: Returns `Bearer <token>`.

* **Usage**:

  ```js
  const { getAuthHeader } = require('./utils/auth');
  const tokenHeader = getAuthHeader(global.testUsers.user);
  // e.g. .set('Authorization', tokenHeader)
  ```

---

## Coverage Configuration

In `package.json`, the `"jest"` section includes:

```jsonc
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
]
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



