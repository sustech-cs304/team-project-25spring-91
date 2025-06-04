# SUSTracker API Documentation

This document provides comprehensive details for developers to understand and utilize the Workout Tracker API. The API is designed to support a fitness tracking application, enabling users to manage exercises, plan and log workouts, track diet, participate in gym classes and competitions, and interact with AI features. It is built using Express.js, Prisma ORM, and PostgreSQL, with authentication mechanisms including JWT and OAuth (Google, GitHub, Microsoft).

## Table of Contents
1. **[Overview](#overview)**
2. **[Authentication](#authentication)**
3. **[API Endpoints](#api-endpoints)**
   - **[Authentication Routes](#authentication-routes)**
   - **[User Routes](#user-routes)**
   - **[Exercise Routes](#exercise-routes)**
   - **[Planned Workout Routes](#planned-workout-routes)**
   - **[Actual Workout Routes](#actual-workout-routes)**
   - **[Statistics Routes](#statistics-routes)**
   - **[Gym Routes](#gym-routes)**
   - **[Membership Routes](#membership-routes)**
   - **[Membership Plan Routes](#membership-plan-routes)**
   - **[Class Routes](#class-routes)**
   - **[Class Schedule Routes](#class-schedule-routes)**
   - **[Booking Routes](#booking-routes)**
   - **[Competition Routes](#competition-routes)**
   - **[Competition Participant Routes](#competition-participant-routes)**
   - **[Competition Task Routes](#competition-task-routes)**
   - **[Competition Progress Routes](#competition-progress-routes)**
   - **[Membership Payment Routes](#membership-payment-routes)**
   - **[Food Item Routes](#food-item-routes)**
   - **[Diet Entry Routes](#diet-entry-routes)**
   - **[AI Interaction Routes](#ai-interaction-routes)**
   - **[Upload Routes](#upload-routes)**
4. **[Data Models](#data-models)**
5. **[Error Handling](#error-handling)**
6. **[Middleware](#middleware)**
7. **[Setup and Configuration](#setup-and-configuration)**

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

---

## API Endpoints

Below is a detailed list of all API endpoints, organized by route group. Each endpoint includes the HTTP method, path, description, required headers, request body/query parameters, and response format.

### Authentication Routes (`/api/auth`)

**Purpose**: Handles user authentication, including login, registration, and OAuth flows.

#### `POST /api/auth/register`
- **Description**: Registers a new user with email, password, and optional profile details.
- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "displayName": "string (optional)",
    "dateOfBirth": "ISO8601 string (optional)",
    "gender": "string (optional)",
    "heightCm": "integer (optional)",
    "weightKg": "number (optional)"
  }
  ```
- **Response**:
  - **201**: User created successfully.
    ```json
    {
      "status": "success",
      "data": {
        "user": {
          "id": "integer",
          "email": "string",
          "displayName": "string",
          "role": "string"
        },
        "token": "string"
      }
    }
    ```
  - **400**: Validation error.
  - **409**: Email already exists.

#### `POST /api/auth/login`
- **Description**: Authenticates a user with email and password, returning a JWT.
- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  - **200**: Login successful.
    ```json
    {
      "status": "success",
      "data": {
        "user": {
          "id": "integer",
          "email": "string",
          "displayName": "string",
          "role": "string"
        },
        "token": "string"
      }
    }
    ```
  - **401**: Invalid credentials.

#### `GET /api/auth/google`, `GET /api/auth/github`, `GET /api/auth/microsoft`
- **Description**: Initiates OAuth flow for respective providers.
- **Response**: Redirects to the provider's authentication page.

#### `GET /api/auth/google/callback`, `GET /api/auth/github/callback`, `GET /api/auth/microsoft/callback`
- **Description**: Handles OAuth callback, creates/links user, and returns a JWT.
- **Response**:
  - Redirects to frontend with token in query parameter or cookie.
  - **401**: Authentication failed.

---

### User Routes (`/api/users`)

**Purpose**: Manages user profiles and related data. Requires `authMiddleware`.

#### `GET /api/users`
- **Description**: Retrieves a list of users (admin-only).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  - `role`: Filter by role (`user`, `gym_owner`, `admin`) (optional).
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "email": "string",
          "displayName": "string",
          "role": "string",
          "createdAt": "ISO8601 string"
        }
      ]
    }
    ```
  - **403**: Insufficient permissions.

#### `GET /api/users/:id`
- **Description**: Retrieves a specific user's details.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: User ID (integer).
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "data": {
        "id": "integer",
        "email": "string",
        "displayName": "string",
        "role": "string",
        "dateOfBirth": "ISO8601 string",
        "gender": "string",
        "heightCm": "integer",
        "weightKg": "number",
        "imageUrl": "string"
      }
    }
    ```
  - **404**: User not found.

#### `PUT /api/users/:id`
- **Description**: Updates a user's profile (user can update own profile; admin can update any).
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Parameters**:
  - `id`: User ID (integer).
- **Body**:
  ```json
  {
    "displayName": "string (optional)",
    "dateOfBirth": "ISO8601 string (optional)",
    "gender": "string (optional)",
    "heightCm": "integer (optional)",
    "weightKg": "number (optional)",
    "imageUrl": "string (optional)"
  }
  ```
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "message": "User updated successfully",
      "data": { /* updated user object */ }
    }
    ```
  - **403**: Unauthorized.
  - **404**: User not found.

#### `DELETE /api/users/:id`
- **Description**: Deletes a user (admin-only or self).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: User ID (integer).
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "message": "User deleted successfully"
    }
    ```
  - **403**: Unauthorized.
  - **404**: User not found.

#### `POST /api/users/:id/image`
- **Description**: Uploads a profile image for a user.

- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
  
- **Parameters**:
  - `id`: User ID (integer).
  
- **Form Data**:
  - `image`: Image file (max 5MB, image formats only).
  
- **Response**:
  - **201**:
    ```json
    {
      "status": "success",
      "message": "Image uploaded successfully",
      "data": {
        "imageUrl": "string"
      }
    }
    ```
    
  - **400**: Invalid file type or size.

### User Profile and Administrative Routes

#### `GET /api/users/profile`

- **Description**: Retrieves the authenticated user's profile.

- **Headers**:

  - `Authorization: Bearer <token>`

- **Response**:

  - **200**:

    ```
    {
      "status": "success",
      "data": {
        "id": "integer",
        "email": "string",
        "displayName": "string",
        "dateOfBirth": "ISO8601 string",
        "gender": "string",
        "heightCm": "integer",
        "weightKg": "number",
        "role": "string",
        "imageUrl": "string",
        "createdAt": "ISO8601 string"
      }
    }
    ```

#### `PUT /api/users/profile`

- **Description**: Updates the authenticated user's profile.

- **Headers**:

  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data` (if uploading image) or `application/json`

- **Body** (JSON):

  ```
  {
    "displayName": "string (optional)",
    "dateOfBirth": "ISO8601 string (optional)",
    "gender": "string (optional)",
    "heightCm": "integer (optional)",
    "weightKg": "number (optional)",
    "currentPassword": "string (optional)",
    "newPassword": "string (optional)"
  }
  ```

- **Form Data** (if uploading image):

  - `image`: Image file (optional)
  - Other fields as JSON

- **Response**:

  - **200**:

    ```
    {
      "status": "success",
      "message": "Profile updated successfully",
      "data": { /* updated user object */ }
    }
    ```

#### `PUT /api/users/profile/image`

- **Description**: Updates the authenticated user's profile image.

- **Headers**:

  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`

- **Form Data**:

  - `image`: Image file (required, max 5MB)

- **Response**:

  - **201**:

    ```
    {
      "status": "success",
      "message": "Profile image updated successfully",
      "data": {
        "imageUrl": "string"
      }
    }
    ```

#### `GET /api/users/stats`

- **Description**: Retrieves workout statistics for the authenticated user.

- **Headers**:

  - `Authorization: Bearer <token>`

- **Response**:

  - **200**:

    ```
    {
      "status": "success",
      "data": { /* workout statistics object */ }
    }
    ```

#### `GET /api/users/admin/all-users`

- **Description**: Retrieves all users (admin-only).

- **Headers**:

  - `Authorization: Bearer <token>`

- **Query Parameters**:

  - `page`: Page number (optional, default: 1).
  - `limit`: Items per page (optional, default: 20).
  - `role`: Filter by role (optional).
  - `search`: Search by email or display name (optional).

- **Response**:

  - **200**:

    ```
    {
      "status": "success",
      "results": "integer",
      "pagination": {
        "total": "integer",
        "pages": "integer",
        "page": "integer",
        "limit": "integer"
      },
      "data": [ /* array of user objects */ ]
    }
    ```

#### `PUT /api/users/admin/change-role/:id`

- **Description**: Changes a user's role (admin-only).

- **Headers**:

  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

- **Parameters**:

  - `id`: User ID (integer).

- **Body**:

  json

  Copy

  ```
  {
    "role": "string (admin|gym_owner|user)"
  }
  ```

- **Response**:

  - **200**:

    ```
    {
      "status": "success",
      "message": "User role updated successfully",
      "data": { /* updated user object */ }
    }
    ```

#### `GET /api/users/admin/statistics/counts`

- **Description**: Retrieves user counts by role (admin-only).

- **Headers**:

  - `Authorization: Bearer <token>`

- **Response**:

  - **200**:

    ```
    {
      "status": "success",
      "data": {
        "totalUsers": "integer",
        "totalGymOwners": "integer",
        "totalAdmins": "integer",
        "totalRegularUsers": "integer"
      }
    }
    ```

#### `GET /api/users/admin/statistics/monthly-signups`

- **Description**: Retrieves monthly user signup statistics (admin-only).

- **Headers**:

  - `Authorization: Bearer <token>`

- **Response**:

  - **200**:

    ```
    {
      "status": "success",
      "data": [
        {
          "month": "string (YYYY-MM)",
          "count": "integer"
        }
      ]
    }
    ```

#### `GET /api/users/gym-owner/dashboard-stats`

- **Description**: Retrieves dashboard statistics for gym owners.

- **Headers**:

  - `Authorization: Bearer <token>`

- **Response**:

  - **200**:

    ```
    {
      "status": "success",
      "data": {
        "totalOwnedGyms": "integer",
        "totalBookingsInOwnedGyms": "integer",
        "revenueThisMonth": "number"
      }
    }
    ```



---

### Exercise Routes (`/api/exercises`)

**Purpose**: Manages exercise data. Public for retrieval; admin-only for creation/update/deletion.

#### `GET /api/exercises`
- **Description**: Retrieves a list of exercises.
- **Query Parameters**:
  - `category`: Filter by exercise category (optional).
  - `search`: Search by exercise name (optional).
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "name": "string",
          "category": "string",
          "description": "string",
          "imageUrl": "string",
          "createdAt": "ISO8601 string"
        }
      ]
    }
    ```

#### `GET /api/exercises/:id`
- **Description**: Retrieves a specific exercise by ID.
- **Parameters**:
  - `id`: Exercise ID (integer).
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "data": { /* exercise object */ }
    }
    ```
  - **404**: Exercise not found.

#### `POST /api/exercises`
- **Description**: Creates a new exercise (admin-only).
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "name": "string",
    "category": "string (optional)",
    "description": "string (optional)",
    "imageUrl": "string (optional)"
  }
  ```
- **Response**:
  - **201**:
    ```json
    {
      "status": "success",
      "message": "Exercise created successfully",
      "data": { /* new exercise object */ }
    }
    ```
  - **400**: Validation error.
  - **409**: Exercise name already exists.

#### `PUT /api/exercises/:id`
- **Description**: Updates an exercise (admin-only).
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Parameters**:
  - `id`: Exercise ID (integer).
- **Body**:
  ```json
  {
    "name": "string (optional)",
    "category": "string (optional)",
    "description": "string (optional)",
    "imageUrl": "string (optional)"
  }
  ```
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "message": "Exercise updated successfully",
      "data": { /* updated exercise object */ }
    }
    ```
  - **404**: Exercise not found.
  - **409**: Name conflict.

#### `DELETE /api/exercises/:id`
- **Description**: Deletes an exercise (admin-only).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: Exercise ID (integer).
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "message": "Exercise deleted successfully"
    }
    ```
  - **400**: Exercise used in workouts.
  - **404**: Exercise not found.

#### `POST /api/exercises/:id/image`
- **Description**: Uploads an image for an exercise (admin-only).
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Parameters**:
  - `id`: Exercise ID (integer).
- **Form Data**:
  - `image`: Image file (max 5MB).
- **Response**:
  - **201**:
    ```json
    {
      "status": "success",
      "message": "Image uploaded successfully",
      "data": {
        "imageUrl": "string"
      }
    }
    ```

---

### Planned Workout Routes (`/api/planned-workouts`)

**Purpose**: Manages planned workouts for authenticated users.

#### `GET /api/planned-workouts`
- **Description**: Retrieves all planned workouts for the authenticated user.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "userId": "integer",
          "title": "string",
          "scheduledDate": "ISO8601 string",
          "estimatedDuration": "integer",
          "reminderSent": "boolean",
          "createdAt": "ISO8601 string",
          "plannedExercises": [ /* planned exercise objects */ ]
        }
      ]
    }
    ```

#### `GET /api/planned-workouts/upcoming`
- **Description**: Retrieves upcoming workouts for the authenticated user.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  - `days`: Number of days to look ahead (default: 7).
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [ /* planned workout objects */ ]
    }
    ```

#### `GET /api/planned-workouts/:id`
- **Description**: Retrieves a specific planned workout.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: Workout ID (integer).
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "data": { /* planned workout object */ }
    }
    ```
  - **404**: Workout not found.

#### `POST /api/planned-workouts`
- **Description**: Creates a new planned workout.
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "title": "string",
    "scheduledDate": "ISO8601 string",
    "estimatedDuration": "integer (optional)",
    "plannedExercises": [
      {
        "exerciseId": "integer",
        "plannedSets": "integer (optional)",
        "plannedReps": "integer (optional)",
        "plannedWeight": "number (optional)",
        "plannedDuration": "integer (optional)",
        "plannedCalories": "integer (optional)"
      }
    ]
  }
  ```
- **Response**:
  - **201**:
    ```json
    {
      "status": "success",
      "message": "Workout created successfully",
      "data": { /* new workout object */ }
    }
    ```

#### `PUT /api/planned-workouts/:id`
- **Description**: Updates a planned workout.
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Parameters**:
  - `id`: Workout ID (integer).
- **Body**:
  ```json
  {
    "title": "string (optional)",
    "scheduledDate": "ISO8601 string (optional)",
    "estimatedDuration": "integer (optional)",
    "plannedExercises": [ /* same as POST */ ]
  }
  ```
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "message": "Workout updated successfully",
      "data": { /* updated workout object */ }
    }
    ```

#### `DELETE /api/planned-workouts/:id`
- **Description**: Deletes a planned workout.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: Workout ID (integer).
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "message": "Workout deleted successfully"
    }
    ```

---

### Actual Workout Routes (`/api/actual-workouts`)

**Purpose**: Manages logged (completed) workouts.

#### `GET /api/actual-workouts`
- **Description**: Retrieves all completed workouts for the authenticated user.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "userId": "integer",
          "title": "string",
          "completedDate": "ISO8601 string",
          "completedTime": "ISO8601 string",
          "actualDuration": "integer",
          "actualExercises": [ /* actual exercise objects */ ]
        }
      ]
    }
    ```

#### `GET /api/actual-workouts/:id`
- **Description**: Retrieves a specific completed workout.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: Workout ID (integer).
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "data": { /* actual workout object */ }
    }
    ```

#### `POST /api/actual-workouts`
- **Description**: Logs a new completed workout.
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "title": "string",
    "completedDate": "ISO8601 string",
    "completedTime": "ISO8601 string (optional)",
    "actualDuration": "integer (optional)",
    "plannedId": "integer (optional)",
    "actualExercises": [
      {
        "exerciseId": "integer",
        "plannedExerciseId": "integer (optional)",
        "actualSets": "integer (optional)",
        "actualReps": "integer (optional)",
        "actualWeight": "number (optional)",
        "actualDuration": "integer (optional)",
        "actualCalories": "integer (optional)"
      }
    ]
  }
  ```
- **Response**:
  - **201**:
    ```json
    {
      "status": "success",
      "message": "Workout logged successfully",
      "data": { /* new workout object */ }
    }
    ```

#### `PUT /api/actual-workouts/:id`
- **Description**: Updates a completed workout.
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Parameters**:
  - `id`: Workout ID (integer).
- **Body**:
  ```json
  {
    "title": "string (optional)",
    "completedDate": "ISO8601 string (optional)",
    "completedTime": "ISO8601 string (optional)",
    "actualDuration": "integer (optional)",
    "actualExercises": [ /* same as POST */ ]
  }
  ```
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "message": "Workout updated successfully",
      "data": { /* updated workout object */ }
    }
    ```

#### `DELETE /api/actual-workouts/:id`
- **Description**: Deletes a completed workout.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: Workout ID (integer).
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "message": "Workout deleted successfully"
    }
    ```

#### `GET /api/actual-workouts/monthly-calories`

- **Description**: Retrieves monthly calorie burn data from workouts for the authenticated user.

- **Headers**:

  - `Authorization: Bearer <token>`

- **Query Parameters**:

  - `months`: Number of months to retrieve (optional, default: 12, max: 60).

- **Response**:

  - **200**:

    ```
    {
      "status": "success",
      "data": [
        {
          "month": "string (YYYY-MM)",
          "totalCalories": "number"
        }
      ]
    }
    ```

#### `POST /api/actual-workouts/from-planned/:plannedId`

- **Description**: Creates an actual workout from a planned workout template.

- **Headers**:

  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

- **Parameters**:

  - `plannedId`: Planned workout ID (integer).

- **Body**: 

  ```
  {
    "completedDate": "ISO8601 string",
    "completedTime": "string (HH:MM, optional)",
    "actualDuration": "integer (optional)",
    "exercises": [
      {
        "plannedExerciseId": "integer",
        "exerciseId": "integer",
        "actualSets": "integer (optional)",
        "actualReps": "integer (optional)",
        "actualWeight": "number (optional)",
        "actualDuration": "integer (optional)",
        "actualCalories": "integer (optional)"
      }
    ]
  }
  ```

- **Response**:

  - **201**:

    ```
    {
      "status": "success",
      "message": "Workout logged successfully from planned workout",
      "data": { /* new workout object */ }
    }
    ```

#### `GET /api/actual-workouts/history`

- **Description**: Retrieves paginated workout history for the authenticated user.

- **Headers**:

  - `Authorization: Bearer <token>`

- **Query Parameters**:

  - `startDate`: Filter by start date (optional, ISO8601).
  - `endDate`: Filter by end date (optional, ISO8601).
  - `limit`: Items per page (optional, default: 10).
  - `page`: Page number (optional, default: 1).

- **Response**:

  - **200**:

    ```
    {
      "status": "success",
      "results": "integer",
      "pagination": {
        "page": "integer",
        "limit": "integer",
        "totalPages": "integer",
        "totalItems": "integer"
      },
      "data": [ /* array of workout objects */ ]
    }
    ```

#### `GET /api/actual-workouts/comparison`

- **Description**: Retrieves comparison data between planned and actual workouts for the authenticated user.

- **Headers**:

  - `Authorization: Bearer <token>`

- **Response**:

  - **200**:

    ```
    {
      "status": "success",
      "data": {
        "adherenceRate": "number",
        "workoutCount": "integer",
        "avgDateDeviation": "number",
        "avgDurationDeviation": "number",
        "workouts": [ /* array of comparison objects */ ]
      }
    }
    ```

----

### Statistics Routes (`/api/statistics`)

**Purpose**: Provides user workout statistics (implementation details not fully provided in the code, but assumed to aggregate workout data).

#### `GET /api/statistics`
- **Description**: Retrieves workout statistics for the authenticated user.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  - `startDate`: Filter by start date (optional).
  - `endDate`: Filter by end date (optional).
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "data": {
        "totalWorkouts": "integer",
        "totalCaloriesBurned": "number",
        "totalDuration": "integer"
        // Additional metrics as implemented
      }
    }
    ```

---

### Gym Routes (`/api/gyms`)

**Purpose**: Manages gym data. Public for retrieval; creation/update requires ownership or admin.

#### `GET /api/gyms`
- **Description**: Retrieves a list of gyms.
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "name": "string",
          "address": "string",
          "description": "string",
          "contactInfo": "string",
          "imageUrl": "string",
          "ownerId": "integer"
        }
      ]
    }
    ```

#### `GET /api/gyms/:id`
- **Description**: Retrieves a specific gym.
- **Parameters**:
  - `id`: Gym ID (integer).
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "data": { /* gym object */ }
    }
    ```

#### `POST /api/gyms`
- **Description**: Creates a new gym (admin or gym_owner).
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "name": "string",
    "address": "string (optional)",
    "description": "string (optional)",
    "contactInfo": "string (optional)",
    "imageUrl": "string (optional)"
  }
  ```
- **Response**:
  - **201**:
    ```json
    {
      "status": "success",
      "message": "Gym created successfully",
      "data": { /* new gym object */ }
    }
    ```

#### `PUT /api/gyms/:id`
- **Description**: Updates a gym (owner or admin).
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Parameters**:
  - `id`: Gym ID (integer).
- **Body**:
  ```json
  {
    "name": "string (optional)",
    "address": "string (optional)",
    "description": "string (optional)",
    "contactInfo": "string (optional)",
    "imageUrl": "string (optional)"
  }
  ```
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "message": "Gym updated successfully",
      "data": { /* updated gym object */ }
    }
    ```

#### `DELETE /api/gyms/:id`
- **Description**: Deletes a gym (owner or admin).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: Gym ID (integer).
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "message": "Gym deleted successfully"
    }
    ```

#### `POST /api/gyms/:id/image`
- **Description**: Uploads a gym image.
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Parameters**:
  - `id`: Gym ID (integer).
- **Form Data**:
  - `image`: Image file (max 5MB).
- **Response**:
  
  - **201**:
    ```json
    {
      "status": "success",
      "message": "Image uploaded successfully",
      "data": {
        "imageUrl": "string"
      }
    }
    ```

#### `GET /api/gyms/statistics/total-count`

- **Description**: Retrieves total gym count (admin-only).

- **Headers**:

  - `Authorization: Bearer <token>`

- **Response**:

  - **200**:

    ```
    {
      "status": "success",
      "data": {
        "totalGyms": "integer"
      }
    }
    ```

#### `GET /api/gyms/all/user-view`

- **Description**: Retrieves all gyms for administrative view (admin, gym_owner, user).

- **Headers**:

  - `Authorization: Bearer <token>`

- **Response**:

  - **200**:

    ```
    {
      "status": "success",
      "results": "integer",
      "data": [ /* array of gym objects */ ]
    }
    ```

#### `GET /api/gyms/owned/my-gyms`

- **Description**: Retrieves gyms owned by the authenticated user (gym_owner or admin).

- **Headers**:

  - `Authorization: Bearer <token>`

- **Query Parameters**:

  - `search`: Search by name or description (optional).
  - `page`: Page number (optional, default: 1).
  - `limit`: Items per page (optional, default: 10).

- **Response**:

  - **200**:

    ```
    {
      "status": "success",
      "results": "integer",
      "pagination": {
        "page": "integer",
        "limit": "integer",
        "totalPages": "integer",
        "totalItems": "integer"
      },
      "data": [ /* array of owned gym objects */ ]
    }
    ```

#### `GET /api/gyms/:id/classes`

* **Description**: Retrieves all classes for a given gym.

* **Headers**:

  * `Authorization: Bearer <token>` (optional for public view)

* **Parameters**:

  * `id`: Gym ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "gymId": "integer",
          "name": "string",
          "description": "string",
          "maxCapacity": "integer",
          "durationMinutes": "integer",
          "imageUrl": "string",
          "membersOnly": "boolean",
          "difficultyLevel": "string",
          "isActive": "boolean"
        }
      ]
    }
    ```

  * **404**: Gym not found.

#### `GET /api/gyms/:id/membership-plans`

* **Description**: Retrieves all membership plans available at a given gym.

* **Headers**:

  * `Authorization: Bearer <token>` (optional for public view)

* **Parameters**:

  * `id`: Gym ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "gymId": "integer",
          "name": "string",
          "description": "string",
          "durationDays": "integer",
          "price": "number",
          "maxBookingsPerWeek": "integer",
          "isActive": "boolean"
        }
      ]
    }
    ```

  * **404**: Gym not found.

#### `POST /api/gyms/:gymId/membership-plans`

* **Description**: Creates a new membership plan for a specific gym (only `gym_owner` or `admin`).

* **Headers**:

  * `Authorization: Bearer <token>`
  * `Content-Type: application/json`

* **Parameters**:

  * `gymId`: Gym ID (integer).

* **Body**:

  ```json
  {
    "name": "string",
    "description": "string (optional)",
    "durationDays": "integer",
    "price": "number",
    "maxBookingsPerWeek": "integer (optional)"
  }
  ```

* **Response**:

  * **201**:

    ```json
    {
      "status": "success",
      "message": "Membership plan created successfully",
      "data": { /* new plan object */ }
    }
    ```

  * **400**: Validation error.

  * **403**: Insufficient permissions.

  * **404**: Gym not found.

-----

### Membership Routes (`/api/memberships`)

**Purpose**: Manages user memberships.

#### `GET /api/memberships`
- **Description**: Retrieves memberships for the authenticated user or all memberships (admin).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "userId": "integer",
          "gymId": "integer",
          "planId": "integer",
          "startDate": "ISO8601 string",
          "endDate": "ISO8601 string",
          "status": "string",
          "autoRenew": "boolean"
        }
      ]
    }
    ```

#### `POST /api/memberships`
- **Description**: Creates a new membership.
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "gymId": "integer",
    "planId": "integer",
    "startDate": "ISO8601 string",
    "autoRenew": "boolean (optional)"
  }
  ```
- **Response**:
  - **201**:
    ```json
    {
      "status": "success",
      "message": "Membership created successfully",
      "data": { /* new membership object */ }
    }
    ```

#### `GET /api/memberships/:id`

* **Description**: Retrieves a specific membership by its ID (only the membership owner or admin).

* **Headers**:

  * `Authorization: Bearer <token>`

* **Parameters**:

  * `id`: Membership ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "data": {
        "id": "integer",
        "userId": "integer",
        "gymId": "integer",
        "planId": "integer",
        "startDate": "ISO8601 string",
        "endDate": "ISO8601 string",
        "status": "string",
        "autoRenew": "boolean",
        "bookingsUsedThisWeek": "integer"
      }
    }
    ```

  * **403**: Forbidden (not owner or admin).

  * **404**: Membership not found.

#### `PUT /api/memberships/:id`

* **Description**: Updates a membership (only the membership owner or admin). Typically used to change status or auto-renew.

* **Headers**:

  * `Authorization: Bearer <token>`
  * `Content-Type: application/json`

* **Parameters**:

  * `id`: Membership ID (integer).

* **Body**:

  ```json
  {
    "planId": "integer (optional)",
    "status": "string (optional; e.g., 'active', 'expired', 'cancelled')",
    "autoRenew": "boolean (optional)"
  }
  ```

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "message": "Membership updated successfully",
      "data": { /* updated membership object */ }
    }
    ```

  * **403**: Forbidden (not owner or admin).

  * **404**: Membership not found.

#### `POST /api/memberships/:id/cancel`

* **Description**: Cancels an existing membership (membership owner only).

* **Headers**:

  * `Authorization: Bearer <token>`

* **Parameters**:

  * `id`: Membership ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "message": "Membership cancelled successfully",
      "data": {
        "id": "integer",
        "status": "cancelled"
      }
    }
    ```

  * **403**: Forbidden (not membership owner).

  * **404**: Membership not found.

#### `GET /api/memberships/:id/payments`

* **Description**: Retrieves all payment records for a given membership (membership owner or admin).

* **Headers**:

  * `Authorization: Bearer <token>`

* **Parameters**:

  * `id`: Membership ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "membershipId": "integer",
          "amount": "number",
          "paymentDate": "ISO8601 string",
          "paymentMethod": "string",
          "transactionId": "string",
          "status": "string"
        }
      ]
    }
    ```

  * **403**: Forbidden (not owner or admin).

  * **404**: Membership not found.

---

### Membership Plan Routes (`/api/membership-plans`)

**Purpose**: Manages gym membership plans.

#### `GET /api/membership-plans`
- **Description**: Retrieves membership plans (filtered by gym if user is not admin).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  - `gymId`: Filter by gym (optional).
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "gymId": "integer",
          "name": "string",
          "description": "string",
          "durationDays": "integer",
          "price": "number",
          "isActive": "boolean"
        }
      ]
    }
    ```

