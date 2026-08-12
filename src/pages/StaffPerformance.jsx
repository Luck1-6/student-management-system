import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { getStaffPerformance } from "../api/adminApi";
import "./styles/StaffPerformance.css";

export default function StaffPerformance() {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffPerformance();
  }, []);

  const loadStaffPerformance = async () => {
    try {
      const data = await getStaffPerformance();
      setStaffData(data);
    } catch (error) {
      console.error("Error loading staff performance:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="staff-performance-page">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="staff-performance-page">
      <h1 className="page-title">Staff Performance Report</h1>

      <div className="staff-table-card">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Staff</th>
              <th>Total Marked</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Attendance %</th>
            </tr>
          </thead>

          <tbody>
            {staffData.length > 0 ? (
              staffData.map((staff) => (
                <tr key={staff.staff_id}>
                  <td>{staff.staff_name}</td>
                  <td>{staff.total_marked}</td>
                  <td>{staff.present}</td>
                  <td>{staff.absent}</td>
                  <td>{staff.attendance_percentage}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  No staff performance data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="chart-card">
        <h2>Attendance Performance</h2>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={staffData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="staff_name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />

            <Bar
              dataKey="attendance_percentage"
               fill="#2563eb"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}