import { useEffect, useState } from "react";
import axios from "axios";

function StaffAttendancePage() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [attendance, setAttendance] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    fetchStudents();
    fetchSubjects();
  }, []);

  const token = localStorage.getItem("access");

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/attendance/students/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStudents(response.data);

      const initialAttendance = {};

      response.data.forEach((student) => {
        initialAttendance[student.id] = "Present";
      });

      setAttendance(initialAttendance);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSubjects = async () => {
    try {
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

  const handleAttendanceChange = (studentId, status) => {
    setAttendance({
      ...attendance,
      [studentId]: status,
    });
  };

const saveAttendance = async () => {
  if (!selectedSubject) {
    alert("Please select a subject.");
    return;
  }

  setIsSaving(true);

  try {
    for (const student of students) {
      await axios.post(
        "http://127.0.0.1:8000/api/attendance/mark/",
        {
          student: student.id,
          subject: selectedSubject,
          date: attendanceDate,
          status: attendance[student.id],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    alert("✅ Attendance saved successfully.");
  } catch (error) {
    console.error(error);

    if (error.response?.data?.error) {
      alert(error.response.data.error);
    } else {
      alert("Failed to save attendance.");
    }
  } finally {
    setIsSaving(false);
  }
};

  return (
    <div style={{ padding: "20px" }}>
      <h1>Mark Attendance</h1>

      <br />

      <label>
        <strong>Date:</strong>
      </label>

      <br />

      <input
        type="date"
        value={attendanceDate}
        onChange={(e) => setAttendanceDate(e.target.value)}
      />

      <br />
      <br />

      <label>
        <strong>Subject:</strong>
      </label>

      <br />

      <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
      >
        <option value="">Select Subject</option>

        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>

      <br />
      <br />

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Student</th>
            <th>Present</th>
            <th>Absent</th>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.username}</td>

              <td>
                <input
                  type="radio"
                  name={`attendance-${student.id}`}
                  checked={attendance[student.id] === "Present"}
                  onChange={() =>
                    handleAttendanceChange(student.id, "Present")
                  }
                />
              </td>

              <td>
                <input
                  type="radio"
                  name={`attendance-${student.id}`}
                  checked={attendance[student.id] === "Absent"}
                  onChange={() =>
                    handleAttendanceChange(student.id, "Absent")
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />

      <button 
        onClick={saveAttendance}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Attendance"}
      </button>
    </div>
  );
}

export default StaffAttendancePage;