#### `POST /api/membership-plans`
- **Description**: Creates a new membership plan (gym_owner or admin).
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "gymId": "integer",
    "name": "string",
    "description": "string (optional)",
    "durationDays": "integer",
    "price": "number",
    "maxBookingsPerWeek": "integer (optional)"
  }
  ```
- **Response**:
  - **201**:
    ```json
    {
      "status": "success",
      "message": "Membership plan created successfully",
      "data": { /* new plan object */ }
    }
    ```

#### `GET /api/membership-plans/:planId`

* **Description**: Retrieves a single membership plan by its ID.

* **Headers**:

  * `Authorization: Bearer <token>`

* **Parameters**:

  * `planId`: Plan ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "data": {
        "id": "integer",
        "gymId": "integer",
        "name": "string",
        "description": "string",
        "durationDays": "integer",
        "price": "number",
        "maxBookingsPerWeek": "integer",
        "isActive": "boolean"
      }
    }
    ```

  * **404**: Plan not found.

#### `PUT /api/membership-plans/:planId`

* **Description**: Updates a membership plan (only `gym_owner` of that gym or `admin`).

* **Headers**:

  * `Authorization: Bearer <token>`
  * `Content-Type: application/json`

* **Parameters**:

  * `planId`: Plan ID (integer).

