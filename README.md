# Teacher Allocation System

A web-based system for managing teacher allocations across classrooms for different semesters and divisions. Built with React, Node.js, Express, and MySQL.

## Features

- **Teacher Management**

  - View all teachers with their semester and division assignments
  - Track teachers' semester (3rd/5th) teaching assignments
  - Filter teachers by semester and division

- **Classroom Management**

  - Track classroom capacity and current occupancy
  - Monitor number of benches and students per bench
  - View total capacity for each classroom

- **Allocation Features**

  - Automatic division-wise teacher allocation
  - Manual teacher-to-classroom allocation
  - Real-time updates of allocation status
  - Paper count tracking for each classroom

- **Dynamic Updates**
  - Clear room allocations
  - View paper requirements per classroom
  - Track available and occupied classrooms

## Tech Stack

- **Frontend**: React.js, Axios
- **Backend**: Node.js, Express
- **Database**: MySQL
- **Development**: Vite

## Installation

1. Clone the repository

```bash
git clone <repository-url>
cd project_isa
```

2. Install dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Database Setup

```bash
# Create MySQL database and tables
# The tables will be automatically created when you run the server
```

4. Environment Setup

```bash
# Create a .env file in the backend directory with:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=isa_db
PORT=8080
```

## Running the Application

1. Start the backend server

```bash
cd backend
npm start
```

2. Start the frontend application

```bash
cd frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5175
- Backend: http://localhost:8080

## API Endpoints

- `GET /api/teachers-details` - Get all teacher details
- `GET /api/unallocated-teachers` - Get list of unallocated teachers
- `GET /api/available-classrooms` - Get list of available classrooms
- `POST /api/manual-allocate` - Manually allocate a teacher to a classroom
- `GET /api/allocations` - Get current allocations
- `GET /api/question-papers/:classroomId` - Get question paper counts for a classroom

## Database Schema

### Teachers Table

- id (Primary Key)
- name
- teaches_sem_3 (Boolean)
- teaches_sem_5 (Boolean)
- division

### Classrooms Table

- id (Primary Key)
- name
- num_benches
- students_per_bench
- total_capacity

### Allocations Table

- id (Primary Key)
- teacher_id (Foreign Key)
- classroom_id (Foreign Key)
- semester
- allocation_date

## Testing

The application includes Selenium tests for automated testing of the UI. To run the tests:

```bash
cd test
javac TeacherAllocationTest.java
java TeacherAllocationTest
```
