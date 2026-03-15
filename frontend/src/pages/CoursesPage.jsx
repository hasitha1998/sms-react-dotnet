// ============================================================
// src/pages/CoursesPage.jsx
// List, add, and delete courses
// ============================================================

import { useState, useEffect } from 'react'
import { getAllCourses, addCourse, deleteCourse } from '../services/api'

const emptyForm = { courseCode: '', courseName: '', credits: 3, description: '' }

function CoursesPage() {
  const [courses, setCourses]   = useState([])
  const [formData, setFormData] = useState(emptyForm)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [showForm, setShowForm] = useState(false)

  // Load courses when page first renders
  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const res = await getAllCourses()
      setCourses(res.data)
    } catch {
      setError('Failed to load courses.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await addCourse({ ...formData, credits: Number(formData.credits) })
      // Number() converts the string from the input to an integer
      setFormData(emptyForm)
      setShowForm(false)
      fetchCourses()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add course.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course? Enrolled students will be unenrolled.')) return
    try {
      await deleteCourse(id)
      fetchCourses()
    } catch {
      setError('Delete failed.')
    }
  }

  return (
    <div>
      <div style={styles.header}>
        <h1>Courses</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? 'Cancel' : '+ Add Course'}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {/* ADD FORM */}
      {showForm && (
        <div style={styles.formCard}>
          <h3>Add New Course</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Course Code *</label>
                <input name="courseCode" value={formData.courseCode}
                  onChange={handleChange} placeholder="e.g. CS101"
                  style={styles.input} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Course Name *</label>
                <input name="courseName" value={formData.courseName}
                  onChange={handleChange} placeholder="Introduction to Programming"
                  style={styles.input} required />
              </div>
              <div style={{ ...styles.field, maxWidth: '100px' }}>
                <label style={styles.label}>Credits</label>
                <input type="number" name="credits" value={formData.credits}
                  onChange={handleChange} min="1" max="6"
                  style={styles.input} />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea name="description" value={formData.description}
                onChange={handleChange} placeholder="Optional description..."
                style={{ ...styles.input, height: '80px', resize: 'vertical' }} />
            </div>
            <button type="submit" style={styles.saveBtn}>Add Course</button>
          </form>
        </div>
      )}

      {/* COURSES TABLE */}
      {loading ? <p>Loading...</p> : courses.length === 0 ? (
        <p style={styles.empty}>No courses yet. Add one above.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Code</th>
              <th style={styles.th}>Course Name</th>
              <th style={styles.th}>Credits</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.courseId} style={styles.tr}>
                <td style={styles.td}><strong>{c.courseCode}</strong></td>
                <td style={styles.td}>{c.courseName}</td>
                <td style={styles.td}>{c.credits}</td>
                <td style={styles.td}>{c.description || '—'}</td>
                <td style={styles.td}>
                  <button onClick={() => handleDelete(c.courseId)} style={styles.deleteBtn}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const styles = {
  header:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  addBtn:   { background: '#27ae60', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' },
  formCard: { background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', padding: '24px', marginBottom: '24px' },
  row:      { display: 'flex', gap: '16px', marginBottom: '12px' },
  field:    { flex: 1, marginBottom: '12px' },
  label:    { display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px', color: '#555' },
  input:    { width: '100%', padding: '9px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
  saveBtn:  { background: '#1e3a5f', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer' },
  table:    { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  thead:    { background: '#1e3a5f', color: '#fff' },
  th:       { padding: '12px 16px', textAlign: 'left', fontSize: '13px' },
  tr:       { borderBottom: '1px solid #eee' },
  td:       { padding: '12px 16px', fontSize: '14px' },
  deleteBtn:{ background: '#e74c3c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  error:    { background: '#fdecea', color: '#c0392b', padding: '10px', borderRadius: '4px', marginBottom: '16px' },
  empty:    { color: '#888', textAlign: 'center', padding: '40px' }
}

export default CoursesPage
