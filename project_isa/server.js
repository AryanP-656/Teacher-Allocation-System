import express from "express";
import mysql from "mysql";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5175", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL server");

  // Creating the database
  db.query("CREATE DATABASE IF NOT EXISTS isa_db", (err) => {
    if (err) {
      console.error("Error creating database:", err);
      return;
    }
    console.log("Database created or already exists");

    // Use the created database
    db.query("USE isa_db", (err) => {
      if (err) {
        console.error("Error using database:", err);
        return;
      }

      // Creating the classrooms table
      const createClassroomsTable = `
        CREATE TABLE IF NOT EXISTS classrooms (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL,
          num_benches INT NOT NULL,
          students_per_bench INT NOT NULL,
          total_capacity INT NOT NULL
        )`;

      // Creating the teachers table
      const createTeachersTable = `
        CREATE TABLE IF NOT EXISTS teachers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          teaches_sem_3 BOOLEAN DEFAULT 0,
          teaches_sem_5 BOOLEAN DEFAULT 0,
          division VARCHAR(1) NOT NULL
        )`;

      // Creating the allocations table
      const createAllocationsTable = `
        CREATE TABLE IF NOT EXISTS allocations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          teacher_id INT,
          classroom_id INT,
          semester INT NOT NULL,
          allocation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (teacher_id) REFERENCES teachers(id),
          FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
        )`;

      // Execute table creation queries
      db.query(createClassroomsTable, (err) => {
        if (err) {
          console.error("Error creating classrooms table:", err);
          return;
        }
        console.log("Classrooms table ready");

        // Insert classroom data
        const classroomData = [
          ["CSC313", 40, 2],
          ["CLAB-1", 36, 2],
          ["CLAB-2", 38, 2],
          ["LAB-1", 37, 2],
          ["CLH209", 38, 2],
          ["CLH208", 22, 3],
          ["CLH310", 22, 3],
          ["CLH303", 36, 2],
          ["CLH204", 35, 2],
          ["CLH304", 34, 2],
          ["CLH210", 22, 3],
          ["CLH308", 36, 2],
          ["LAB-6", 34, 2],
          ["LAB-7", 34, 2],
        ];

        const insertClassroomSQL = `
          INSERT IGNORE INTO classrooms (name, num_benches, students_per_bench, total_capacity) 
          VALUES ?`;

        const classroomValues = classroomData.map((room) => [
          room[0],
          room[1],
          room[2],
          room[1] * room[2],
        ]);

        db.query(insertClassroomSQL, [classroomValues], (err) => {
          if (err) {
            console.error("Error inserting classroom data:", err);
            return;
          }
          console.log("Classroom data inserted");
        });
      });

      db.query(createTeachersTable, (err) => {
        if (err) {
          console.error("Error creating teachers table:", err);
          return;
        }
        console.log("Teachers table ready");

        try {
          // Read both CSV files
          const sem3Data = fs
            .readFileSync("./teacher-list.csv", "utf-8")
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => {
              const [name, _, division, semester] = line.split(",");
              return {
                name: name.trim(),
                division: division.trim(),
                semester: parseInt(semester),
              };
            });

          const sem5Data = fs
            .readFileSync("./teacher-list-sem-5.csv", "utf-8")
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => {
              const [name, _, division, semester] = line.split(",");
              return {
                name: name.trim(),
                division: division.trim(),
                semester: parseInt(semester),
              };
            });

          // Create a Map to track first occurrence of each teacher
          const teacherFirstOccurrence = new Map();

          // Process sem3 teachers first
          const teacherValues = [];

          sem3Data.forEach((teacher) => {
            if (!teacherFirstOccurrence.has(teacher.name)) {
              teacherFirstOccurrence.set(teacher.name, {
                division: teacher.division,
                teaches_sem_3: 1,
                teaches_sem_5: 0,
              });
              teacherValues.push([
                teacher.name,
                1, // teaches_sem_3
                0, // teaches_sem_5
                teacher.division,
              ]);
            }
          });

          // Process sem5 teachers
          sem5Data.forEach((teacher) => {
            if (!teacherFirstOccurrence.has(teacher.name)) {
              teacherFirstOccurrence.set(teacher.name, {
                division: teacher.division,
                teaches_sem_3: 0,
                teaches_sem_5: 1,
              });
              teacherValues.push([
                teacher.name,
                0, // teaches_sem_3
                1, // teaches_sem_5
                teacher.division,
              ]);
            }
          });

          if (teacherValues.length > 0) {
            const insertTeacherSQL = `
              INSERT IGNORE INTO teachers (name, teaches_sem_3, teaches_sem_5, division) 
              VALUES ?`;

            db.query(insertTeacherSQL, [teacherValues], (err) => {
              if (err) {
                console.error("Error inserting teacher data:", err);
                return;
              }
              console.log("Teacher data inserted successfully");
            });
          }
        } catch (error) {
          console.error("Error processing teacher data:", error);
        }
      });

      db.query("DROP TABLE IF EXISTS allocations", (err) => {
        if (err) {
          console.error("Error dropping allocations table:", err);
          return;
        }
        console.log("Allocations table dropped");

        // Now create the table with the new schema
        db.query(createAllocationsTable, (err) => {
          if (err) {
            console.error("Error creating allocations table:", err);
            return;
          }
          console.log("Allocations table ready");
        });
      });
    });
  });
});

