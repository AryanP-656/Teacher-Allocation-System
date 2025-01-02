import React, { useState, useEffect } from "react";
import axios from "axios";
import ManualAllocation from "./ManualAllocation";

function AllocationForm() {
  const [semester, setSemester] = useState("3");
  const [division, setDivision] = useState("A");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [availableClassrooms, setAvailableClassrooms] = useState([]);

  useEffect(() => {
    fetchAvailableClassrooms();
  }, []);

  const fetchAvailableClassrooms = async () => {
    try {
      const response = await axios.get("/api/allocations");
      const available = response.data.unallocated.length;
      const partial = response.data.allocated.filter(
        (c) => c.current_teachers < c.students_per_bench
      ).length;
      setAvailableClassrooms({ available, partial });
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post("/api/allocate-division", {
        semester,
        division,
      });

      setMessage("Allocation successful!");
      fetchAvailableClassrooms(); // Refresh available classrooms
    } catch (error) {
      console.error("Error allocating:", error);
      setMessage(error.response?.data?.error || "Error during allocation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Teacher Allocation</h2>

      {/* Automatic Division Allocation */}
      <div className="allocation-section">
        <h3>Automatic Division Allocation</h3>

        <div className="classroom-status">
          <p>Available empty classrooms: {availableClassrooms.available}</p>
          <p>Classrooms with space: {availableClassrooms.partial}</p>
        </div>

        <form onSubmit={handleAllocate}>
          <div className="form-group">
            <label>Semester:</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value="3">Semester 3</option>
              <option value="5">Semester 5</option>
            </select>
          </div>

          <div className="form-group">
            <label>Division:</label>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
            >
              <option value="A">Division A</option>
              <option value="B">Division B</option>
              <option value="C">Division C</option>
              <option value="D">Division D</option>
              <option value="E">Division E</option>
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Allocating..." : "Allocate Division"}
          </button>
        </form>

        {message && (
          <div className={message.includes("Error") ? "error" : "success"}>
            {message}
          </div>
        )}
      </div>

      {/* Manual Allocation Section */}
      <div className="allocation-section">
        <ManualAllocation onAllocationComplete={fetchAvailableClassrooms} />
      </div>
    </div>
  );
}

export default AllocationForm;