* **Body**:

  ```json
  {
    "name": "string (optional)",
    "description": "string (optional)",
    "durationDays": "integer (optional)",
    "price": "number (optional)",
    "maxBookingsPerWeek": "integer (optional)",
    "isActive": "boolean (optional)"
  }
  ```

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "message": "Membership plan updated successfully",
      "data": { /* updated plan object */ }
    }
    ```

  * **403**: Forbidden (not gym\_owner or admin).

  * **404**: Plan not found.

#### `DELETE /api/membership-plans/:planId`

* **Description**: Deletes a membership plan (only `gym_owner` of that gym or `admin`).

* **Headers**:

  * `Authorization: Bearer <token>`

* **Parameters**:

  * `planId`: Plan ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "message": "Membership plan deleted successfully"
    }
    ```

  * **403**: Forbidden (not gym\_owner or admin).

  * **404**: Plan not found.

-----

### Class Routes (`/api/classes`)

**Purpose**: Manages gym classes.

#### `GET /api/classes`
- **Description**: Retrieves gym classes (filtered by gym or membership).
- **Query Parameters**:
  - `gymId`: Filter by gym (optional).
  - `membersOnly`: Filter by members-only classes (optional).
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "gymId": "integer",
          "name": "string",
          "description": "string",
          "maxCapacity": "integer",
          "durationMinutes": "integer",
          "imageUrl": "string",
          "membersOnly": "boolean"
        }
      ]
    }
    ```

#### `POST /api/classes`
- **Description**: Creates a new gym class (gym_owner or admin).
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "gymId": "integer",
    "name": "string",
    "description": "string (optional)",
    "maxCapacity": "integer (optional)",
    "durationMinutes": "integer",
    "membersOnly": "boolean (optional)",
    "difficultyLevel": "string (optional)"
  }
  ```
