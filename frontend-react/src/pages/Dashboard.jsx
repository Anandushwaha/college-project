import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import Logo from "../components/Logo";
import "../styles/dashboard.css";

const Dashboard = () => {
  const { user, logout, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // For demonstration purposes
  const notifications = [
    {
      id: 1,
      message: "New assignment posted in Math class",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      message: "Your question was answered",
      time: "5 hours ago",
      unread: true,
    },
    {
      id: 3,
      message: "Course enrollment request approved",
      time: "Yesterday",
      unread: false,
    },
  ];

  const teacherActions = [
    {
      title: "Manage Courses",
      icon: "📚",
      link: "/courses/manage",
      description: "Create and manage your courses",
    },
    {
      title: "Assignments",
      icon: "📝",
      link: "/assignments/teacher",
      description: "Create and grade assignments",
    },
    {
      title: "Answer Questions",
      icon: "❓",
      link: "/questions/teacher",
      description: "Answer student questions",
    },
    {
      title: "Upload Lectures",
      icon: "🎬",
      link: "/lectures/upload",
      description: "Upload video lectures",
    },
    {
      title: "Announcements",
      icon: "📢",
      link: "/announcements",
      description: "Make announcements for your classes",
    },
    {
      title: "Students",
      icon: "👥",
      link: "/students",
      description: "View and manage student enrollments",
    },
  ];

  const studentActions = [
    {
      title: "My Courses",
      icon: "📚",
      link: "/courses/student",
      description: "Browse and enroll in courses",
    },
    {
      title: "Assignments",
      icon: "📝",
      link: "/assignments",
      description: "View and submit assignments",
    },
    {
      title: "Ask Questions",
      icon: "❓",
      link: "/questions",
      description: "Ask questions to your teachers",
    },
    {
      title: "Notes",
      icon: "📓",
      link: "/notes",
      description: "Access lecture notes and resources",
    },
    {
      title: "Jobs",
      icon: "💼",
      link: "/jobs",
      description: "Browse job opportunities",
    },
    {
      title: "Messages",
      icon: "💬",
      link: "/messages",
      description: "Send and receive messages",
    },
  ];

  const actions = isTeacher ? teacherActions : studentActions;

  const sidebarItems = [
    { icon: "🏠", text: "Dashboard", link: "/dashboard" },
    ...actions.map((action) => ({
      icon: action.icon,
      text: action.title,
      link: action.link,
    })),
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="dashboard-layout">
      {/* Top Navigation Bar */}
      <header className="top-navbar">
        <div className="navbar-left">
          <button
            className={`sidebar-toggle ${sidebarOpen ? "active" : ""}`}
            onClick={toggleSidebar}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="navbar-logo">
            <Logo size="small" />
          </div>
        </div>

        <div className="navbar-right">
          <div className="notification-container">
            <button className="notification-icon" onClick={toggleNotifications}>
              🔔
              <span className="notification-badge">
                {notifications.filter((n) => n.unread).length}
              </span>
            </button>

            {notificationsOpen && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <button className="mark-all-read">Mark all read</button>
                </div>
                <div className="notification-list">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${
                          notification.unread ? "unread" : ""
                        }`}
                      >
                        <p className="notification-message">
                          {notification.message}
                        </p>
                        <span className="notification-time">
                          {notification.time}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="no-notifications">No notifications</p>
                  )}
                </div>
                <div className="notification-footer">
                  <Link to="/notifications">View all notifications</Link>
                </div>
              </div>
            )}
          </div>

          <div className="user-menu">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="username">{user?.name || "User"}</span>
            <div className="dropdown-menu">
              <Link to="/profile">My Profile</Link>
              <Link to="/settings">Settings</Link>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      </header>

      {/* Vertical Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-content">
          <div className="user-info">
            <div className="user-avatar large">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="user-details">
              <h3>{user?.name || "User"}</h3>
              <p>{user?.role || "Student"}</p>
            </div>
          </div>

          <nav className="sidebar-menu">
            <ul>
              {sidebarItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.link}
                    className={
                      window.location.pathname === item.link ? "active" : ""
                    }
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span className="sidebar-text">{item.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`main-content ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="welcome-section">
          <h1>Welcome, {user?.name || "User"}!</h1>
          <p>
            Here's what you can do on the {isTeacher ? "Teacher" : "Student"}{" "}
            Dashboard
          </p>
        </div>

        <div className="tabs-container">
          <div className="action-cards">
            {actions.map((action, index) => (
              <div
                className="action-card"
                key={index}
                onClick={() => navigate(action.link)}
              >
                <div className="action-icon">{action.icon}</div>
                <h3>{action.title}</h3>
                <p>{action.description}</p>
                <Link to={action.link} className="action-link">
                  Go to {action.title} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
