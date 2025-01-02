import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          ISA Management
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Teachers
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/allocate" className="nav-link">
              Allocate
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/allocations" className="nav-link">
              View Allocations
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
