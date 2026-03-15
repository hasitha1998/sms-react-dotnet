// ============================================================
// src/pages/EnrollmentsPage.jsx
// Select a student → view their courses and grades
// Enroll in a new course or assign a grade
// ============================================================

import { useState, useEffect } from 'react'
import {
  getAllStudents,
  getAllCourses,
  getStudentCourses,
  enrollStudent,
  getStudentGrades,
  assignGrade
} from '../services/api'

function EnrollmentsPage() {
  // ============================================================
  // STATE
  // ============================================================
  const [students, setStudents]         = useState([])
  const [courses, setCourses]           = useState([])
  const [selectedStudent, setSelected]  = useState('')   // student ID string from select
  const [enrollments, setEnrollments]   = useState([])   // courses this student is in
  const [grades, setGrades]             = useState([])   // grades for this student
  const [enrollCourseId, setEnrollCourseId] = useState('')
  const [gradeForm, setGradeForm]       = useState({ enrollmentId: '', grade: '', letterGrade: '' })
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [message, setMessage]           = useState('')   // success message

  // Load students and courses once on mount (needed for dropdowns)
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [studRes, courseRes] = await Promise.all([
          // Promise.all fires both requests at the same time (faster)
          getAllStudents(),
          getAllCourses()
        ])
        setStudents(studRes.data)
        setCourses(courseRes.data)
      } catch {
        setError('Failed to load data.')
      }
    }
    loadDropdowns()
  }, [])

  // When selected student changes, load their enrollments and grades
  useEffect(() => {
    if (!selectedStudent) {
      setEnrollments([])
      setGrades([])
      return
    }
    loadStudentData(selectedStudent)
  }, [selectedStudent])  // runs whenever selectedStudent changes

  const loadStudentData = async (studentId) => {
    setLoading(true)
    setError('')
    try {
      // Load enrollments and grades in parallel
      const [enrollRes, gradeRes] = await Promise.all([
        getStudentCourses(studentId),
        getStudentGrades(studentId)
      ])
      setEnrollments(enrollRes.data)
      setGrades(gradeRes.data)
    } catch {
      setError('Failed to load student data.')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // ENROLL STUDENT IN A COURSE
  // ============================================================
  const handleEnroll = async (e) => {
    e.preventDefault()
    if (!enrollCourseId) return
    setError('')
    setMessage('')
    try {
      await enrollStudent({
        studentId: Number(selectedStudent),
        courseId:  Number(enrollCourseId)
      })
      setMessage('Student enrolled successfully!')
      setEnrollCourseId('')
      loadStudentData(selectedStudent)  // refresh enrollment list
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed. Already enrolled?')
    }
  }

  // ============================================================
  // ASSIGN A GRADE
  // ============================================================
  const handleGrade = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      await assignGrade({
        enrollmentId: Number(gradeForm.enrollmentId),
        grade:        Number(gradeForm.grade),
        letterGrade:  gradeForm.letterGrade
      })
      setMessage('Grade assigned!')
      setGradeForm({ enrollmentId: '', grade: '', letterGrade: '' })
      loadStudentData(selectedStudent)  // refresh grades
    } catch {
      setError('Failed to assign grade.')
    }
  }

  // Filter out courses the student is already enrolled in
  const availableCourses = courses.filter(
    (c) => !enrollments.some((e) => e.courseId === c.courseId)
  )

  return (
    <div>
      <h1>Enrollments & Grades</h1>

      {error   && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}

      {/* ============================================================
          STEP 1: SELECT A STUDENT
          ============================================================ */}
      <div style={styles.section}>
        <label style={styles.label}>Select Student</label>
        <select
          value={selectedStudent}
          onChange={(e) => setSelected(e.target.value)}
          style={styles.select}
        >
          <option value="">-- Choose a student --</option>
          {students.map((s) => (
            <option key={s.studentId} value={s.studentId}>
              {s.firstName} {s.lastName} — {s.email}
            </option>
          ))}
        </select>
      </div>

      {/* Only show the rest if a student is selected */}
      {selectedStudent && (
        <>
          {/* ============================================================
              STEP 2: CURRENT ENROLLMENTS
              ============================================================ */}
          <div style={styles.section}>
            <h3>Current Enrollments</h3>
            {loading ? <p>Loading...</p> : enrollments.length === 0 ? (
              <p style={styles.empty}>Not enrolled in any courses yet.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Enrollment ID</th>
                    <th style={styles.th}>Course Code</th>
                    <th style={styles.th}>Course Name</th>
                    <th style={styles.th}>Credits</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => (
                    <tr key={e.enrollmentId} style={styles.tr}>
                      <td style={styles.td}>{e.enrollmentId}</td>
                      <td style={styles.td}><strong>{e.courseCode}</strong></td>
                      <td style={styles.td}>{e.courseName}</td>
                      <td style={styles.td}>{e.credits}</td>
                      <td style={styles.td}>{new Date(e.enrolledDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ============================================================
              STEP 3: ENROLL IN A NEW COURSE
              ============================================================ */}
          <div style={styles.section}>
            <h3>Enroll in a Course</h3>
            {availableCourses.length === 0 ? (
              <p style={styles.empty}>Enrolled in all available courses.</p>
            ) : (
              <form onSubmit={handleEnroll} style={styles.inlineForm}>
                <select
                  value={enrollCourseId}
                  onChange={(e) => setEnrollCourseId(e.target.value)}
                  style={styles.select}
                  required
                >
                  <option value="">-- Select a course --</option>
                  {availableCourses.map((c) => (
                    <option key={c.courseId} value={c.courseId}>
                      {c.courseCode} — {c.courseName}
                    </option>
                  ))}
                </select>
                <button type="submit" style={styles.saveBtn}>Enroll</button>
              </form>
            )}
          </div>

          {/* ============================================================
              STEP 4: GRADES
              ============================================================ */}
          <div style={styles.section}>
            <h3>Grades</h3>
            {grades.length === 0 ? (
              <p style={styles.empty}>No grades recorded yet.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Course</th>
                    <th style={styles.th}>Code</th>
                    <th style={styles.th}>Grade</th>
                    <th style={styles.th}>Letter</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g, i) => (
                    <tr key={i} style={styles.tr}>
                      <td style={styles.td}>{g.courseName}</td>
                      <td style={styles.td}>{g.courseCode}</td>
                      <td style={styles.td}>{g.gradeValue}</td>
                      <td style={styles.td}><strong>{g.letterGrade}</strong></td>
                      <td style={styles.td}>{new Date(g.gradedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Assign Grade Form */}
            {enrollments.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4>Assign / Update Grade</h4>
                <form onSubmit={handleGrade} style={styles.inlineForm}>
                  <select
                    value={gradeForm.enrollmentId}
                    onChange={(e) => setGradeForm({ ...gradeForm, enrollmentId: e.target.value })}
                    style={styles.select}
                    required
                  >
                    <option value="">-- Select enrollment --</option>
                    {enrollments.map((e) => (
                      <option key={e.enrollmentId} value={e.enrollmentId}>
                        {e.courseCode} — {e.courseName}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number" placeholder="Grade (0-100)" min="0" max="100" step="0.01"
                    value={gradeForm.grade}
                    onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                    style={{ ...styles.select, width: '140px' }}
                    required
                  />
                  <input
                    placeholder="Letter (A, B+...)"
                    value={gradeForm.letterGrade}
                    onChange={(e) => setGradeForm({ ...gradeForm, letterGrade: e.target.value })}
                    style={{ ...styles.select, width: '120px' }}
                    required
                  />
                  <button type="submit" style={styles.saveBtn}>Save Grade</button>
                </form>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const styles = {
  section:    { background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  label:      { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#555' },
  select:     { padding: '9px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', marginRight: '12px' },
  inlineForm: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' },
  saveBtn:    { background: '#1e3a5f', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' },
  table:      { width: '100%', borderCollapse: 'collapse', marginTop: '12px' },
  thead:      { background: '#1e3a5f', color: '#fff' },
  th:         { padding: '10px 14px', textAlign: 'left', fontSize: '13px' },
  tr:         { borderBottom: '1px solid #eee' },
  td:         { padding: '10px 14px', fontSize: '14px' },
  error:      { background: '#fdecea', color: '#c0392b', padding: '10px', borderRadius: '4px', marginBottom: '16px' },
  success:    { background: '#eafaf1', color: '#1e8449', padding: '10px', borderRadius: '4px', marginBottom: '16px' },
  empty:      { color: '#888', fontStyle: 'italic' }
}

export default EnrollmentsPage
