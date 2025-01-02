import React, { useState, useEffect } from "react";
import axios from "axios";

function AllocationList() {
  const [allocatedClassrooms, setAllocatedClassrooms] = useState([]);
  const [unallocatedClassrooms, setUnallocatedClassrooms] = useState([]);
  const [teacherInfo, setTeacherInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paperCounts, setPaperCounts] = useState({});
  const [loadingPapers, setLoadingPapers] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocationsRes, teachersRes] = await Promise.all([
        axios.get("/api/allocations"),
        axios.get("/api/teachers-info"),
      ]);

      // Create a map of teacher info
      const teacherMap = {};
      teachersRes.data.forEach((teacher) => {
        teacherMap[teacher.name] = {
          teaches_sem_3: teacher.teaches_sem_3,
          teaches_sem_5: teacher.teaches_sem_5,
        };
      });
      setTeacherInfo(teacherMap);

      setAllocatedClassrooms(allocationsRes.data.allocated || []);
      setUnallocatedClassrooms(allocationsRes.data.unallocated || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const formatTeacherName = (teacherName) => {
    const teacher = teacherInfo[teacherName.split(" (")[0]]; // Remove existing semester info if any
    if (!teacher) return teacherName;
    const semester = teacher.teaches_sem_3 ? "3" : "5";
    return `${teacherName.split(" (")[0]} (Sem ${semester})`;
  };

  const handleDelete = async (classroomId) => {
    try {
      await axios.delete(`/api/allocations/classroom/${classroomId}`);
      // Clear paper counts for this classroom when deleted
      setPaperCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[classroomId];
        return newCounts;
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting allocation:", error);
      setError("Failed to delete allocation");
    }
  };

  const fetchPaperCount = async (classroomId) => {
    try {
      setLoadingPapers((prev) => ({ ...prev, [classroomId]: true }));
      const response = await axios.get(`/api/question-papers/${classroomId}`);
      setPaperCounts((prev) => ({
        ...prev,
        [classroomId]: response.data.papers,
      }));
    } catch (error) {
      console.error("Error fetching paper counts:", error);
    } finally {
      setLoadingPapers((prev) => ({ ...prev, [classroomId]: false }));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Classroom Allocations</h2>

      {allocatedClassrooms.length > 0 && (
        <>
          <h3>Allocated Classrooms</h3>
          <table>
            <thead>
              <tr>
                <th>Classroom</th>
                <th>Teachers</th>
                <th>Capacity</th>
                <th>Question Papers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allocatedClassrooms.map((classroom) => (
                <tr key={classroom.classroom_id}>
                  <td>{classroom.classroom_name}</td>
                  <td>
                    {classroom.teacher_names
                      .map((name) => formatTeacherName(name))
                      .join(", ")}
                  </td>
                  <td>
                    {classroom.current_teachers}/{classroom.students_per_bench}
                    {classroom.students_per_bench === 3 &&
                      " (max 2 from same sem)"}
                  </td>
                  <td>
                    <button
                      className="paper-count-btn"
                      onClick={() => fetchPaperCount(classroom.classroom_id)}
                      disabled={loadingPapers[classroom.classroom_id]}
                    >
                      {loadingPapers[classroom.classroom_id]
                        ? "Loading..."
                        : "Show Papers"}
                    </button>
                    {paperCounts[classroom.classroom_id] && (
                      <div className="paper-counts">
                        {Object.entries(
                          paperCounts[classroom.classroom_id]
                        ).map(([sem, count]) => (
                          <div key={sem}>
                            Sem {sem}: {count}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      className="clear-room-btn"
                      onClick={() => handleDelete(classroom.classroom_id)}
                    >
                      Clear Room
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {unallocatedClassrooms.length > 0 && (
        <>
          <h3>Unallocated Classrooms</h3>
          <table>
            <thead>
              <tr>
                <th>Classroom</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody>
              {unallocatedClassrooms.map((classroom) => (
                <tr key={classroom.classroom_id}>
                  <td>{classroom.classroom_name}</td>
                  <td>{classroom.students_per_bench}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <style jsx>{`
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }

        th,
        td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }

        th {
          background-color: #f4f4f4;
        }

        .clear-room-btn,
        .paper-count-btn {
          background-color: #444;
          color: white;
          border: none;
          padding: 5px 10px;
          cursor: pointer;
          border-radius: 4px;
          width: 100%;
        }

        .clear-room-btn:hover,
        .paper-count-btn:hover {
          background-color: #666;
        }

        .paper-count-btn:disabled {
          background-color: #999;
          cursor: not-allowed;
        }

        .paper-counts {
          margin-top: 5px;
          padding: 5px;
          background-color: #f9f9f9;
          border-radius: 4px;
          font-size: 0.9em;
        }

        .paper-counts div {
          margin: 2px 0;
        }
      `}</style>
    </div>
  );
}

export default AllocationList;
