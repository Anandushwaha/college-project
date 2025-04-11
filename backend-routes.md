# Backend API Routes

## Authentication Routes

- **POST /api/v1/auth/register** - Register a new user
- **POST /api/v1/auth/login** - Login user
- **POST /api/v1/auth/logout** - Logout user
- **POST /api/v1/auth/refresh** - Refresh access token

## Course Routes

- **POST /api/v1/courses/create** - Create a new course (teacher only)
- **GET /api/v1/courses/teacher** - Get all courses created by a teacher
- **PUT /api/v1/courses/:id** - Update a course
- **DELETE /api/v1/courses/:id** - Delete a course
- **GET /api/v1/courses** - Get all available courses
- **PUT /api/v1/courses/enroll/approve/:notificationId** - Approve enrollment request
- **PUT /api/v1/courses/enroll/reject/:notificationId** - Reject enrollment request
- **POST /api/v1/courses/enroll/:id** - Send enrollment request
- **POST /api/v1/courses/create-room** - Create a video meeting room

## Question Routes

- **GET /api/v1/questions** - Get all questions
- **POST /api/v1/questions** - Create a new question
- **POST /api/v1/questions/answer** - Post an answer to a question

## Lecture Routes

- **GET /api/v1/lectures** - Get all lectures
- **POST /api/v1/lectures** - Create a new lecture
- **PUT /api/v1/lectures/:id** - Update a lecture
- **DELETE /api/v1/lectures/:id** - Delete a lecture

## Assignment Routes

- **GET /api/v1/assignment** - Get all assignments
- **POST /api/v1/assignment** - Create a new assignment
- **PUT /api/v1/assignment/:id** - Update an assignment
- **DELETE /api/v1/assignment/:id** - Delete an assignment

## Announcement Routes

- **GET /api/v1/announcements** - Get all announcements
- **POST /api/v1/announcements** - Create a new announcement
- **PUT /api/v1/announcements/:id** - Update an announcement
- **DELETE /api/v1/announcements/:id** - Delete an announcement

## Job Routes

- **GET /api/v1/jobs** - Get all jobs
- **POST /api/v1/jobs** - Post a new job

## Video Routes

- **API /api/video** - Video conferencing related routes

## Socket.IO Endpoints

The backend also implements real-time features using Socket.IO for:

- Sending and receiving questions
- Posting and receiving answers in real-time
