import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAttendanceAnalytics } from "../api/adminApi";
import "./styles/AttendanceAnalytics.css";

function AttendanceAnalytics() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await getAttendanceAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="attendance-analytics">
        <h2>Loading Analytics...</h2>
      </div>
    );
  }

  const pieData = [
    {
      name: "Present",
      value: analytics.present_absent.Present,
    },
    {
      name: "Absent",
      value: analytics.present_absent.Absent,
    },
  ];

  const COLORS = ["#22c55e", "#ef4444"]; 

  return (
    <div className="attendance-analytics">

      <div className="page-top">

        <div>
          <h1>📊 Attendance Analytics</h1>
          <p>Attendance reports and insights</p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/admin")}
        >
          ← Dashboard
        </button>

      </div>

      <div className="analytics-cards">

        <div className="analytics-card">
          <h3>Overall Attendance</h3>
          <h2>{analytics.overall_percentage}%</h2>
        </div>

        <div className="analytics-card">
          <h3>Total Present</h3>
          <h2>{analytics.present_absent.Present}</h2>
        </div>

        <div className="analytics-card">
          <h3>Total Absent</h3>
          <h2>{analytics.present_absent.Absent}</h2>
        </div>

      </div>

            {/* ===========================
          Charts Section
      =========================== */}

      <div className="charts-grid">

        {/* Pie Chart */}

        <div className="chart-card">

          <h2>Present vs Absent</h2>

          <ResponsiveContainer width="100%" height={300}>

            <PieChart>

              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>

        {/* Subject-wise Attendance */}

        <div className="chart-card">

          <h2>Subject-wise Attendance</h2>

          <ResponsiveContainer width="100%" height={300}>

            <BarChart
              data={analytics.subject_attendance}
            >

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="subject" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="percentage"
                fill="#2563eb"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* Daily Trend */}

        <div className="chart-card full-width">

          <h2>Daily Attendance Trend</h2>

          <ResponsiveContainer width="100%" height={320}>

            <LineChart
              data={analytics.daily_trend}
            >

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#2563eb"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>

      <div className="tables-section">

        <div className="table-card">

          <h2>🏆 Top Students</h2>

          <table>

            <thead>
              <tr>
                <th>Student</th>
                <th>Attendance</th>
              </tr>
            </thead>

            <tbody>

              {analytics.top_students?.map((student, index) => (
                <tr key={index}>
                  <td>{student.name}</td>
                  <td>{student.attendance}%</td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>

        <div className="table-card">

          <h2>⚠ Low Attendance</h2>

          <table>

            <thead>
              <tr>
                <th>Student</th>
                <th>Attendance</th>
              </tr>
            </thead>

            <tbody>

              {analytics.low_students?.map((student, index) => (
                <tr key={index}>
                  <td>{student.name}</td>
                  <td>{student.attendance}%</td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default AttendanceAnalytics;