import { useEffect, useState } from "react";
import API from "../api/attendanceApi";

function AttendancePage() {
  const [overall, setOverall] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const overallRes = await API.get("overall/");
      const subjectRes = await API.get("subject-summary/");
      const monthlyRes = await API.get("monthly/");
      const historyRes = await API.get("my/");

      setOverall(overallRes.data);
      setSubjects(subjectRes.data);
      setMonthly(monthlyRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Attendance Dashboard</h1>

      {overall && (
        <div>
          <h2>Overall Attendance</h2>
          <p>Total Classes: {overall.total_classes}</p>
          <p>Present: {overall.present_classes}</p>
          <p>Absent: {overall.absent_classes}</p>
          <p>Percentage: {overall.attendance_percentage}%</p>

          <h2>Subject Wise Attendance</h2>
          <table border="1">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Total</th>
                <th>Present</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => (
                <tr key={index}>
                  <td>{subject.subject}</td>
                  <td>{subject.total_classes}</td>
                  <td>{subject.present_classes}</td>
                  <td>{subject.attendance_percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Monthly Attendance</h2>
          <table border="1">
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Classes</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((month, index) => (
                <tr key={index}>
                  <td>{month.month}</td>
                  <td>{month.total_classes}</td>
                  <td>{month.present_classes}</td>
                  <td>{month.absent_classes}</td>
                  <td>{month.attendance_percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Attendance History</h2>
          <table border="1">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Staff</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record, index) => (
                <tr key={index}>
                  <td>{record.date}</td>
                  <td>{record.subject}</td>
                  <td>{record.status}</td>
                  <td>{record.staff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AttendancePage;