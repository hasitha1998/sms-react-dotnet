-- ============================================================
-- stored_procedures.sql — Run this AFTER schema.sql
-- Contains all stored procedures and functions
-- ============================================================
-- RULE: Use PROCEDURE (called with CALL) for INSERT/UPDATE/DELETE
--       Use FUNCTION (called with SELECT) for SELECT queries
-- ============================================================


-- ============================================================
-- STUDENTS — WRITE OPERATIONS (PROCEDURES)
-- ============================================================

-- Add a new student
CREATE OR REPLACE PROCEDURE sp_add_student(
    p_first_name    VARCHAR,    -- p_ prefix = parameter (convention)
    p_last_name     VARCHAR,
    p_email         VARCHAR,
    p_phone         VARCHAR,
    p_date_of_birth DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO students (first_name, last_name, email, phone, date_of_birth)
    VALUES (p_first_name, p_last_name, p_email, p_phone, p_date_of_birth);
END;
$$;
-- Test: CALL sp_add_student('Nimal', 'Gunasena', 'nimal@email.com', '0770001111', '2002-01-01');

-- Update an existing student
CREATE OR REPLACE PROCEDURE sp_update_student(
    p_student_id    INT,
    p_first_name    VARCHAR,
    p_last_name     VARCHAR,
    p_email         VARCHAR,
    p_phone         VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE students
    SET
        first_name = p_first_name,
        last_name  = p_last_name,
        email      = p_email,
        phone      = p_phone
    WHERE student_id = p_student_id;
    -- WARNING: Always check WHERE clause — without it, ALL rows update
END;
$$;

-- Delete a student (CASCADE removes their enrollments + grades automatically)
CREATE OR REPLACE PROCEDURE sp_delete_student(
    p_student_id INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM students
    WHERE student_id = p_student_id;
END;
$$;


-- ============================================================
-- STUDENTS — READ OPERATIONS (FUNCTIONS)
-- ============================================================

-- Get all students
CREATE OR REPLACE FUNCTION fn_get_all_students()
RETURNS TABLE(
    student_id   INT,
    first_name   VARCHAR,
    last_name    VARCHAR,
    email        VARCHAR,
    phone        VARCHAR,
    date_of_birth DATE,
    enrolled_at  TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.student_id,
        s.first_name,
        s.last_name,
        s.email,
        s.phone,
        s.date_of_birth,
        s.enrolled_at
    FROM students s
    ORDER BY s.last_name ASC;  -- sorted alphabetically
END;
$$;
-- Test: SELECT * FROM fn_get_all_students();

-- Get one student by ID
CREATE OR REPLACE FUNCTION fn_get_student_by_id(p_student_id INT)
RETURNS TABLE(
    student_id    INT,
    first_name    VARCHAR,
    last_name     VARCHAR,
    email         VARCHAR,
    phone         VARCHAR,
    date_of_birth DATE,
    enrolled_at   TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.student_id,
        s.first_name,
        s.last_name,
        s.email,
        s.phone,
        s.date_of_birth,
        s.enrolled_at
    FROM students s
    WHERE s.student_id = p_student_id;
END;
$$;


-- ============================================================
-- COURSES — WRITE OPERATIONS
-- ============================================================

CREATE OR REPLACE PROCEDURE sp_add_course(
    p_course_code VARCHAR,
    p_course_name VARCHAR,
    p_credits     INT,
    p_description TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO courses (course_code, course_name, credits, description)
    VALUES (p_course_code, p_course_name, p_credits, p_description);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_delete_course(p_course_id INT)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM courses WHERE course_id = p_course_id;
END;
$$;


-- ============================================================
-- COURSES — READ OPERATIONS
-- ============================================================

CREATE OR REPLACE FUNCTION fn_get_all_courses()
RETURNS TABLE(
    course_id   INT,
    course_code VARCHAR,
    course_name VARCHAR,
    credits     INT,
    description TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT c.course_id, c.course_code, c.course_name, c.credits, c.description
    FROM courses c
    ORDER BY c.course_code ASC;
END;
$$;


-- ============================================================
-- ENROLLMENTS
-- ============================================================

-- Enroll a student in a course
CREATE OR REPLACE PROCEDURE sp_enroll_student(
    p_student_id INT,
    p_course_id  INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- The UNIQUE constraint on enrollments table prevents duplicates automatically
    INSERT INTO enrollments (student_id, course_id)
    VALUES (p_student_id, p_course_id);
END;
$$;

-- Get all courses a specific student is enrolled in (with JOIN)
CREATE OR REPLACE FUNCTION fn_get_student_courses(p_student_id INT)
RETURNS TABLE(
    enrollment_id INT,
    course_id     INT,
    course_code   VARCHAR,
    course_name   VARCHAR,
    credits       INT,
    enrolled_date DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.enrollment_id,
        c.course_id,
        c.course_code,
        c.course_name,
        c.credits,
        e.enrolled_date
    FROM enrollments e
    JOIN courses c ON e.course_id = c.course_id   -- JOIN links enrollments to courses
    WHERE e.student_id = p_student_id
    ORDER BY c.course_code ASC;
END;
$$;


-- ============================================================
-- GRADES
-- ============================================================

-- Assign a grade to an enrollment
CREATE OR REPLACE PROCEDURE sp_assign_grade(
    p_enrollment_id INT,
    p_grade         NUMERIC,
    p_letter_grade  CHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- INSERT or UPDATE (upsert) — one grade per enrollment
    INSERT INTO grades (enrollment_id, grade, letter_grade)
    VALUES (p_enrollment_id, p_grade, p_letter_grade)
    ON CONFLICT (enrollment_id)
    DO UPDATE SET grade = p_grade, letter_grade = p_letter_grade, graded_at = NOW();
END;
$$;

-- Get all grades for a student
CREATE OR REPLACE FUNCTION fn_get_student_grades(p_student_id INT)
RETURNS TABLE(
    course_name   VARCHAR,
    course_code   VARCHAR,
    grade         NUMERIC,
    letter_grade  CHAR,
    graded_at     TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.course_name,
        c.course_code,
        g.grade,
        g.letter_grade,
        g.graded_at
    FROM grades g
    JOIN enrollments e ON g.enrollment_id = e.enrollment_id
    JOIN courses c     ON e.course_id = c.course_id
    WHERE e.student_id = p_student_id
    ORDER BY c.course_code ASC;
END;
$$;
