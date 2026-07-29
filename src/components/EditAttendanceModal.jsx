import { useEffect, useState } from "react";

const EditAttendanceModal = ({
  isOpen,
  attendance,
  subjects,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    date: "",
    subject: "",
    status: "",
  });

  useEffect(() => {
    if (attendance) {
      setFormData({
        date: attendance.date,
        subject: attendance.subject_id,
        status: attendance.status,
      });
    }
  }, [attendance]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    onSave(attendance.id, formData);
  };

  return (
    <div className="modal-overlay">
      <div className="edit-modal">

        <h2>✏️ Edit Attendance</h2>

        <div className="form-group">
          <label>Student</label>
          <input
            value={attendance.student_name}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Subject</label>

          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
          >
            {subjects.map((subject) => (
              <option
                key={subject.id}
                value={subject.id}
              >
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Status</label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        <div className="modal-actions">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="save-btn"
            onClick={handleSubmit}
          >
            Save
          </button>

        </div>

      </div>
    </div>
  );
};

export default EditAttendanceModal;