- **Response**:
  - **201**:
    ```json
    {
      "status": "success",
      "message": "Class created successfully",
      "data": { /* new class object */ }
    }
    ```

#### `POST /api/classes/:id/image`
- **Description**: Uploads a class image.
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Parameters**:
  - `id`: Class ID (integer).
- **Form Data**:
  - `image`: Image file (max 5MB).
- **Response**:
  - **201**:
    ```json
    {
      "status": "success",
      "message": "Image uploaded successfully",
      "data": {
        "imageUrl": "string"
      }
    }
    ```

#### `GET /api/classes/:id`

* **Description**: Retrieves a specific gym class by its ID.

* **Headers**:

  * `Authorization: Bearer <token>` (optional for public view depending on your setup)

* **Parameters**:

  * `id`: Class ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "data": {
        "id": "integer",
        "gymId": "integer",
        "name": "string",
        "description": "string",
        "maxCapacity": "integer",
        "durationMinutes": "integer",
        "imageUrl": "string",
        "membersOnly": "boolean",
        "difficultyLevel": "string",
        "isActive": "boolean"
      }
    }
    ```

  * **404**: Class not found.

#### `GET /api/classes/:id/schedules`

* **Description**: Retrieves all schedules for a given class.

* **Headers**:

  * `Authorization: Bearer <token>` (optional for public view)

* **Parameters**:

  * `id`: Class ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "classId": "integer",
          "startTime": "ISO8601 string",
          "endTime": "ISO8601 string",
          "instructor": "string",
          "currentBookings": "integer",
          "isCancelled": "boolean",
          "cancellationReason": "string"
        }
      ]
    }
    ```

  * **404**: Class not found.

#### `PUT /api/classes/:id`

* **Description**: Updates a gym class (only `gym_owner` of that gym or `admin`).

* **Headers**:

  * `Authorization: Bearer <token>`
  * `Content-Type: application/json`

* **Parameters**:

  * `id`: Class ID (integer).

