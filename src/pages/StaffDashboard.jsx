import { useNavigate } from "react-router-dom";
import { FaClipboardCheck, FaEdit } from "react-icons/fa";
import LogoutButton from "../components/LogoutButton";
import "./styles/StaffDashboard.css";

function StaffDashboard() {
  const navigate = useNavigate();

  return (
    <div className="staff-dashboard">

      {/* Header */}
      <div className="staff-header">
        <div>
          <h1>Staff Dashboard</h1>
          <p>Welcome! Manage student attendance from here.</p>
        </div>

        <LogoutButton />
      </div>

      {/* Welcome */}
      <div className="welcome-card">
        <h2>Welcome 👋</h2>
        <p>
          Select one of the options below to manage attendance.
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="dashboard-grid">

        <div className="dashboard-card">

          <FaClipboardCheck className="card-icon" />

          <h2>Mark Attendance</h2>

          <p>
            Record today's attendance for all students.
          </p>

          <button
            className="action-btn"
            onClick={() => navigate("/staff/attendance")}
          >
            Open
          </button>

        </div>

        <div className="dashboard-card">

          <FaEdit className="card-icon" />

          <h2>Update Attendance</h2>

          <p>
            Edit attendance records submitted previously.
          </p>

          <button
            className="action-btn"
            onClick={() => navigate("/staff/update-attendance")}
          >
            Open
          </button>

        </div>

      </div>

      {/* Information */}
      <div className="info-card">

        <h2>Quick Information</h2>

        <div className="info-grid">

          <div>
            <span>Date</span>
            <strong>{new Date().toLocaleDateString()}</strong>
          </div>

          <div>
            <span>Role</span>
            <strong>Staff</strong>
          </div>

          <div>
            <span>Status</span>
            <strong>Active</strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default StaffDashboard;