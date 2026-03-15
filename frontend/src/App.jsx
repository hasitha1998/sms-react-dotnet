// ============================================================
// src/App.jsx — Root component
// Sets up React Router — maps URL paths to page components
// ============================================================

import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import StudentsPage from './pages/StudentsPage'
import CoursesPage from './pages/CoursesPage'
import EnrollmentsPage from './pages/EnrollmentsPage'
import LoginPage from './pages/LoginPage'

// ============================================================
// NavBar — shown on all pages (simple navigation)
// ============================================================
function NavBar() {
  // Read token from localStorage to check if logged in
  const token = localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')  // clear the JWT token
    window.location.href = '/login'   // redirect to login
  }

  // Don't show nav bar on login page
  if (!token) return null

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>📚 Student MS</span>
      <div>
        {/* Link navigates without a full page reload */}
        <Link to="/students"    style={styles.link}>Students</Link>
        <Link to="/courses"     style={styles.link}>Courses</Link>
        <Link to="/enrollments" style={styles.link}>Enrollments</Link>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  )
}

// ============================================================
// ProtectedRoute — wraps pages that require login
// If no token found, redirect to /login
// ============================================================
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  // Navigate replaces the current URL without adding to browser history
  return token ? children : <Navigate to="/login" replace />
}

// ============================================================
// App — root component
// BrowserRouter enables URL-based routing
// Routes = the router's page registry
// Route maps a URL path to a component
// ============================================================
function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div style={styles.container}>
        <Routes>
          {/* Public route — no auth needed */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes — redirects to /login if not authenticated */}
          <Route path="/students" element={
            <ProtectedRoute><StudentsPage /></ProtectedRoute>
          } />
          <Route path="/courses" element={
            <ProtectedRoute><CoursesPage /></ProtectedRoute>
          } />
          <Route path="/enrollments" element={
            <ProtectedRoute><EnrollmentsPage /></ProtectedRoute>
          } />

          {/* Default: redirect root to /students */}
          <Route path="/" element={<Navigate to="/students" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

// Inline styles (no CSS file needed for basics)
const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#1e3a5f', color: '#fff', padding: '12px 24px'
  },
  brand:     { fontWeight: 'bold', fontSize: '18px' },
  link:      { color: '#fff', marginRight: '16px', textDecoration: 'none' },
  logoutBtn: { background: '#e74c3c', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' },
  container: { maxWidth: '1100px', margin: '24px auto', padding: '0 16px' }
}

export default App
