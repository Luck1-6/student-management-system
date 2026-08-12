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

  // FR-4.10 Search & Filter states
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [subject, setSubject] = useState("");
  const [staff, setStaff] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, [date, status, subject, staff]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const filters = {};

      if (date) {
        filters.date = date;
      }

      if (status) {
        filters.status = status;
      }

      if (subject) {
        filters.subject = subject;
      }

      if (staff) {
        filters.staff = staff;
      }

      const data = await getAttendanceRecords(filters);

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

  /*
   * FR-4.10
   * Client-side search.
   *
   * Searches:
   * - Student name
   * - Student ID
   * - Subject name
   * - Staff name
   */
  const filteredAttendance = attendance.filter((record) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    const studentName = String(record.student_name || "").toLowerCase();
    const studentId = String(record.student_id || "").toLowerCase();
    const subjectName = String(record.subject_name || "").toLowerCase();
    const staffName = String(record.staff_name || "").toLowerCase();

    return (
      studentName.includes(keyword) ||
      studentId.includes(keyword) ||
      subjectName.includes(keyword) ||
      staffName.includes(keyword)
    );
  });

  /*
   * Get unique staff names from the attendance response.
   * This allows us to provide a Staff dropdown without
   * creating another API endpoint.
   */
  const staffList = [
    ...new Set(
      attendance
        .map((record) => record.staff_name)
        .filter((name) => name)
    ),
  ].sort();

  /*
   * Subjects are already loaded from getSubjects().
   */
  const subjectList = subjects || [];

  const clearFilters = () => {
    setSearch("");
    setDate("");
    setStatus("");
    setSubject("");
    setStaff("");
  };

  const hasActiveFilters =
    search || date || status || subject || staff;

  return (
    <div className="attendance-management">

      {/* ==========================
          Page Header
      ========================== */}

      <div className="page-top">

        <div>
          <h1>📋 Attendance Management</h1>
          <p>
            View, search, filter and manage attendance records.
          </p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/admin")}
        >
          ← Dashboard
        </button>

      </div>

      {/* ==========================
          Summary Card
      ========================== */}

      <div className="summary-card">

        <h3>Total Attendance Records</h3>

        <h2>{filteredAttendance.length}</h2>

      </div>

      {/* ==========================
          FR-4.10 Search & Filters
      ========================== */}

      <div className="filter-bar">

        {/* Results information */}

        <div className="results-info">
          Showing <strong>{filteredAttendance.length}</strong> of{" "}
          <strong>{attendance.length}</strong> records
        </div>

        {/* Search */}

        <input
          type="text"
          placeholder="Search student, ID, subject or staff..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        {/* Date */}

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="date-input"
        />

        {/* Subject */}

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="status-input"
        >
          <option value="">All Subjects</option>

          {subjectList.map((item) => (
            <option
              key={item.id || item.subject_id || item.name}
              value={item.id || item.subject_id}
            >
              {item.name || item.subject_name}
            </option>
          ))}
        </select>

        {/* Staff */}

        <select
          value={staff}
          onChange={(e) => setStaff(e.target.value)}
          className="status-input"
        >
          <option value="">All Staff</option>

          {staffList.map((staffName) => (
            <option
              key={staffName}
              value={staffName}
            >
              {staffName}
            </option>
          ))}
        </select>

        {/* Status */}

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="status-input"
        >
          <option value="">All Statuses</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>

        {/* Clear */}

        <button
          className="clear-btn"
          onClick={clearFilters}
        >
          {hasActiveFilters ? "✕ Clear Filters" : "Clear Filters"}
        </button>

      </div>

      {/* ==========================
          Loading
      ========================== */}

      {loading ? (
        <h3>Loading attendance records...</h3>
      ) : (
        <div className="table-container">

          <table className="attendance-table">

            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Student ID</th>
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

                    <td>{record.student_id}</td>

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
                        onClick={() => handleEdit(record)}
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

                  <td colSpan="7">
                    No attendance records found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>
      )}

      {/* ==========================
          Edit Modal
      ========================== */}

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