* **Body**:

  ```json
  {
    "name": "string (optional)",
    "description": "string (optional)",
    "maxCapacity": "integer (optional)",
    "durationMinutes": "integer (optional)",
    "membersOnly": "boolean (optional)",
    "difficultyLevel": "string (optional)",
    "imageUrl": "string (optional)", 
    "isActive": "boolean (optional)"
  }
  ```

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "message": "Class updated successfully",
      "data": { /* updated class object */ }
    }
    ```

  * **403**: Forbidden (not gym\_owner or admin).

  * **404**: Class not found.

#### `DELETE /api/classes/:id`

* **Description**: Deletes a gym class (only `gym_owner` or `admin`).

* **Headers**:

  * `Authorization: Bearer <token>`

* **Parameters**:

  * `id`: Class ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "message": "Class deleted successfully"
    }
    ```

  * **403**: Forbidden (not gym\_owner or admin).

  * **404**: Class not found.

#### `POST /api/classes/:id/schedules`

* **Description**: Creates a new schedule under a specific class (only `gym_owner` or `admin`).

* **Headers**:

  * `Authorization: Bearer <token>`
  * `Content-Type: application/json`

* **Parameters**:

  * `id`: Class ID (integer).

* **Body**:

  ```json
  {
    "startTime": "ISO8601 string",
    "endTime": "ISO8601 string",
    "instructor": "string (optional)"
  }
  ```

* **Response**:

  * **201**:

    ```json
    {
      "status": "success",
      "message": "Class schedule created successfully",
      "data": {
        "id": "integer",
        "classId": "integer",
        "startTime": "ISO8601 string",
        "endTime": "ISO8601 string",
        "instructor": "string",
        "currentBookings": 0,
        "isCancelled": false
      }
    }
    ```

  * **400**: Validation error.

  * **403**: Forbidden (not gym\_owner or admin).

  * **404**: Class not found.

-----

## Class Schedule Routes (`/api/class-schedules`)

**Purpose**: Manages schedules for gym classes, allowing gym owners to create and manage class timetables and users to view available schedules.

#### `GET /api/class-schedules`

- **Description**: Retrieves class schedules, filtered by gym or class.

- **Headers**:

  - `Authorization: Bearer <token>` (optional for public schedules).

- **Query Parameters**:

  - `gymId`: Filter by gym ID (optional).
  - `classId`: Filter by class ID (optional).
  - `startDate`: Filter by start date (optional, ISO8601).
  - `endDate`: Filter by end date (optional, ISO8601).

- **Response**:

  - **200**:

    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "classId": "integer",
          "startTime": "ISO8601 string",
          "endTime": "ISO8601 string",
          "instructor": "string",
          "currentBookings": "integer",
          "isCancelled": "boolean",
          "cancellationReason": "string",
          "createdAt": "ISO8601 string"
        }
      ]
    }
    ```

#### `GET /api/class-schedules/:id`

- **Description**: Retrieves a specific class schedule by ID.

- **Parameters**:

  - `id`: Schedule ID (integer).

- **Response**:

  - **200**:

    ```json
    {
      "status": "success",
      "data": { /* class schedule object */ }
    }
    ```

  - **404**: Schedule not found.

#### `POST /api/class-schedules`

- **Description**: Creates a new class schedule (gym_owner or admin).

- **Headers**:

  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

- **Body**:

  ```json
  {
    "classId": "integer",
    "startTime": "ISO8601 string",
    "endTime": "ISO8601 string",
    "instructor": "string",
    "currentBookings": "integer (optional, default: 0)",
    "isCancelled": "boolean (optional, default: false)"
  }
  ```

- **Response**:

  - **201**:

    ```json
    {
      "status": "success",
      "message": "Class schedule created successfully",
      "data": { /* new schedule object */ }
    }
    ```

  - **400**: Validation error.

  - **403**: Insufficient permissions.


#### `PUT /api/class-schedules/:id`

- **Description**: Updates a class schedule (gym_owner or admin).

- **Headers**:

  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

- **Parameters**:

  - `id`: Schedule ID (integer).

- **Body**:

  ```json
  {
    "startTime": "ISO8601 string (optional)",
    "endTime": "ISO8601 string (optional)",
    "instructor": "string (optional)",
    "isCancelled": "boolean (optional)",
    "cancellationReason": "string (optional)"
  }
  ```

- **Response**:

  - **200**:

    ```json
    {
      "status": "success",
      "message": "Class schedule updated successfully",
      "data": { /* updated schedule object */ }
    }
    ```

  - **403**: Insufficient permissions.

  - **404**: Schedule not found.

#### `DELETE /api/class-schedules/:id`

- **Description**: Deletes a class schedule (gym_owner or admin).

- **Headers**:

  - `Authorization: Bearer <token>`

- **Parameters**:

  - `id`: Schedule ID (integer).

- **Response**:

  - **200**:

    ```json
    {
      "status": "success",
      "message": "Class schedule deleted successfully"
    }
    ```

  - **403**: Insufficient permissions.

  - **404**: Schedule not found.

  - **400**: Schedule has active bookings.

---

## Booking Routes (`/api/bookings`)

**Purpose**: Manages class bookings.

#### `GET /api/bookings`

- **Description**: Retrieves bookings for the authenticated user or gym (gym_owner/admin).

- **Headers**:

  - `Authorization: Bearer <token>`

- **Query Parameters**:

  - `gymId`: Filter by gym (optional, admin/gym_owner).
  - `scheduleId`: Filter by schedule (optional).

- **Response**:

  - **200**:

    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "userId": "integer",
          "membershipId": "integer",
          "scheduleId": "integer",
          "bookingTime": "ISO8601 string",
          "bookingStatus": "string",
          "attended": "boolean"
        }
      ]
    }
    ```

#### `POST /api/bookings`

- **Description**: Creates a new booking.

- **Headers**:

  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

- **Body**:

  ```json
  {
    "scheduleId": "integer",
    "membershipId": "integer"
  }
  ```

- **Response**:

  - **201**:

    ```json
    {
      "status": "success",
      "message": "Booking created successfully",
      "data": { /* new booking object */ }
    }
    ```

#### `GET /api/bookings/my-bookings`

* **Description**: Retrieves all bookings for the authenticated user.

* **Headers**:

  * `Authorization: Bearer <token>`

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "userId": "integer",
          "membershipId": "integer",
          "scheduleId": "integer",
          "bookingTime": "ISO8601 string",
          "bookingStatus": "string",
          "attended": "boolean"
        }
      ]
    }
    ```

  * **401**: Authentication required.

#### `GET /api/bookings/upcoming`

* **Description**: Retrieves upcoming bookings for the authenticated user (future classes).

* **Headers**:

  * `Authorization: Bearer <token>`

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "userId": "integer",
          "membershipId": "integer",
          "scheduleId": "integer",
          "bookingTime": "ISO8601 string",
          "bookingStatus": "string",
          "attended": "boolean"
        }
      ]
    }
    ```

  * **401**: Authentication required.

#### `GET /api/bookings/history`

* **Description**: Retrieves past or cancelled bookings for the authenticated user.

* **Headers**:

  * `Authorization: Bearer <token>`

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "userId": "integer",
          "membershipId": "integer",
          "scheduleId": "integer",
          "bookingTime": "ISO8601 string",
          "bookingStatus": "string",
          "attended": "boolean"
        }
      ]
    }
    ```

  * **401**: Authentication required.

#### `GET /api/bookings/:id`

* **Description**: Retrieves a specific booking by its ID (only the booking owner or gym\_owner/admin can access).

* **Headers**:

  * `Authorization: Bearer <token>`

* **Parameters**:

  * `id`: Booking ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "data": {
        "id": "integer",
        "userId": "integer",
        "membershipId": "integer",
        "scheduleId": "integer",
        "bookingTime": "ISO8601 string",
        "bookingStatus": "string",
        "attended": "boolean"
      }
    }
    ```

  * **403**: Forbidden (not owner or admin).

  * **404**: Booking not found.

#### `PUT /api/bookings/:id/cancel`

* **Description**: Cancels a specific booking (booking owner only; gym\_owner/admin cannot cancel on behalf of others).

* **Headers**:

  * `Authorization: Bearer <token>`

* **Parameters**:

  * `id`: Booking ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "message": "Booking cancelled successfully",
      "data": {
        "id": "integer",
        "bookingStatus": "cancelled"
      }
    }
    ```

  * **403**: Forbidden (not booking owner).

  * **404**: Booking not found.

#### `PUT /api/bookings/:id/mark-attended`

* **Description**: Marks a specific past booking as ‘attended’ (booking owner only).

* **Headers**:

  * `Authorization: Bearer <token>`

* **Parameters**:

  * `id`: Booking ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "message": "Booking marked as attended",
      "data": {
        "id": "integer",
        "attended": true
      }
    }
    ```

  * **403**: Forbidden (not booking owner).

  * **404**: Booking not found.

-----

## Competition Routes (`/api/competitions`)

**Purpose**: Manages fitness competitions.

