import React, { useState, useEffect } from "react";
import axios from "axios";

function ManualAllocation({ onAllocationComplete }) {
  const [teachers, setTeachers] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [teachersRes, classroomsRes] = await Promise.all([
        axios.get("/api/unallocated-teachers"),
        axios.get("/api/available-classrooms"),
      ]);

      setTeachers(teachersRes.data);
      setClassrooms(classroomsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load teachers and classrooms");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeacher || !selectedClassroom) {
      setError("Please select both teacher and classroom");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await axios.post("/api/manual-allocate", {
        teacherId: selectedTeacher,
        classroomId: selectedClassroom,
      });

      setSuccess("Teacher allocated successfully!");
      setSelectedTeacher("");
      setSelectedClassroom("");

      // Refresh data
      await fetchData();

      // Notify parent component
      if (onAllocationComplete) {
        onAllocationComplete();
      }
    } catch (error) {
      console.error("Error allocating teacher:", error);
      setError(error.response?.data?.error || "Failed to allocate teacher");
    } finally {
      setLoading(false);
    }
  };

  const formatTeacherOption = (teacher) => {
    const semester = teacher.teaches_sem_3 ? "3" : "5";
    return `${teacher.name} (Sem ${semester}, Div ${teacher.division})`;
  };

  const formatClassroomOption = (classroom) => {
    return `${classroom.name} (Capacity: ${
      classroom.students_per_bench
    }, Current: ${classroom.current_teachers || 0})`;
  };

  if (loading && !teachers.length && !classrooms.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="manual-allocation">
      <h3>Manual Teacher Allocation</h3>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Teacher:</label>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            disabled={loading}
          >
            <option value="">Choose a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {formatTeacherOption(teacher)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Select Classroom:</label>
          <select
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            disabled={loading}
          >
            <option value="">Choose a classroom</option>
            {classrooms.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {formatClassroomOption(classroom)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedTeacher || !selectedClassroom}
        >
          Allocate Teacher
        </button>
      </form>
    </div>
  );
}

export default ManualAllocation;