// API Routes
app.get("/api/classrooms", (req, res) => {
  const sql = "SELECT * FROM classrooms";
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(result);
  });
});

app.get("/api/teachers/:semester", (req, res) => {
  const semester = req.params.semester;
  const sql = `SELECT * FROM teachers WHERE teaches_sem_${semester} = 1`;
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(result);
  });
});

// Modified allocation route - the version that was working before
// Modified allocation route
app.post("/api/allocate-division", (req, res) => {
  const { semester, division } = req.body;

  // First, get classrooms with their current allocations and semester distribution
  const classroomQuery = `
    SELECT 
      c.*,
      COUNT(a.id) as current_teachers,
      SUM(CASE WHEN t.teaches_sem_3 = 1 THEN 1 ELSE 0 END) as sem3_count,
      SUM(CASE WHEN t.teaches_sem_5 = 1 THEN 1 ELSE 0 END) as sem5_count
    FROM classrooms c
    LEFT JOIN allocations a ON c.id = a.classroom_id
    LEFT JOIN teachers t ON a.teacher_id = t.id
    GROUP BY c.id
    HAVING current_teachers < students_per_bench OR current_teachers IS NULL
    ORDER BY c.name`;

  db.query(classroomQuery, (err, availableClassrooms) => {
    if (err) {
      console.error("Error fetching classrooms:", err);
      res.status(500).json({ error: err.message });
      return;
    }

    // Get unallocated teachers for this division and semester
    const teacherQuery = `
      SELECT t.* 
      FROM teachers t
      LEFT JOIN allocations a ON t.id = a.teacher_id
      WHERE t.teaches_sem_${semester} = 1 
      AND t.division = ?
      AND a.id IS NULL
      ORDER BY t.name`;

    db.query(teacherQuery, [division], (err, availableTeachers) => {
      if (err) {
        console.error("Error fetching teachers:", err);
        res.status(500).json({ error: err.message });
        return;
      }

      // Create allocations following semester distribution rules
      const allocations = [];
      let teacherIndex = 0;

      availableClassrooms.forEach((classroom) => {
        const sem3Teachers = classroom.sem3_count || 0;
        const sem5Teachers = classroom.sem5_count || 0;
        const currentTotal = classroom.current_teachers || 0;
        const maxTeachers = classroom.students_per_bench;
        let canAllocate = false;

        if (maxTeachers === 2) {
          // For rooms with capacity 2, ensure one teacher from each semester
          if (semester === "3" && sem3Teachers === 0) canAllocate = true;
          if (semester === "5" && sem5Teachers === 0) canAllocate = true;
        } else if (maxTeachers === 3) {
          // For rooms with capacity 3
          if (semester === "3") {
            // Allow up to 2 sem3 teachers if there's at least 1 sem5 teacher
            if (sem3Teachers < 2 || (sem3Teachers < 2 && sem5Teachers > 0))
              canAllocate = true;
          } else {
            // Allow up to 2 sem5 teachers if there's at least 1 sem3 teacher
            if (sem5Teachers < 2 || (sem5Teachers < 2 && sem3Teachers > 0))
              canAllocate = true;
          }
        }

        if (
          canAllocate &&
          currentTotal < maxTeachers &&
          teacherIndex < availableTeachers.length
        ) {
          allocations.push([availableTeachers[teacherIndex].id, classroom.id]);
          teacherIndex++;
        }
      });

      if (allocations.length > 0) {
        const sql =
          "INSERT INTO allocations (teacher_id, classroom_id) VALUES ?";
        db.query(sql, [allocations], (err, result) => {
          if (err) {
            console.error("Error inserting allocations:", err);
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({
            success: true,
            message: `Created ${allocations.length} allocations`,
          });
        });
      } else {
        res.status(400).json({
          error:
            "No valid allocations could be created. Check semester distribution rules.",
        });
      }
    });
  });
});

// GET allocations route - the version that was working before
// GET allocations route
app.get("/api/allocations", (req, res) => {
  const sql = `
    SELECT 
      c.id as classroom_id,
      c.name as classroom_name,
      c.students_per_bench as max_teachers,
      GROUP_CONCAT(t.name) as teacher_names,
      COUNT(a.id) as current_teachers,
      c.students_per_bench
    FROM classrooms c
    LEFT JOIN allocations a ON c.id = a.classroom_id
    LEFT JOIN teachers t ON a.teacher_id = t.id
    GROUP BY c.id, c.name, c.students_per_bench
    ORDER BY c.name`;

  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const allocated = result
      .filter((r) => r.teacher_names)
      .map((room) => ({
        classroom_id: room.classroom_id,
        classroom_name: room.classroom_name,
        max_teachers: room.students_per_bench,
        teacher_names: room.teacher_names ? room.teacher_names.split(",") : [],
        current_teachers: room.current_teachers,
        students_per_bench: room.students_per_bench,
      }));

    const unallocated = result
      .filter((r) => !r.teacher_names)
      .map((room) => ({
        classroom_id: room.classroom_id,
        classroom_name: room.classroom_name,
        students_per_bench: room.students_per_bench,
      }));

    res.json({
      allocated,
      unallocated,
    });
  });
});

