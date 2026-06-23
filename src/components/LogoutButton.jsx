import { useNavigate } from "react-router-dom";
import API from "../api/authApi";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await API.post(
        "logout/",
        {
          refresh: localStorage.getItem("refresh"),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }

    localStorage.clear();

    navigate("/");
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;