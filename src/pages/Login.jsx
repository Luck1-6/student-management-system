import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css";

import API from "../api/authApi";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("login/", {
        username,
        password,
      });

      const data = response.data;

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      login(data.user);

      if (data.user.role === "student") {
        navigate("/student");
      } else if (data.user.role === "staff") {
        navigate("/staff");
      } else if (data.user.role === "admin") {
        navigate("/admin");
      }
    } catch (error) {
  console.log("FULL ERROR:", error);

  if (error.response) {
    console.log("RESPONSE:", error.response.data);
    alert(JSON.stringify(error.response.data));
  } else if (error.request) {
    alert("Request sent but no response from Django");
  } else {
    alert(error.message);
  }
}
};

return (
  <div className="login-container">

    <div className="login-card">

      <h1>Student Management System</h1>

      <p className="subtitle">
        Login to continue
      </p>

      <form onSubmit={handleLogin}>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">
          Login
        </button>

      </form>

    </div>

  </div>
);
}
export default Login;