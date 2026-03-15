// ============================================================
// src/pages/LoginPage.jsx
// Login form — sends credentials to /api/auth/login
// On success, stores JWT token in localStorage and redirects
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'

function LoginPage() {
  // Form state — controlled inputs
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError]       = useState('')      // error message to show user
  const [loading, setLoading]   = useState(false)   // disable button while loading

  // useNavigate gives us a function to redirect programmatically
  const navigate = useNavigate()

  // Runs every time a form input changes
  // e.target.name matches the input's name attribute
  // e.target.value is what the user typed
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // ...formData spreads existing values, then overrides the changed one
  }

  const handleSubmit = async (e) => {
    e.preventDefault()  // stop browser from refreshing the page

    setLoading(true)
    setError('')  // clear previous errors

    try {
      // Call POST /api/auth/login
      const res = await login(formData)

      // Store JWT token — all future API calls will send this in the header
      localStorage.setItem('token', res.data.token)

      // Redirect to students page after successful login
      navigate('/students')
    } catch (err) {
      // Show the error message returned by ASP.NET Core
      setError(err.response?.data?.message || 'Login failed. Check credentials.')
    } finally {
      setLoading(false)  // re-enable button regardless of success/fail
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>📚 Student MS Login</h2>

        {/* Show error if login failed */}
        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              name="username"               // must match handleChange logic
              value={formData.username}     // controlled — React owns the value
              onChange={handleChange}
              placeholder="Enter username"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              style={styles.input}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.hint}>
          Default: register an admin via POST /api/auth/register first
        </p>
      </div>
    </div>
  )
}

const styles = {
  wrapper: { display: 'flex', justifyContent: 'center', marginTop: '80px' },
  card:    { background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: '360px' },
  title:   { textAlign: 'center', marginBottom: '24px', color: '#1e3a5f' },
  field:   { marginBottom: '16px' },
  label:   { display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#555' },
  input:   { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' },
  btn:     { width: '100%', padding: '12px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', marginTop: '8px' },
  error:   { background: '#fdecea', color: '#c0392b', padding: '10px', borderRadius: '4px', marginBottom: '16px' },
  hint:    { marginTop: '16px', fontSize: '12px', color: '#888', textAlign: 'center' }
}

export default LoginPage
