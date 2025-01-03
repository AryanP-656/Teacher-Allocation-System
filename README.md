# Teacher Allocation System

A web-based system for managing teacher allocations across classrooms for different semesters and divisions. Built with React, Node.js, Express, and MySQL.

## Features

**Teacher Management**
The system provides comprehensive teacher management capabilities allowing users to view all teachers along with their semester and division assignments. Users can easily track which teachers are assigned to 3rd or 5th semester classes and filter the view based on specific semesters and divisions for better organization.

**Classroom Management**
Classroom resources are efficiently managed through detailed tracking of capacity and occupancy. The system maintains records of bench counts and student capacity per bench, providing a clear overview of total classroom capacity to ensure optimal space utilization.

**Allocation Features**
Teachers can be allocated to classrooms through both automatic and manual processes. The automatic allocation handles division-wise distribution while manual allocation provides flexibility for specific assignments. The system provides real-time status updates and tracks paper requirements for each classroom allocation.

**Dynamic Updates**
The system supports real-time modifications including clearing room allocations, viewing paper requirements per classroom, and monitoring classroom availability status. These dynamic updates ensure the allocation system remains current and efficient.

## Tech Stack

- **Frontend**: React.js, Axios
- **Backend**: Node.js, Express
- **Database**: MySQL
- **Development**: Vite

## Project Structure

```
project_isa/
├── backend/
│   └── server.js
├── src/
│   └── components/
├── Selenium Testing/
│   └── src/
│       └── Test.java
├── classroom_list.csv
├── teacher-list.csv
├── vite.config.js
└── package.json
```

## Installation

1. Clone the repository and navigate to the project directory:

```bash
git clone <repository-url>
cd project_isa
```

2. Install project dependencies:

```bash
npm install
```

3. Database Setup:
   The MySQL database and tables will be automatically created when you run the server. Ensure MySQL is installed and running on your system.

## Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5175

## API Endpoints

The system exposes several REST endpoints for managing teacher allocations:

- `GET /api/teachers-details` - Retrieves all teacher information
- `GET /api/unallocated-teachers` - Lists teachers without classroom assignments
- `GET /api/available-classrooms` - Shows available classroom spaces
- `POST /api/manual-allocate` - Handles manual teacher-to-classroom allocation
- `GET /api/allocations` - Provides current allocation status
- `GET /api/question-papers/:classroomId` - Retrieves paper counts for specific classrooms

## Database Schema

**Teachers Table**
The teachers table stores faculty information including their name, semester teaching assignments (3rd/5th), and assigned division.

**Classrooms Table**
Classroom details are stored including room name, bench count, student capacity per bench, and total room capacity.

**Allocations Table**
This table manages the relationships between teachers and classrooms, tracking allocation dates and semester assignments.

## Testing

The project includes Selenium-based automated UI testing. To execute the tests:

```bash
cd "Selenium Testing/src"
javac Test.java
java Test
```
