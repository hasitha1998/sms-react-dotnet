// ============================================================
// Services/CourseService.cs
// Database logic for courses
// ============================================================

using Dapper;
using Npgsql;

public class CourseService
{
    private readonly string _conn;

    public CourseService(IConfiguration config)
    {
        _conn = config.GetConnectionString("DefaultConnection")!;
    }

    // GET ALL — calls fn_get_all_courses()
    public async Task<IEnumerable<Course>> GetAllAsync()
    {
        using var db = new NpgsqlConnection(_conn);
        return await db.QueryAsync<Course>("SELECT * FROM fn_get_all_courses()");
    }

    // ADD — calls sp_add_course(...)
    public async Task AddAsync(Course c)
    {
        using var db = new NpgsqlConnection(_conn);
        await db.ExecuteAsync(
            "CALL sp_add_course(@p_course_code, @p_course_name, @p_credits, @p_description)",
            new
            {
                p_course_code = c.CourseCode,
                p_course_name = c.CourseName,
                p_credits     = c.Credits,
                p_description = c.Description
            }
        );
    }

    // DELETE — calls sp_delete_course(id)
    public async Task DeleteAsync(int id)
    {
        using var db = new NpgsqlConnection(_conn);
        await db.ExecuteAsync(
            "CALL sp_delete_course(@p_course_id)",
            new { p_course_id = id }
        );
    }
}


// ============================================================
// Services/EnrollmentService.cs
// Database logic for enrollments and grades
// ============================================================

public class EnrollmentService
{
    private readonly string _conn;

    public EnrollmentService(IConfiguration config)
    {
        _conn = config.GetConnectionString("DefaultConnection")!;
    }

    // GET COURSES FOR A STUDENT — calls fn_get_student_courses(id)
    public async Task<IEnumerable<Enrollment>> GetStudentCoursesAsync(int studentId)
    {
        using var db = new NpgsqlConnection(_conn);
        return await db.QueryAsync<Enrollment>(
            "SELECT * FROM fn_get_student_courses(@p_student_id)",
            new { p_student_id = studentId }
        );
    }

    // ENROLL A STUDENT — calls sp_enroll_student(...)
    public async Task EnrollAsync(int studentId, int courseId)
    {
        using var db = new NpgsqlConnection(_conn);
        await db.ExecuteAsync(
            "CALL sp_enroll_student(@p_student_id, @p_course_id)",
            new { p_student_id = studentId, p_course_id = courseId }
        );
    }

    // GET STUDENT GRADES — calls fn_get_student_grades(id)
    public async Task<IEnumerable<Grade>> GetStudentGradesAsync(int studentId)
    {
        using var db = new NpgsqlConnection(_conn);
        return await db.QueryAsync<Grade>(
            "SELECT * FROM fn_get_student_grades(@p_student_id)",
            new { p_student_id = studentId }
        );
    }

    // ASSIGN A GRADE — calls sp_assign_grade(...)
    public async Task AssignGradeAsync(GradeRequest req)
    {
        using var db = new NpgsqlConnection(_conn);
        await db.ExecuteAsync(
            "CALL sp_assign_grade(@p_enrollment_id, @p_grade, @p_letter_grade)",
            new
            {
                p_enrollment_id = req.EnrollmentId,
                p_grade         = req.Grade,
                p_letter_grade  = req.LetterGrade
            }
        );
    }
}
