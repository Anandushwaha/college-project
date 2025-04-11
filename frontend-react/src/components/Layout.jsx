import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import Logo from "./Logo";

const Layout = ({ children }) => {
  const { user, logout, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <Link to="/dashboard">
            <Logo />
          </Link>
        </div>
        <nav className="main-nav">
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="menu-icon"></span>
          </button>
          <ul className={`nav-list ${menuOpen ? "open" : ""}`}>
            {user ? (
              <>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>

                {isTeacher && (
                  <>
                    <li>
                      <Link to="/courses/manage">Manage Courses</Link>
                    </li>
                    <li>
                      <Link to="/assignments/teacher">Assignments</Link>
                    </li>
                    <li>
                      <Link to="/questions/teacher">Questions</Link>
                    </li>
                    <li>
                      <Link to="/lectures/upload">Upload Lectures</Link>
                    </li>
                    <li>
                      <Link to="/announcements">Announcements</Link>
                    </li>
                  </>
                )}

                {isStudent && (
                  <>
                    <li>
                      <Link to="/courses/student">My Courses</Link>
                    </li>
                    <li>
                      <Link to="/assignments">Assignments</Link>
                    </li>
                    <li>
                      <Link to="/questions">Ask Questions</Link>
                    </li>
                    <li>
                      <Link to="/notes">Notes</Link>
                    </li>
                    <li>
                      <Link to="/jobs">Jobs</Link>
                    </li>
                  </>
                )}

                <li className="user-profile">
                  <span className="user-greeting">Hello, {user.name}</span>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/">Login</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>

      <main className="app-content">{children}</main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <Logo size="small" colored={false} />
          </div>
          <p className="copyright">
            &copy; {new Date().getFullYear()} EduConnect Learning Management
            System
          </p>
          <div className="footer-links">
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
