import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";
import AttendancePage from "./pages/AttendancePage";
import StaffAttendancePage from "./pages/StaffAttendancePage";
import UpdateAttendancePage from "./pages/UpdateAttendancePage";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/attendance"
          element={
            <ProtectedRoute>
              <StaffAttendancePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/update-attendance"
          element={
            <ProtectedRoute>
              <UpdateAttendancePage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
export default App;