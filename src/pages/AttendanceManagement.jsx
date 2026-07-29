import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAttendanceRecords,
  updateAttendance,
  deleteAttendance,
  getSubjects,
} from "../api/adminApi";

import EditAttendanceModal from "../components/EditAttendanceModal";

import "./styles/AttendanceManagement.css";

const AttendanceManagement = () => {
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, [date, status]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const data = await getAttendanceRecords({
        date,
        status,
      });

      setAttendance(data);
    } catch (error) {
      console.error("Failed to load attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error("Failed to load subjects:", error);
    }
  };

  const handleEdit = (record) => {
    setSelectedAttendance(record);
    setIsModalOpen(true);
  };

  const handleSave = async (id, data) => {
    try {
      await updateAttendance(id, data);

      await fetchAttendance();

      setIsModalOpen(false);

      alert("Attendance updated successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to update attendance.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this attendance record?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAttendance(id);

      await fetchAttendance();

      alert("Attendance deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to delete attendance.");
    }
  };

  const filteredAttendance = attendance.filter((record) => {
    const keyword = search.toLowerCase();

    return (
      record.student_name.toLowerCase().includes(keyword) ||
      record.subject_name.toLowerCase().includes(keyword) ||
      record.staff_name.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="attendance-management">

      <div className="page-top">

        <div>
          <h1>📋 Attendance Management</h1>
          <p>View and manage attendance records.</p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/admin")}
        >
          ← Dashboard
        </button>

      </div>

      <div className="summary-card">

        <h3>Total Attendance Records</h3>
        <h2>{filteredAttendance.length}</h2>

      </div>

      <div className="filter-bar">

        <div className="results-info">
          Showing <strong>{filteredAttendance.length}</strong> of{" "}
          <strong>{attendance.length}</strong> records
        </div>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="date-input"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="status-input"
        >
          <option value="">All Statuses</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>

        <button
          className="clear-btn"
          onClick={() => {
            setSearch("");
            setDate("");
            setStatus("");
          }}
        >
          Clear Filters
        </button>

      </div>

      {loading ? (
        <h3>Loading attendance records...</h3>
      ) : (
        <div className="table-container">

          <table className="attendance-table">

            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Subject</th>
                <th>Staff</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((record) => (
                  <tr key={record.id}>

                    <td>{record.date}</td>

                    <td>{record.student_name}</td>

                    <td>{record.subject_name}</td>

                    <td>{record.staff_name}</td>

                    <td>
                      <span
                        className={
                          record.status === "Present"
                            ? "status present"
                            : "status absent"
                        }
                      >
                        {record.status}
                      </span>
                    </td>

                    <td>

                      <button
                        className="edit-btn"
                        onClick={() => {
                          console.log("Edit clicked");
                          console.log(record);
                          handleEdit(record);
                        }}
                      >
                        ✏️ Edit
                      </button>

                      <button 
                        className="delete-btn" 
                        onClick={() => handleDelete(record.id)}
                      >
                        🗑 Delete
                      </button>

                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    No attendance records found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      )}

      <EditAttendanceModal
        isOpen={isModalOpen}
        attendance={selectedAttendance}
        subjects={subjects}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

    </div>
  );
};

export default AttendanceManagement;