import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import TeacherList from "./components/TeacherList";
import AllocationForm from "./components/AllocationForm";
import AllocationList from "./components/AllocationList";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<TeacherList />} />
            <Route path="/allocate" element={<AllocationForm />} />
            <Route path="/allocations" element={<AllocationList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
