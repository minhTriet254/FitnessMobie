import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    userName: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Tạo URL với query parameters
      const url = new URL("http://localhost:5086/Account/login");
      url.searchParams.append("UserName", formData.userName);
      url.searchParams.append("Password", formData.password);

      console.log("Login URL:", url.toString()); // Debug log

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "accept": "*/*",
        },
      });

      console.log("Login response status:", response.status); // Debug log

      if (response.ok) {
        const data = await response.json();
        console.log("Login success:", data); // Debug log
        
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
          userName: data.userName,
          email: data.email,
          role: data.role
        }));
        onLogin({
          userName: data.userName,
          email: data.email,
          role: data.role
        });
        
        if (data.role === "Admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        let errorMessage = "Invalid username or password";
        try {
          const errorData = await response.text();
          console.error("Login error:", errorData);
          if (errorData) {
            errorMessage = errorData;
          }
        } catch (e) {
          console.error("Could not parse error response");
        }
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Login failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;