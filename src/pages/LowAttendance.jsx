import { useEffect, useState } from "react";
import { getLowAttendanceStudents } from "../api/adminApi";
import "./styles/LowAttendance.css";

function LowAttendance() {
  const [threshold, setThreshold] = useState(75);
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLowAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getLowAttendanceStudents(threshold);

      setStudents(data.students || []);
      setTotalStudents(
        data.total_low_attendance_students || 0
      );
    } catch (err) {
      console.error("Low attendance error:", err);

      setError(
        err.response?.data?.error ||
        "Failed to load low attendance students."
      );

      setStudents([]);
      setTotalStudents(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowAttendance();
  }, [threshold]);

  return (
    <div className="low-attendance-page">

      {/* Header */}
      <div className="low-attendance-header">
        <div>
          <h1>Low Attendance Students</h1>

          <p>
            Students with attendance below the selected threshold
          </p>
        </div>

        <div className="threshold-control">
          <label htmlFor="threshold">
            Attendance Threshold
          </label>

          <select
            id="threshold"
            value={threshold}
            onChange={(e) =>
              setThreshold(Number(e.target.value))
            }
          >
            <option value={50}>Below 50%</option>
            <option value={60}>Below 60%</option>
            <option value={65}>Below 65%</option>
            <option value={70}>Below 70%</option>
            <option value={75}>Below 75%</option>
            <option value={80}>Below 80%</option>
            <option value={85}>Below 85%</option>
            <option value={90}>Below 90%</option>
          </select>
        </div>
      </div>

      {/* Summary Card */}
      <div className="low-attendance-summary">
        <div className="summary-card">
          <span className="summary-label">
            Students Below Threshold
          </span>

          <span className="summary-value">
            {totalStudents}
          </span>
        </div>

        <div className="summary-card">
          <span className="summary-label">
            Current Threshold
          </span>

          <span className="summary-value">
            {threshold}%
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="low-attendance-error">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="low-attendance-loading">
          Loading low attendance students...
        </div>
      ) : students.length === 0 ? (

        /* Empty State */
        <div className="low-attendance-empty">
          <div className="empty-icon">✓</div>

          <h2>No Low Attendance Students</h2>

          <p>
            No students currently have attendance below{" "}
            {threshold}%.
          </p>
        </div>

      ) : (

        /* Table */
        <div className="low-attendance-table-container">
          <table className="low-attendance-table">

            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Total Classes</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Attendance</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student, index) => (
                <tr key={student.student_id}>

                  <td>
                    {index + 1}
                  </td>

                  <td>
                    <div className="student-name">
                      {student.student_name}
                    </div>
                  </td>

                  <td>
                    {student.total_classes}
                  </td>

                  <td>
                    {student.present_classes}
                  </td>

                  <td>
                    {student.absent_classes}
                  </td>

                  <td>
                    <span className="attendance-badge">
                      {student.attendance_percentage}%
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

    </div>
  );
}

export default LowAttendance;