#### `GET /api/competitions`

- **Description**: Retrieves competitions (filtered by gym or status).

- **Query Parameters**:

  - `gymId`: Filter by gym (optional).
  - `isActive`: Filter by active status (optional).

- **Response**:

  - **200**:

    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "gymId": "integer",
          "name": "string",
          "description": "string",
          "startDate": "ISO8601 string",
          "endDate": "ISO8601 string",
          "imageUrl": "string",
          "maxParticipants": "integer",
          "isActive": "boolean"
        }
      ]
    }
    ```

#### `POST /api/competitions`

- **Description**: Creates a new competition (gym_owner or admin).

- **Headers**:

  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

- **Body**:

  ```json
  {
    "gymId": "integer",
    "name": "string",
    "description": "string (optional)",
    "startDate": "ISO8601 string",
    "endDate": "ISO8601 string",
    "maxParticipants": "integer (optional)",
    "imageUrl": "string (optional)"
  }
  ```

- **Response**:

  - **201**:

    ```json
    {
      "status": "success",
      "message": "Competition created successfully",
      "data": { /* new competition object */ }
    }
    ```

#### `POST /api/competitions/:id/image`

- **Description**: Uploads a competition image.

- **Headers**:

  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`

- **Parameters**:

  - `id`: Competition ID (integer).

- **Form Data**:

  - `image`: Image file (max 5MB).

- **Response**:

  - **201**:

    ```json
    {
      "status": "success",
      "message": "Image uploaded successfully",
      "data": {
        "imageUrl": "string"
      }
    }
    ```

#### `GET /api/competitions/user/discover-subscribed-gym-competitions`

- **Description**: Retrieves discoverable competitions from gyms the user has active memberships to (not yet joined).

- **Headers**:

  - `Authorization: Bearer <token>`

- **Query Parameters**:

  - `isActive`: Filter by competition active status (optional).
  - `search`: Search by name or description (optional).
  - `page`: Page number (optional, default: 1).
  - `limit`: Items per page (optional, default: 10).
  - `includeEnded`: Include ended competitions (optional, default: false).

- **Response**:

  - **200**:

    ```
    {
      "status": "success",
      "results": "integer",
      "pagination": {
        "page": "integer",
        "limit": "integer",
        "totalPages": "integer",
        "totalItems": "integer"
      },
      "data": [ /* array of competition objects */ ]
    }
    ```

#### `GET /api/competitions/user/joined-subscribed-gym-competitions`

- **Description**: Retrieves competitions from subscribed gyms that the user has already joined.

- **Headers**:

  - `Authorization: Bearer <token>`

- **Query Parameters**:

  - `isActiveCompetition`: Filter by competition active status (optional).
  - `search`: Search by name or description (optional).
  - `page`: Page number (optional, default: 1).
  - `limit`: Items per page (optional, default: 10).
  - `includeEnded`: Include ended competitions (optional, default: false).

- **Response**:

  - **200**:

    ```
    {
      "status": "success",
      "results": "integer",
      "pagination": {
        "page": "integer",
        "limit": "integer",
        "totalPages": "integer",
        "totalItems": "integer"
      },
      "data": [ /* array of participation objects with competition data */ ]
    }
    ```

#### `GET /api/competitions/:id`

* **Description**: Retrieves details for a single competition by its ID.

* **Headers**:

  * `Authorization: Bearer <token>` (optional for public view)

* **Parameters**:

  * `id`: Competition ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "data": {
        "id": "integer",
        "gymId": "integer",
        "name": "string",
        "description": "string",
        "startDate": "ISO8601 string",
        "endDate": "ISO8601 string",
        "imageUrl": "string",
        "maxParticipants": "integer",
        "isActive": "boolean"
      }
    }
    ```

  * **404**: Competition not found.

#### `GET /api/competitions/:id/leaderboard`

* **Description**: Retrieves the leaderboard for a specific competition.

* **Headers**:

  * `Authorization: Bearer <token>` (optional for public view)

* **Parameters**:

  * `id`: Competition ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "data": [
        {
          "participantId": "integer",
          "userId": "integer",
          "totalPoints": "integer",
          "rank": "integer"
        }
      ]
    }
    ```

  * **404**: Competition not found.

#### `GET /api/competitions/:competitionId/tasks-list`

- **Description**: Retrieves all tasks for a specific competition.

- **Parameters**:

  - `competitionId`: Competition ID (integer).

- **Response**:

  - **200**:

    ```
    {
      "status": "success",
      "results": "integer",
      "data": [ /* array of task objects */ ]
    }
    ```

#### `POST /api/competitions/:id/join`

* **Description**: Registers the authenticated user for a specific competition.

* **Headers**:

  * `Authorization: Bearer <token>`
  * `Content-Type: application/json`

* **Parameters**:

  * `id`: Competition ID (integer).

* **Response**:

  * **201**:

    ```json
    {
      "status": "success",
      "message": "User successfully joined competition",
      "data": {
        "participantId": "integer",
        "userId": "integer",
        "competitionId": "integer",
        "joinDate": "ISO8601 string"
      }
    }
    ```

  * **400**: Competition full or invalid.

  * **409**: Already registered.

  * **404**: Competition not found.

#### `DELETE /api/competitions/:id/leave`

* **Description**: Unregisters the authenticated user from a specific competition.

* **Headers**:

  * `Authorization: Bearer <token>`

* **Parameters**:

  * `id`: Competition ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "message": "User successfully left competition"
    }
    ```

  * **403**: Forbidden (cannot leave if not a participant).

  * **404**: Registration not found.

#### `PUT /api/competitions/tasks/:taskId/progress`

* **Description**: Updates the authenticated user's progress for a specific competition task.

* **Headers**:

  * `Authorization: Bearer <token>`
  * `Content-Type: application/json`

* **Parameters**:

  * `taskId`: Task ID (integer).

* **Body**:

  ```json
  {
    "currentValue": "number"
  }
  ```

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "message": "Progress updated successfully",
      "data": {
        "progressId": "integer",
        "participantId": "integer",
        "taskId": "integer",
        "currentValue": "number",
        "isCompleted": "boolean",
        "completionDate": "ISO8601 string"
      }
    }
    ```

  * **400**: Validation error.

  * **403**: Forbidden (not competition participant).

  * **404**: Task or Participant not found.

#### `GET /api/competitions/user/competitions`

* **Description**: Retrieves all competitions that the authenticated user has joined (regardless of gym).

* **Headers**:

  * `Authorization: Bearer <token>`

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "competitionId": "integer",
          "name": "string",
          "startDate": "ISO8601 string",
          "endDate": "ISO8601 string",
          "imageUrl": "string",
          "totalPoints": "integer",
          "completionPct": "number"
        }
      ]
    }
    ```

  * **401**: Authentication required.

#### `GET /api/competitions/user/competitions/:id/progress`

* **Description**: Retrieves the authenticated user’s overall progress for a specific competition.

* **Headers**:

  * `Authorization: Bearer <token>`

* **Parameters**:

  * `id`: Competition ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "data": {
        "competitionId": "integer",
        "totalPoints": "integer",
        "completionPct": "number",
        "tasks": [
          {
            "taskId": "integer",
            "currentValue": "number",
            "isCompleted": "boolean",
            "completionDate": "ISO8601 string"
          }
        ]
      }
    }
    ```

  * **403**: Forbidden (not participant).

  * **404**: Competition or progress not found.

-----

## Competition Participant Routes (`/api/competition-participants`)

**Purpose**: Manages user participation in competitions.

#### `GET /api/competition-participants`

- **Description**: Retrieves participants for a competition (gym_owner, admin, or authenticated user for own data).

- **Headers**:

  - `Authorization: Bearer <token>`

- **Query Parameters**:

  - `competitionId`: Filter by competition ID (required).

