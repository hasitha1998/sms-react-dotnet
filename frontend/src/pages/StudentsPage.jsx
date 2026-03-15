// ============================================================
// src/pages/StudentsPage.jsx
// Full CRUD for students: list, add, edit, delete
// ============================================================

import { useState, useEffect } from 'react'
import { getAllStudents, addStudent, updateStudent, deleteStudent } from '../services/api'

// ============================================================
// EMPTY FORM STATE — used to reset the form after submit
// ============================================================
const emptyForm = {
  firstName:   '',
  lastName:    '',
  email:       '',
  phone:       '',
  dateOfBirth: ''
}

function StudentsPage() {
  // ============================================================
  // STATE
  // ============================================================
  const [students, setStudents] = useState([])      // list of all students
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)  // null = add mode, number = edit mode
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [showForm, setShowForm] = useState(false)   // toggle form visibility

  // ============================================================
  // LOAD STUDENTS ON PAGE MOUNT
  // useEffect with [] runs once when the component first appears
  // ============================================================
  useEffect(() => {
    fetchStudents()
  }, [])  // [] = dependency array — empty means run once only

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await getAllStudents()
      setStudents(res.data)  // res.data = the JSON array from ASP.NET
    } catch (err) {
      setError('Failed to load students.')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // HANDLE FORM INPUT CHANGES
  // One handler for all inputs — uses input's name attribute
  // ============================================================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // ============================================================
  // HANDLE FORM SUBMIT — add or update depending on editingId
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (editingId) {
        // Edit mode — PUT /api/students/{id}
        await updateStudent(editingId, formData)
      } else {
        // Add mode — POST /api/students
        await addStudent(formData)
      }
      // Reset form and refresh list
      setFormData(emptyForm)
      setEditingId(null)
      setShowForm(false)
      fetchStudents()  // reload the list to show new/updated student
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    }
  }

  // ============================================================
  // START EDITING — populate form with selected student's data
  // ============================================================
  const handleEdit = (student) => {
    setEditingId(student.studentId)
    setFormData({
      firstName:   student.firstName,
      lastName:    student.lastName,
      email:       student.email,
      phone:       student.phone || '',
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.substring(0, 10) : ''
      // .substring(0, 10) strips time from ISO date string: 2000-05-15T00:00:00 → 2000-05-15
    })
    setShowForm(true)
  }

  // ============================================================
  // DELETE — confirm then call API
  // ============================================================
  const handleDelete = async (id) => {
    // window.confirm shows a browser dialog — user must confirm
    if (!window.confirm('Delete this student? This also removes their enrollments and grades.')) return

    try {
      await deleteStudent(id)
      fetchStudents()  // refresh list after delete
    } catch (err) {
      setError('Delete failed.')
    }
  }

  const handleCancel = () => {
    setFormData(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div>
      <div style={styles.header}>
        <h1>Students</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? 'Cancel' : '+ Add Student'}
        </button>
      </div>

      {/* Error message */}
      {error && <p style={styles.error}>{error}</p>}

      {/* ============================================================
          ADD / EDIT FORM
          Only visible when showForm is true
          ============================================================ */}
      {showForm && (
        <div style={styles.formCard}>
          <h3>{editingId ? 'Edit Student' : 'Add New Student'}</h3>
          <form onSubmit={handleSubmit} style={styles.form}>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>First Name *</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Last Name *</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0771234567"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={{ ...styles.field, maxWidth: '240px' }}>
              <label style={styles.label}>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formActions}>
              <button type="submit" style={styles.saveBtn}>
                {editingId ? 'Update Student' : 'Add Student'}
              </button>
              <button type="button" onClick={handleCancel} style={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================
          STUDENTS TABLE
          ============================================================ */}
      {loading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        <p style={styles.empty}>No students found. Add one above.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Enrolled</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* .map() loops over the array — key must be unique (studentId) */}
            {students.map((s) => (
              <tr key={s.studentId} style={styles.tr}>
                <td style={styles.td}>{s.studentId}</td>
                <td style={styles.td}>{s.firstName} {s.lastName}</td>
                <td style={styles.td}>{s.email}</td>
                <td style={styles.td}>{s.phone || '—'}</td>
                <td style={styles.td}>
                  {/* Format date nicely for display */}
                  {new Date(s.enrolledAt).toLocaleDateString()}
                </td>
                <td style={styles.td}>
                  <button onClick={() => handleEdit(s)} style={styles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(s.studentId)} style={styles.deleteBtn}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ============================================================
// STYLES
// ============================================================
const styles = {
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  addBtn:      { background: '#27ae60', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  formCard:    { background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', padding: '24px', marginBottom: '24px' },
  form:        {},
  row:         { display: 'flex', gap: '16px', marginBottom: '12px' },
  field:       { flex: 1 },
  label:       { display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px', color: '#555' },
  input:       { width: '100%', padding: '9px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
  formActions: { display: 'flex', gap: '12px', marginTop: '16px' },
  saveBtn:     { background: '#1e3a5f', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer' },
  cancelBtn:   { background: '#95a5a6', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer' },
  table:       { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  thead:       { background: '#1e3a5f', color: '#fff' },
  th:          { padding: '12px 16px', textAlign: 'left', fontSize: '13px' },
  tr:          { borderBottom: '1px solid #eee' },
  td:          { padding: '12px 16px', fontSize: '14px' },
  editBtn:     { background: '#2980b9', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '8px', fontSize: '12px' },
  deleteBtn:   { background: '#e74c3c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  error:       { background: '#fdecea', color: '#c0392b', padding: '10px', borderRadius: '4px', marginBottom: '16px' },
  empty:       { color: '#888', textAlign: 'center', padding: '40px' }
}

export default StudentsPage
