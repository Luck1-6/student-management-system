import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function StudentDashboard() {
  return (
    <div>
      <h1>Student Dashboard TEST</h1>

      <Link to="/attendance">
        View Attendance
      </Link>

      <br />
      <br />

      <LogoutButton />
    </div>
  );
}

export default StudentDashboard;