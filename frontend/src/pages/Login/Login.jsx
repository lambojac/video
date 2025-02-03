import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.scss";

const Login = () => {
  const [identifier, setIdentifier] = useState(""); // Can be email or username
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard"); // Redirect logged-in users to dashboard
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    toast.dismiss();

    try {
      const response = await fetch("YOUR_LOGIN_API_ENDPOINT_HERE", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("authToken", data.token); // Store token
      toast.success("Login successful!");

      setTimeout(() => navigate("/dashboard"), 2000); // Redirect after 2 sec
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="button-on" type="submit">
            Login
          </button>
        </form>
        <p className="register-text">
          Don't have an account? <Link to="/">Sign Up</Link>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