// Modify the delete endpoint to handle classroom-based deletion
app.delete("/api/allocations/classroom/:classroomId", (req, res) => {
  const classroomId = req.params.classroomId;
  const sql = "DELETE FROM allocations WHERE classroom_id = ?";
  db.query(sql, [classroomId], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, message: "Allocations deleted successfully" });
  });
});

app.get("/api/teachers-info", (req, res) => {
  const sql = "SELECT id, name, teaches_sem_3, teaches_sem_5 FROM teachers";
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(result);
  });
});

// New endpoint for detailed teacher information
app.get("/api/teachers-details", (req, res) => {
  try {
    // Add console.log to debug
    console.log("Reading teacher files...");

    // Use path.join for better path handling
    const sem3Data = fs
      .readFileSync("teacher-list.csv", "utf-8") // Removed the './' prefix
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const [name, course, division, semester] = line.split(",");
        return {
          name: name.trim(),
          course: course.trim(),
          division: division.trim(),
          semester: 3,
        };
      });

    const sem5Data = fs
      .readFileSync("teacher-list-sem-5.csv", "utf-8") // Removed the './' prefix
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const [name, course, division, semester] = line.split(",");
        return {
          name: name.trim(),
          course: course.trim(),
          division: division.trim(),
          semester: 5,
        };
      });

    // Add debug log
    console.log("Teachers data loaded:", {
      sem3Count: sem3Data.length,
      sem5Count: sem5Data.length,
    });

    const allTeachers = [...sem3Data, ...sem5Data];
    res.json(allTeachers);
  } catch (error) {
    console.error("Error reading teacher data:", error, error.stack);
    res.status(500).json({
      error: "Failed to fetch teacher details",
      details: error.message,
    });
  }
});

// Get unallocated teachers
app.get("/api/unallocated-teachers", (req, res) => {
  const sql = `
    SELECT t.id, t.name, t.teaches_sem_3, t.teaches_sem_5, t.division
    FROM teachers t
    LEFT JOIN allocations a ON t.id = a.teacher_id
    WHERE a.id IS NULL
    ORDER BY t.name`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching unallocated teachers:", err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(result);
  });
});

// Get available classrooms with current allocations
app.get("/api/available-classrooms", (req, res) => {
  const sql = `
    SELECT 
      c.id,
      c.name,
      c.students_per_bench,
      COUNT(a.id) as current_teachers,
      SUM(CASE WHEN t.teaches_sem_3 = 1 THEN 1 ELSE 0 END) as sem3_count,
      SUM(CASE WHEN t.teaches_sem_5 = 1 THEN 1 ELSE 0 END) as sem5_count
    FROM classrooms c
    LEFT JOIN allocations a ON c.id = a.classroom_id
    LEFT JOIN teachers t ON a.teacher_id = t.id
    GROUP BY c.id, c.name, c.students_per_bench
    HAVING current_teachers < students_per_bench OR current_teachers IS NULL
    ORDER BY c.name`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching available classrooms:", err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(result);
  });
});

