import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function StaffDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Staff Dashboard</h1>

      <button
        onClick={() => navigate("/staff/attendance")}
      >
        Mark Attendance
      </button>

      <br />
      <br />

      <button
        onClick={() => navigate("/staff/update-attendance")}
      >
        Update Attendance
      </button>

      <br />
      <br />

      <LogoutButton />
    </div>
  );
}

export default StaffDashboard;