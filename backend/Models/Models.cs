// ============================================================
// Models/Models.cs — C# classes that mirror database tables
// Dapper automatically maps query results to these classes
// Column name in DB maps to property name in C# (case-insensitive)
// ============================================================

// ============================================================
// STUDENT MODEL — mirrors the students table
// ============================================================
public class Student
{
    public int StudentId { get; set; }          // student_id column
    public string FirstName { get; set; } = "";  // first_name column
    public string LastName { get; set; } = "";   // last_name column
    public string Email { get; set; } = "";      // email column
    public string? Phone { get; set; }           // phone column — nullable (?)
    public DateTime? DateOfBirth { get; set; }   // date_of_birth — nullable
    public DateTime EnrolledAt { get; set; }     // enrolled_at column
}

// ============================================================
// COURSE MODEL — mirrors the courses table
// ============================================================
public class Course
{
    public int CourseId { get; set; }
    public string CourseCode { get; set; } = "";
    public string CourseName { get; set; } = "";
    public int Credits { get; set; }
    public string? Description { get; set; }
}

// ============================================================
// ENROLLMENT MODEL — mirrors the enrollments table
// ============================================================
public class Enrollment
{
    public int EnrollmentId { get; set; }
    public int StudentId { get; set; }
    public int CourseId { get; set; }
    public string CourseCode { get; set; } = "";  // from JOIN with courses
    public string CourseName { get; set; } = "";  // from JOIN with courses
    public int Credits { get; set; }              // from JOIN with courses
    public DateTime EnrolledDate { get; set; }
}

// ============================================================
// GRADE MODEL — mirrors the grades table
// ============================================================
public class Grade
{
    public string CourseName { get; set; } = "";
    public string CourseCode { get; set; } = "";
    public decimal GradeValue { get; set; }   // maps to 'grade' column
    public string LetterGrade { get; set; } = "";
    public DateTime GradedAt { get; set; }
}

// ============================================================
// USER MODEL — for authentication
// ============================================================
public class User
{
    public int UserId { get; set; }
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";  // stored as bcrypt hash in DB
    public string Role { get; set; } = "admin";
}

// ============================================================
// REQUEST MODELS — data shapes for incoming API requests
// These are what the React frontend sends as JSON
// ============================================================

// Used for POST /api/auth/login
public class LoginRequest
{
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
}

// Used for POST /api/enrollments
public class EnrollRequest
{
    public int StudentId { get; set; }
    public int CourseId { get; set; }
}

// Used for POST /api/grades
public class GradeRequest
{
    public int EnrollmentId { get; set; }
    public decimal Grade { get; set; }
    public string LetterGrade { get; set; } = "";
}