// Manual allocation endpoint
app.post("/api/manual-allocate", (req, res) => {
  const { teacherId, classroomId } = req.body;

  // Input validation
  if (!teacherId || !classroomId) {
    res.status(400).json({ error: "Teacher ID and Classroom ID are required" });
    return;
  }

  // First get teacher details
  const teacherQuery = "SELECT * FROM teachers WHERE id = ?";
  db.query(teacherQuery, [teacherId], (err, teacherResult) => {
    if (err) {
      console.error("Error fetching teacher:", err);
      res.status(500).json({ error: "Database error while fetching teacher" });
      return;
    }

    if (teacherResult.length === 0) {
      res.status(404).json({ error: "Teacher not found" });
      return;
    }

    const teacher = teacherResult[0];

    // Get classroom details with current allocations
    const classroomQuery = `
      SELECT 
        c.*,
        COUNT(a.id) as current_teachers,
        SUM(CASE WHEN t.teaches_sem_3 = 1 THEN 1 ELSE 0 END) as sem3_count,
        SUM(CASE WHEN t.teaches_sem_5 = 1 THEN 1 ELSE 0 END) as sem5_count
      FROM classrooms c
      LEFT JOIN allocations a ON c.id = a.classroom_id
      LEFT JOIN teachers t ON a.teacher_id = t.id
      WHERE c.id = ?
      GROUP BY c.id`;

    db.query(classroomQuery, [classroomId], (err, classroomResult) => {
      if (err) {
        console.error("Error fetching classroom:", err);
        res
          .status(500)
          .json({ error: "Database error while fetching classroom" });
        return;
      }

      if (classroomResult.length === 0) {
        res.status(404).json({ error: "Classroom not found" });
        return;
      }

      const classroom = classroomResult[0];

      // Check if classroom is full
      if (classroom.current_teachers >= classroom.students_per_bench) {
        res.status(400).json({ error: "Classroom is already full" });
        return;
      }

      // Check semester distribution rules
      const isSem3Teacher = teacher.teaches_sem_3 === 1;
      const isSem5Teacher = teacher.teaches_sem_5 === 1;

      if (classroom.students_per_bench === 2) {
        if (
          (isSem3Teacher && classroom.sem3_count > 0) ||
          (isSem5Teacher && classroom.sem5_count > 0)
        ) {
          res.status(400).json({
            error:
              "For 2-capacity rooms, cannot have more than one teacher from the same semester",
          });
          return;
        }
      } else if (classroom.students_per_bench === 3) {
        if (
          (isSem3Teacher && classroom.sem3_count >= 2) ||
          (isSem5Teacher && classroom.sem5_count >= 2)
        ) {
          res.status(400).json({
            error:
              "For 3-capacity rooms, cannot have more than two teachers from the same semester",
          });
          return;
        }
      }

      // If all checks pass, create the allocation
      const insertQuery =
        "INSERT INTO allocations (teacher_id, classroom_id) VALUES (?, ?)";
      db.query(insertQuery, [teacherId, classroomId], (err, result) => {
        if (err) {
          console.error("Error creating allocation:", err);
          res.status(500).json({ error: "Failed to create allocation" });
          return;
        }
        res.json({
          success: true,
          message: "Teacher allocated successfully",
        });
      });
    });
  });
});

// Get question paper counts for a classroom
app.get("/api/question-papers/:classroomId", (req, res) => {
  const classroomId = req.params.classroomId;

  const sql = `
    SELECT 
      c.name as classroom_name,
      c.num_benches,
      SUM(CASE WHEN t.teaches_sem_3 = 1 THEN 1 ELSE 0 END) as sem3_teachers,
      SUM(CASE WHEN t.teaches_sem_5 = 1 THEN 1 ELSE 0 END) as sem5_teachers
    FROM classrooms c
    LEFT JOIN allocations a ON c.id = a.classroom_id
    LEFT JOIN teachers t ON a.teacher_id = t.id
    WHERE c.id = ?
    GROUP BY c.id, c.name, c.num_benches`;

  db.query(sql, [classroomId], (err, result) => {
    if (err) {
      console.error("Error fetching question paper counts:", err);
      res.status(500).json({ error: err.message });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ error: "Classroom not found" });
      return;
    }

    const classroom = result[0];
    const paperCounts = {
      classroom_name: classroom.classroom_name,
      papers: {},
    };

    // Add sem3 count if there are sem3 teachers
    if (classroom.sem3_teachers === 1) {
      paperCounts.papers.sem3 = classroom.num_benches;
    } else if (classroom.sem3_teachers === 2) {
      paperCounts.papers.sem3 = classroom.num_benches * 2;
    }

    // Add sem5 count if there are sem5 teachers
    if (classroom.sem5_teachers === 1) {
      paperCounts.papers.sem5 = classroom.num_benches;
    } else if (classroom.sem5_teachers === 2) {
      paperCounts.papers.sem5 = classroom.num_benches * 2;
    }

    res.json(paperCounts);
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