- **Response**:

  - **200**:

    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "userId": "integer",
          "competitionId": "integer",
          "joinDate": "ISO8601 string",
          "totalPoints": "integer",
          "completionPct": "number",
          "rank": "integer",
          "isActive": "boolean"
        }
      ]
    }
    ```

  - **400**: Missing competition Id.

#### `POST /api/competition-participants`

- **Description**: Registers a user for a competition.

- **Headers**:

  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

- **Body**:

  ```json
  {
    "competitionId": "integer"
  }
  ```

- **Response**:

  - **201**:

    ```json
    {
      "status": "success",
      "message": "Successfully joined competition",
      "data": { /* new participant object */ }
    }
    ```

  - **400**: Competition full or invalid.

  - **409**: Already registered.

#### `DELETE /api/competition-participants/:id`

- **Description**: Removes a participant from a competition (user themselves, gym_owner, or admin).

- **Headers**:

  - `Authorization: Bearer <token>`

- **Parameters**:

  - `id`: Participant ID (integer).

- **Response**:

  - **200**:

    ```json
    {
      "status": "success",
      "message": "Participant removed successfully"
    }
    ```

  - **403**: Insufficient permissions.

  - **404**: Participant not found.

---

## Competition Task Routes (`/api/competition-tasks`)

**Purpose**: Manages tasks within competitions (e.g., specific exercises or goals).

#### `GET /api/competition-tasks`

- **Description**: Retrieves tasks for a competition.

- **Query Parameters**:

  - `competitionId`: Filter by competition ID (required).

- **Response**:

  - **200**:

    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "competitionId": "integer",
          "exerciseId": "integer",
          "name": "string",
          "description": "string",
          "targetValue": "number",
          "unit": "string",
          "pointsValue": "integer"
        }
      ]
    }
    ```

  - **400**: Missing competitionId.

#### `POST /api/competition-tasks`

- **Description**: Creates a new task for a competition (gym_owner or admin).

- **Headers**:

  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

- **Body**:

  ```json
  {
    "competitionId": "integer",
    "exerciseId": "integer (optional)",
    "name": "string",
    "description": "string (optional)",
    "targetValue": "number",
    "unit": "string",
    "pointsValue": "integer"
  }
  ```

- **Response**:

  - **201**:

    ```json
    {
      "status": "success",
      "message": "Task created successfully",
      "data": { /* new task object */ }
    }
    ```

  - **403**: Insufficient permissions.

  - **400**: Validation error.

#### `PUT /api/competition-tasks/:id`

- **Description**: Updates a competition task (gym_owner or admin).

- **Headers**:

  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

- **Parameters**:

  - `id`: Task ID (integer).

- **Body**:

  ```json
  {
    "name": "string (optional)",
    "description": "string (optional)",
    "targetValue": "number (optional)",
    "unit": "string (optional)",
    "pointsValue": "integer (optional)"
  }
  ```

- **Response**:

  - **200**:

    ```json
    {
      "status": "success",
      "message": "Task updated successfully",
      "data": { /* updated task object */ }
    }
    ```

  - **403**: Insufficient permissions.

  - **404**: Task not found.

#### `DELETE /api/competition-tasks/:id`

- **Description**: Deletes a competition task (gym_owner or admin).

- **Headers**:

  - `Authorization: Bearer <token>`

- **Parameters**:

  - `id`: Task ID (integer).

- **Response**:

  - **200**:

    ```json
    {
      "status": "success",
      "message": "Task deleted successfully"
    }
    ```

  - **403**: Insufficient permissions.

  - **404**: Task not found.

  - **400**: Task has associated progress.

---

## Competition Progress Routes (`/api/competition-progress`)

**Purpose**: Tracks participant progress for competition tasks.

#### `GET /api/competition-progress`

- **Description**: Retrieves progress for a participant or task.

- **Headers**:

  - `Authorization: Bearer <token>`

- **Query Parameters**:

  - `participantId`: Filter by participant ID (required for non-users).
  - `taskId`: Filter by task ID (optional).

- **Response**:

  - **200**:

    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "participantId": "integer",
          "taskId": "integer",
          "currentValue": "number",
          "isCompleted": "boolean",
          "completionDate": "ISO8601 string",
          "lastUpdated": "ISO8601 string",
          "notes": "string"
        }
      ]
    }
    ```

  - **400**: Missing participantId for non-users.

#### `POST /api/competition-progress`

- **Description**: Records progress for a competition task.

- **Headers**:

  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

- **Body**:

  ```json
  {
    "participantId": "integer",
    "taskId": "integer",
    "currentValue": "number",
    "notes": "string (optional)"
  }
  ```

- **Response**:

  - **201**:

    ```json
    {
      "status": "success",
      "message": "Progress recorded successfully",
      "data": { /* new progress object */ }
    }
    ```

  - **400**: Validation error.

  - **403**: Insufficient permissions.

#### `PUT /api/competition-progress/:id`

- **Description**: Updates progress for a competition task.

- **Headers**:

  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

- **Parameters**:

  - `id`: Progress ID (integer).

- **Body**:

  ```json
  {
    "currentValue": "number (optional)",
    "notes": "string (optional)"
  }
  ```

- **Response**:

  - **200**:

    ```json
    {
      "status": "success",
      "message": "Progress updated successfully",
      "data": { /* updated progress object */ }
    }
    ```

  - **403**: Insufficient permissions.

  - **404**: Progress not found.

#### `DELETE /api/competition-progress/:id`

- **Description**: Deletes a progress entry (gym_owner or admin).

- **Headers**:

  - `Authorization: Bearer <token>`

- **Parameters**:

  - `id`: Progress ID (integer).

- **Response**:

  - **200**:

    ```json
    {
      "status": "success",
      "message": "Progress deleted successfully"
    }
    ```

  - **403**: Insufficient permissions.

  - **404**: Progress not found.

---

## Membership Payment Routes (`/api/membership-payments`)

**Purpose**: Manages payments for memberships.

#### `GET /api/membership-payments`

- **Description**: Retrieves payment records for a user or membership (user for own payments, admin for all).

- **Headers**:

  - `Authorization: Bearer <token>`

- **Query Parameters**:

  - `membershipId`: Filter by membership ID (optional).
  - `userId`: Filter by user ID (admin-only, optional).

- **Response**:

  - **200**:

    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "membershipId": "integer",
          "amount": "number",
          "paymentDate": "ISO8601 string",
          "paymentMethod": "string",
          "transactionId": "string",
          "status": "string",
          "createdAt": "ISO8601 string"
        }
      ]
    }
    ```

#### `POST /api/membership-payments`

- **Description**: Records a new payment for a membership.

- **Headers**:

  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

- **Body**:

  ```json
  {
    "membershipId": "integer",
    "amount": "number",
    "paymentMethod": "string",
    "transactionId": "string",
    "status": "string (optional, default: 'completed')"
  }
  ```

- **Response**:

  - **201**:

    ```json
    {
      "status": "success",
      "message": "Payment recorded successfully",
      "data": { /* new payment object */ }
    }
    ```

  - **400**: Validation error.

  - **403**: Insufficient permissions.

#### `PUT /api/membership-payments/:id`

- **Description**: Updates a payment record (admin-only).

- **Headers**:

  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

- **Parameters**:

  - `id`: Payment ID (integer).

- **Body**:

  ```json
  {
    "amount": "number (optional)",
    "paymentMethod": "string (optional)",
    "transactionId": "string (optional)",
    "status": "string (optional)"
  }
  ```

- **Response**:

  - **200**:

    ```json
    {
      "status": "success",
      "message": "Payment updated successfully",
      "data": { /* updated payment object */ }
    }
    ```

  - **403**: Insufficient permissions.

  - **404**: Payment not found.

#### `DELETE /api/membership-payments/:id`

- **Description**: Deletes a payment record (admin-only).

- **Headers**:

  - `Authorization: Bearer <token>`

- **Parameters**:

  - `id`: Payment ID (integer).

- **Response**:

  - **200**:

    ```json
    {
      "status": "success",
      "message": "Payment deleted successfully"
    }
    ```

  - **403**: Insufficient permissions.

  - **404**: Payment not found.



----

### Food Item Routes (`/api/food-items`)

**Purpose**: Manages food items for diet tracking.

#### `GET /api/food-items`
- **Description**: Retrieves a list of food items.
- **Query Parameters**:
  - `search`: Search by name (optional).
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "name": "string",
          "description": "string",
          "caloriesPerUnit": "number",
          "servingUnit": "string",
          "imageUrl": "string"
        }
      ]
    }
    ```

#### `GET /api/food-items/all`

- **Description**: Retrieves all food items without pagination.

- **Query Parameters**:

  - `search`: Search by name or description (optional).

- **Response**:

  - **200**:

    ```
    {
      "status": "success",
      "results": "integer",
      "data": [ /* array of food item objects */ ]
    }
    ```

#### `POST /api/food-items`

- **Description**: Creates a new food item (admin-only).
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "name": "string",
    "description": "string (optional)",
    "caloriesPerUnit": "number",
    "servingUnit": "string",
    "imageUrl": "string (optional)"
  }
  ```
- **Response**:
  - **201**:
    ```json
    {
      "status": "success",
      "message": "Food item created successfully",
      "data": { /* new food item object */ }
    }
    ```

#### `PUT/api/food-items`

* **Description**: Update an existing food item (only accessible by `admin` or `gym_owner` roles).

* **Headers**:

  * `Authorization: Bearer <token>`
  * `Content-Type: application/json`

