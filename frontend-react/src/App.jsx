import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./utils/AuthContext";

// Protected route component
const ProtectedRoute = ({ element, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) return <div>Loading...</div>;

  // Not authenticated, redirect to login
  if (!user) return <Navigate to="/" replace />;

  // Check role if roles are specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <div>User Profile</div>
                </Layout>
              }
            />
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <div>Account Settings</div>
                </Layout>
              }
            />
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <div>All Notifications</div>
                </Layout>
              }
            />
          }
        />

        {/* Teacher routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <div>Teacher Dashboard</div>
                </Layout>
              }
              allowedRoles={["teacher"]}
            />
          }
        />

        <Route
          path="/courses/manage"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <div>Manage Courses</div>
                </Layout>
              }
              allowedRoles={["teacher"]}
            />
          }
        />

        <Route
          path="/questions/teacher"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <div>Teacher Questions</div>
                </Layout>
              }
              allowedRoles={["teacher"]}
            />
          }
        />

        <Route
          path="/assignments/teacher"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <div>Teacher Assignments</div>
                </Layout>
              }
              allowedRoles={["teacher"]}
            />
          }
        />

        <Route
          path="/lectures/upload"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <div>Upload Lectures</div>
                </Layout>
              }
              allowedRoles={["teacher"]}
            />
          }
        />

        <Route
          path="/announcements"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <div>Announcements</div>
                </Layout>
              }
              allowedRoles={["teacher"]}
            />
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <div>Manage Students</div>
                </Layout>
              }
              allowedRoles={["teacher"]}
            />
          }
        />

        {/* Student routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <div>Student Dashboard</div>
                </Layout>
              }
              allowedRoles={["student"]}
            />
          }
        />

        <Route
          path="/courses/student"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <div>Student Courses</div>
                </Layout>
              }
              allowedRoles={["student"]}
            />
          }
        />

        <Route
          path="/questions"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <div>Ask Questions</div>
                </Layout>
              }
              allowedRoles={["student"]}
            />
          }
        />

        <Route
          path="/assignments"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <div>Assignments</div>
                </Layout>
              }
              allowedRoles={["student"]}
            />
          }
        />

        <Route
          path="/notes"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <div>Notes</div>
                </Layout>
              }
              allowedRoles={["student"]}
            />
          }
        />

        <Route
          path="/jobs"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <div>Jobs</div>
                </Layout>
              }
              allowedRoles={["student"]}
            />
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute
              element={
                <Layout>
                  <div>Messages</div>
                </Layout>
              }
            />
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
