import { useEffect, useState } from "react";
import axios from "axios";
import "./styles/Staff.css";

function UpdateAttendancePage() {
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState([]);

useEffect(() => {
  fetchSubjects();
}, []);

const fetchSubjects = async () => {
  try {
    const token = localStorage.getItem("access");

    const response = await axios.get(
      "http://127.0.0.1:8000/api/attendance/subjects/",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setSubjects(response.data);
  } catch (error) {
    console.error(error);
  }
};

const loadAttendance = async () => {
  if (!subject || !date) {
    alert("Please select subject and date.");
    return;
  }

  try {
    const token = localStorage.getItem("access");

    const response = await axios.get(
      `http://127.0.0.1:8000/api/attendance/load/?subject=${subject}&date=${date}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setAttendance(response.data);

  } catch (error) {
    console.error(error);
    alert("Failed to load attendance.");
  }
};

const handleStatusChange = (id, newStatus) => {
  setAttendance((prevAttendance) =>
    prevAttendance.map((record) =>
      record.id === id
        ? { ...record, status: newStatus }
        : record
    )
  );
};

const saveAttendanceChanges = async () => {
  try {
    const token = localStorage.getItem("access");

    await Promise.all(
      attendance.map((record) =>
        axios.put(
          `http://127.0.0.1:8000/api/attendance/update/${record.id}/`,
          {
            status: record.status,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      )
    );

    alert("Attendance updated successfully!");

    loadAttendance();

  } catch (error) {
    console.error(error);
    alert("Failed to update attendance.");
  }
};
  return (
    <div className="staff-container">
      <h1 className="staff-title">Update Attendance</h1>
      
      <div className="form-row">
        <label>Subject: </label>

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <option value="">Select Subject</option>
          {subjects.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Date: </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>


      <button  
        className="primary-btn"
        onClick={loadAttendance}
      >
        Load Attendance
      </button>

      <table className="staff-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {attendance.map((record) => (
            <tr key={record.id}>
              <td>{record.student_name}</td>
              <td>
                <select
                  value={record.status}
                  onChange={(e) => handleStatusChange(record.id, e.target.value)}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button 
        className="success-btn"
        onClick={saveAttendanceChanges}
        >
        Save Changes
      </button>

    </div>
  );
}

export default UpdateAttendancePage;