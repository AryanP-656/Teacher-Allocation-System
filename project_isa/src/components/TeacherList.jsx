import React, { useState, useEffect } from "react";
import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "/api", // This will use the proxy
  headers: {
    "Content-Type": "application/json",
  },
});

function TeacherList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedDivision, setSelectedDivision] = useState("all");

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/teachers-details"); // Just use the endpoint path
      setTeachers(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setError("Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const semesterMatch =
      selectedSemester === "all" ||
      teacher.semester.toString() === selectedSemester;
    const divisionMatch =
      selectedDivision === "all" || teacher.division === selectedDivision;
    return semesterMatch && divisionMatch;
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Teacher Details</h2>

      <div className="filters">
        <div>
          <label>Semester: </label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="all">All</option>
            <option value="3">Sem 3</option>
            <option value="5">Sem 5</option>
          </select>
        </div>

        <div>
          <label>Division: </label>
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
          >
            <option value="all">All</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
          </select>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Division</th>
            <th>Semester</th>
            <th>Course</th>
          </tr>
        </thead>
        <tbody>
          {filteredTeachers.map((teacher, index) => (
            <tr key={index}>
              <td>{teacher.name}</td>
              <td>{teacher.division}</td>
              <td>Sem {teacher.semester}</td>
              <td>{teacher.course}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TeacherList;
