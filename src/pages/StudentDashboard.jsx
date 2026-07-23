import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import "./styles/StudentDashboard.css";

function StudentDashboard() {
  return (
    <div className="student-dashboard">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>Welcome back 👋</p>
        </div>

        <LogoutButton />
      </div>

      {/* Statistics */}
      <div className="stats-grid">

        <div className="stat-card blue">
          <h2>84%</h2>
          <p>Overall Attendance</p>
        </div>

        <div className="stat-card green">
          <h2>126</h2>
          <p>Classes Present</p>
        </div>

        <div className="stat-card red">
          <h2>24</h2>
          <p>Classes Absent</p>
        </div>

      </div>

      {/* Quick Actions */}

      <h2 className="section-title">Quick Actions</h2>

      <div className="actions-grid">

        <Link to="/attendance" className="action-card">
          <span className="icon">📊</span>
          <h3>View Attendance</h3>
          <p>Check attendance records</p>
        </Link>

        <div className="action-card disabled">
          <span className="icon">📅</span>
          <h3>Timetable</h3>
          <p>Coming Soon</p>
        </div>

        <div className="action-card disabled">
          <span className="icon">📝</span>
          <h3>Assignments</h3>
          <p>Coming Soon</p>
        </div>

        <div className="action-card disabled">
          <span className="icon">📄</span>
          <h3>Results</h3>
          <p>Coming Soon</p>
        </div>

      </div>

    </div>
  );
}

export default StudentDashboard;