import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import { getAdminDashboard } from "../api/adminApi";
import "./styles/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getAdminDashboard();
      setDashboard(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, Administrator 👋</p>
        </div>

        <LogoutButton />
      </div>

      <div className="dashboard-grid">

        <div className="dashboard-card">
          <h3>👨‍🎓 Students</h3>
          <h2>{dashboard.total_students}</h2>
        </div>

        <div className="dashboard-card">
          <h3>👨‍🏫 Staff</h3>
          <h2>{dashboard.total_staff}</h2>
        </div>

        <div className="dashboard-card">
          <h3>📚 Subjects</h3>
          <h2>{dashboard.total_subjects}</h2>
        </div>

        <div className="dashboard-card">
          <h3>📝 Attendance Records</h3>
          <h2>{dashboard.total_attendance_records}</h2>
        </div>

        <div className="dashboard-card">
          <h3>📅 Today's Attendance</h3>
          <h2>{dashboard.today_attendance_percentage}%</h2>
        </div>

        <div className="dashboard-card">
          <h3>📈 Overall Attendance</h3>
          <h2>{dashboard.overall_attendance_percentage}%</h2>
        </div>

      </div>

      <div className="quick-actions">

        <h2>Quick Actions</h2>

        <button
          className="attendance-btn"
          onClick={() => navigate("/admin/attendance")}
        >
          📋 View Attendance
        </button>

      </div>

    </div>
  );
}

export default AdminDashboard;