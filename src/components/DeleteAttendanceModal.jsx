import "./DeleteAttendanceModal.css";

const DeleteAttendanceModal = ({
  isOpen,
  attendance,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !attendance) return null;

  return (
    <div className="modal-overlay">
      <div className="delete-modal">
        <h2>🗑 Delete Attendance</h2>

        <p className="delete-message">
          Are you sure you want to delete this attendance record?
        </p>

        <div className="delete-details">
          <p>
            <strong>Student:</strong> {attendance.student_name}
          </p>

          <p>
            <strong>Subject:</strong> {attendance.subject_name}
          </p>

          <p>
            <strong>Date:</strong> {attendance.date}
          </p>
        </div>

        <p className="delete-warning">
          This action cannot be undone.
        </p>

        <div className="modal-actions">
          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="delete-confirm-btn"
            onClick={() => onConfirm(attendance.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAttendanceModal;