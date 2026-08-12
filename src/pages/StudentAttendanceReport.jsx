import { useEffect, useState } from "react";
import { getStudentAttendanceReport } from "../api/adminApi";
import "./styles/StudentAttendanceReport.css";

const StudentAttendanceReport = () => {
  const [studentId, setStudentId] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      setError("");

      const data = await getStudentAttendanceReport(studentId);
      setReport(data);
    } catch (err) {
      setReport(null);
      setError(
        err.response?.data?.error || "Unable to load report."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchReport();
    }
  }, [studentId]);

  return (
    <div className="student-report-container">
      <h2>Student Attendance Report</h2>

      <div className="report-search">
        <input
          type="number"
          placeholder="Enter Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />

        <button onClick={fetchReport}>
          Generate Report
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {error && (
        <p className="error-message">{error}</p>
      )}

      {report && (
        <>
          <div className="report-cards">
            <div className="report-card">
              <h3>Student</h3>

              <p>
                <strong>ID:</strong> {report.student.id}
              </p>

              <p>
                <strong>Name:</strong> {report.student.name}
              </p>
            </div>

            <div className="report-card">
              <h3>Overall Attendance</h3>

              <p>Present : {report.overall.present}</p>

              <p>Absent : {report.overall.absent}</p>

              <h2>{report.overall.percentage}%</h2>

              <div className="progress">
                <div
                  className="progress-fill"
                  style={{
                    width: `${report.overall.percentage}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <table className="report-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Percentage</th>
              </tr>
            </thead>

            <tbody>
              {report.subjects.map((item, index) => {
                let cls = "good";

                if (item.percentage < 75) {
                  cls = "low";
                } else if (item.percentage < 90) {
                  cls = "average";
                }

                return (
                  <tr key={index}>
                    <td>{item.subject}</td>

                    <td>{item.present}</td>

                    <td>{item.absent}</td>

                    <td className={cls}>
                      {item.percentage}%

                      <div className="progress">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${item.percentage}%`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default StudentAttendanceReport;