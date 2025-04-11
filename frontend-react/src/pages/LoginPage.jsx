import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import Logo from "../components/Logo";
import "../styles/auth.css";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register, error } = useAuth();
  const navigate = useNavigate();

  // Reset form error when switching between login and register
  useEffect(() => {
    setFormError("");
  }, [isLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    try {
      let success;

      if (isLogin) {
        if (!formData.email || !formData.password) {
          setFormError("Please enter both email and password");
          setLoading(false);
          return;
        }

        success = await login(formData.email, formData.password);
        if (success) {
          navigate("/dashboard");
        }
      } else {
        if (!formData.name || !formData.email || !formData.password) {
          setFormError("All fields are required");
          setLoading(false);
          return;
        }

        success = await register(formData);
        if (success) {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setFormError("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    // Reset form data when switching forms
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "student",
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-wrapper">
            <Logo size="large" />
          </div>
          <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
          <p className="auth-subtitle">
            {isLogin
              ? "Sign in to access your account"
              : "Fill in the form to create your account"}
          </p>
        </div>

        {(formError || error) && (
          <div className="error-message">{formError || error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                autoFocus={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              autoComplete="email"
              autoFocus={isLogin}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={
                isLogin ? "Enter your password" : "Create a password"
              }
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Account Type</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === "student"}
                    onChange={handleChange}
                  />
                  Student
                </label>
                <label>
                  <input
                    type="radio"
                    name="role"
                    value="teacher"
                    checked={formData.role === "teacher"}
                    onChange={handleChange}
                  />
                  Teacher
                </label>
              </div>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin
              ? "Don't have an account yet? "
              : "Already have an account? "}
            <button type="button" onClick={toggleForm} className="toggle-btn">
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