* **Path Parameters**:

  * `id` (integer): The ID of the food item to update.

* **Request Body** (all fields optional; only include those you wish to modify):

  ```json
  {
    "name": "string",
    "caloriesPerServing": "number",
    "proteinPerServing": "number",
    "carbsPerServing": "number",
    "fatPerServing": "number",
    "servingSize": "string",
    "imageUrl": "string"
  }
  ```

* **Response**:

  * **200 OK**

    ```json
    {
      "status": "success",
      "message": "Food item updated successfully",
      "data": {
        "id": "integer",
        "name": "string",
        "caloriesPerServing": "number",
        "proteinPerServing": "number",
        "carbsPerServing": "number",
        "fatPerServing": "number",
        "servingSize": "string",
        "imageUrl": "string",
        "createdAt": "ISO8601 string",
        "updatedAt": "ISO8601 string"
      }
    }
    ```

  * **400 Bad Request**: Validation error (e.g., invalid field types).

  * **403 Forbidden**: Insufficient permissions.

  * **404 Not Found**: No food item exists with the given `id`.&#x20;

#### `DELETE /api/food-items/:id`

* **Description**: Delete a specific food item by its ID (only accessible by `admin` or `gym_owner` roles).

* **Headers**:

  * `Authorization: Bearer <token>`

* **Path Parameters**:

  * `id` (integer): The ID of the food item to delete.

* **Response**:

  * **200 OK**

    ```json
    {
      "status": "success",
      "message": "Food item deleted successfully"
    }
    ```

  * **403 Forbidden**: Insufficient permissions.

  * **404 Not Found**: No food item exists with the given `id`.

-----

### Diet Entry Routes (`/api/diet`)

**Purpose**: Manages user diet entries.

#### `GET /api/diet`
- **Description**: Retrieves diet entries for the authenticated user.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  
  - `startDate`: Filter by date range (optional).
  - `endDate`: Filter by date range (optional).
  - `mealType`: Filter by meal type (optional).
- **Response**:
  - **200**:
    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "userId": "integer",
          "foodId": "integer",
          "quantity": "number",
          "calories": "number",
          "consumptionDate": "ISO8601 string",
          "mealType": "string",
          "notes": "string"
        }
      ]
    }
    ```

#### `POST /api/diet`
- **Description**: Creates a new diet entry.
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "foodId": "integer",
    "quantity": "number",
    "consumptionDate": "ISO8601 string",
    "mealType": "string (optional)",
    "notes": "string (optional)"
  }
  ```
- **Response**:
  - **201**:
    ```json
    {
      "status": "success",
      "message": "Diet entry created successfully",
      "data": { /* new diet entry object */ }
    }
    ```

#### `GET /api/diet/all`

- **Description**: Retrieves all diet entries for the authenticated user without pagination.

- **Headers**:

  - `Authorization: Bearer <token>`

- **Query Parameters**:

  - `startDate`: Filter by start date (optional, ISO8601).
  - `endDate`: Filter by end date (optional, ISO8601).
  - `mealType`: Filter by meal type (optional).

- **Response**:

  - 200:

    ```
    {
      "status": "success",
      "results": "integer",
      "data": [ /* array of diet entry objects */ ]
    }
    ```

#### `GET /api/diet/monthly-calories-consumed`

- **Description**: Retrieves monthly calorie consumption data for the authenticated user.

- **Headers**:

  - `Authorization: Bearer <token>`

- **Query Parameters**:

  - `months`: Number of months to retrieve (optional, default: 12, max: 60).

- **Response**:

  - 200:

    ```
    {
      "status": "success",
      "data": [
        {
          "month": "string (YYYY-MM)",
          "totalCalories": "number"
        }
      ]
    }
    ```

#### `PUT /api/diet/:id`

* **Description**: Update a specific diet entry (only the entry owner or `admin`).

* **Headers**:

  * `Authorization: Bearer <token>`
  * `Content-Type: application/json`

* **Path Parameters**:

  * `id` (integer): The ID of the diet entry to update.

* **Request Body** (all fields optional; include only those to change):

  ```json
  {
    "foodItemId": "integer",
    "quantity": "number",
    "mealType": "string",         // e.g., "breakfast", "lunch", "dinner", "snack"
    "date": "YYYY-MM-DD"
  }
  ```

* **Response**:

  * **200 OK**

    ```json
    {
      "status": "success",
      "message": "Diet entry updated successfully",
      "data": {
        "id": "integer",
        "userId": "integer",
        "foodItemId": "integer",
        "quantity": "number",
        "mealType": "string",
        "date": "YYYY-MM-DD",
        "createdAt": "ISO8601 string",
        "updatedAt": "ISO8601 string",
        "foodItem": {
          "id": "integer",
          "name": "string",
          "caloriesPerServing": "number",
          // …other foodItem fields…
        }
      }
    }
    ```

  * **400 Bad Request**: Validation error.

  * **403 Forbidden**: Attempting to modify someone else’s entry.

  * **404 Not Found**: No diet entry exists with the given `id`.&#x20;

#### `DELETE /api/diet/:id`

* **Description**: Delete a specific diet entry (only the entry owner or `admin`).

* **Headers**:

  * `Authorization: Bearer <token>`

* **Path Parameters**:

  * `id` (integer): The ID of the diet entry to delete.

* **Response**:

  * **200 OK**

    ```json
    {
      "status": "success",
      "message": "Diet entry deleted successfully"
    }
    ```

  * **403 Forbidden**: Attempting to delete someone else’s entry.

  * **404 Not Found**: No diet entry exists with the given `id`.

-----

### AI Interaction Routes (`/api/ai`)

**Purpose**: Manages AI interactions for workout and diet advice.

#### `POST /api/ai`
- **Description**: Submits a prompt to the AI for workout or diet advice.
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "prompt": "string",
    "interactionType": "string (e.g., WORKOUT_PLAN, DIET_ADVICE)"
  }
  ```
- **Response**:
  - **201**:
    ```json
    {
      "status": "success",
      "message": "AI interaction recorded",
      "data": {
        "id": "integer",
        "userId": "integer",
        "prompt": "string",
        "response": "string",
        "interactionType": "string",
        "createdAt": "ISO8601 string"
      }
    }
    ```

#### `GET /api/ai/interactions`

* **Description**: Retrieves a paginated list of AI interaction records for the authenticated user.

* **Headers**:

  * `Authorization: Bearer <token>`

* **Query Parameters**:

  * `page`: Page number (optional, default: 1).
  * `limit`: Items per page (optional, default: 10).
  * `interactionType`: Filter by type (e.g., "WORKOUT\_PLAN") (optional).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "results": "integer",
      "data": [
        {
          "id": "integer",
          "userId": "integer",
          "prompt": "string",
          "response": "string",
          "interactionType": "string",
          "createdAt": "ISO8601 string"
        }
      ]
    }
    ```

  * **401**: Authentication required.

#### `GET /api/ai/interactions/:id`

* **Description**: Retrieves a single AI interaction by its ID (must belong to the authenticated user).

* **Headers**:

  * `Authorization: Bearer <token>`

* **Parameters**:

  * `id`: Interaction ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "data": {
        "id": "integer",
        "userId": "integer",
        "prompt": "string",
        "response": "string",
        "interactionType": "string",
        "createdAt": "ISO8601 string"
      }
    }
    ```

  * **403**: Forbidden (not owner).

  * **404**: Interaction not found.

#### `DELETE /api/ai/interactions/:id`

* **Description**: Deletes a single AI interaction record (authenticated user only).

* **Headers**:

  * `Authorization: Bearer <token>`

* **Parameters**:

  * `id`: Interaction ID (integer).

* **Response**:

  * **200**:

    ```json
    {
      "status": "success",
      "message": "Interaction deleted successfully"
    }
    ```

  * **403**: Forbidden (not owner).

  * **404**: Interaction not found.

-----

### Upload Routes (`/api/uploads`)

**Purpose**: Serves uploaded images for users, gyms, classes, and competitions.

#### `GET /api/uploads/:entityType/:filename`
- **Description**: Retrieves an image file.
- **Parameters**:
  - `entityType`: One of `users`, `gyms`, `gym-classes`, `competitions`.
  - `filename`: Image filename.
- **Response**:
  - **200**: Serves the image file (Content-Type: image/webp).
  - **404**: Image not found.

---

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
    "status": "error",
    "message": "Validation error",
    "error": [
      {
        "path": "string",
        "message": "string"
      }
    ]
  }
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
  npx prisma migrate dev
  node src/index.js
  ```

---

This documentation provides a comprehensive guide for developers to understand and extend the Workout Tracker API. For further details, refer to the source code or contact the development team.