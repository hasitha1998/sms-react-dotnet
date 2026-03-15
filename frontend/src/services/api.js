// ============================================================
// src/services/api.js
// Central axios configuration
// All API calls go through this — change baseURL in one place
// ============================================================

import axios from 'axios'

// Create axios instance with shared base URL and headers
const api = axios.create({
  baseURL: 'http://localhost:5000/api'  // ASP.NET Core backend URL
})

// ============================================================
// REQUEST INTERCEPTOR
// Runs before EVERY request — automatically attaches JWT token
// React stores the token in localStorage after login
// ============================================================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')  // get stored JWT
  if (token) {
    // Authorization header format: "Bearer <token>"
    // ASP.NET Core reads this and validates the JWT
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ============================================================
// RESPONSE INTERCEPTOR
// Runs after EVERY response
// If 401 Unauthorized, token expired — redirect to login
// ============================================================
api.interceptors.response.use(
  (response) => response,  // pass through successful responses
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'  // force re-login
    }
    return Promise.reject(error)
  }
)

export default api


// ============================================================
// src/services/studentService.js
// All API calls for students — keeps components clean
// Components call these functions, not axios directly
// ============================================================

// GET all students → GET /api/students
export const getAllStudents = () => api.get('/students')

// GET one student by ID → GET /api/students/5
export const getStudentById = (id) => api.get(`/students/${id}`)

// POST new student → POST /api/students
// data = { firstName, lastName, email, phone, dateOfBirth }
export const addStudent = (data) => api.post('/students', data)

// PUT update student → PUT /api/students/5
export const updateStudent = (id, data) => api.put(`/students/${id}`, data)

// DELETE student → DELETE /api/students/5
export const deleteStudent = (id) => api.delete(`/students/${id}`)


// ============================================================
// src/services/courseService.js
// API calls for courses
// ============================================================

export const getAllCourses = () => api.get('/courses')
export const addCourse    = (data) => api.post('/courses', data)
export const deleteCourse = (id) => api.delete(`/courses/${id}`)


// ============================================================
// src/services/enrollmentService.js
// API calls for enrollments and grades
// ============================================================

// GET courses for a specific student
export const getStudentCourses = (studentId) =>
  api.get(`/enrollments/student/${studentId}`)

// POST enroll a student
// data = { studentId, courseId }
export const enrollStudent = (data) => api.post('/enrollments', data)

// GET grades for a student
export const getStudentGrades = (studentId) =>
  api.get(`/enrollments/grades/${studentId}`)

// POST assign a grade
// data = { enrollmentId, grade, letterGrade }
export const assignGrade = (data) => api.post('/enrollments/grades', data)


// ============================================================
// src/services/authService.js
// Login and register API calls
// ============================================================

// POST login → returns { token }
export const login    = (data) => api.post('/auth/login', data)

// POST register a new user
export const register = (data) => api.post('/auth/register', data)
