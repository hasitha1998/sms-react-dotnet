-- ============================================================
-- schema.sql — Run this FIRST to create all tables
-- Run in pgAdmin or psql: \i schema.sql
-- ============================================================

-- Drop existing tables if re-running (order matters due to FK constraints)
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- 1. STUDENTS TABLE
-- Stores core student information
-- ============================================================
CREATE TABLE students (
    student_id   SERIAL PRIMARY KEY,
    first_name   VARCHAR(100) NOT NULL,
    last_name    VARCHAR(100) NOT NULL,
    email        VARCHAR(150) UNIQUE NOT NULL,  -- must be unique across all students
    phone        VARCHAR(20),                   -- nullable — not required
    date_of_birth DATE,
    enrolled_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- auto-set on insert
);

-- ============================================================
-- 2. COURSES TABLE
-- Stores the course catalog
-- ============================================================
CREATE TABLE courses (
    course_id    SERIAL PRIMARY KEY,
    course_code  VARCHAR(20) UNIQUE NOT NULL,   -- e.g. CS101
    course_name  VARCHAR(200) NOT NULL,
    credits      INT DEFAULT 3,
    description  TEXT
);

-- ============================================================
-- 3. ENROLLMENTS TABLE (junction table)
-- Links students to courses — one row per student+course pair
-- ============================================================
CREATE TABLE enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    student_id    INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    -- ON DELETE CASCADE: deleting a student auto-deletes their enrollments
    course_id     INT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    enrolled_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(student_id, course_id)  -- prevent a student enrolling in same course twice
);

-- ============================================================
-- 4. GRADES TABLE
-- One grade record per enrollment
-- ============================================================
CREATE TABLE grades (
    grade_id      SERIAL PRIMARY KEY,
    enrollment_id INT NOT NULL REFERENCES enrollments(enrollment_id) ON DELETE CASCADE,
    grade         NUMERIC(5,2),   -- e.g. 85.50
    letter_grade  CHAR(2),        -- e.g. 'A', 'B+'
    graded_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. USERS TABLE
-- Admin login accounts — passwords stored as bcrypt hashes
-- ============================================================
CREATE TABLE users (
    user_id   SERIAL PRIMARY KEY,
    username  VARCHAR(100) UNIQUE NOT NULL,
    password  VARCHAR(255) NOT NULL,  -- NEVER store plain text — always bcrypt
    role      VARCHAR(50) DEFAULT 'admin'
);

-- ============================================================
-- SAMPLE DATA — optional, for testing
-- ============================================================
INSERT INTO students (first_name, last_name, email, phone, date_of_birth)
VALUES
    ('Kamal',  'Perera',   'kamal@email.com',  '0771234567', '2000-05-15'),
    ('Amara',  'Silva',    'amara@email.com',  '0779876543', '2001-03-22'),
    ('Dinesh', 'Wijeya',   'dinesh@email.com', NULL,         '1999-11-10');

INSERT INTO courses (course_code, course_name, credits)
VALUES
    ('CS101', 'Introduction to Programming', 3),
    ('CS201', 'Data Structures',             3),
    ('MA101', 'Mathematics I',               4);
