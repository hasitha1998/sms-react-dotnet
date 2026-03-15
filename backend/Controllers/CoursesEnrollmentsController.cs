// ============================================================
// Controllers/CoursesController.cs
// Handles all HTTP requests for /api/courses
// ============================================================

using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly CourseService _service;

    public CoursesController(CourseService service)
    {
        _service = service;
    }

    // GET /api/courses — get all courses
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var courses = await _service.GetAllAsync();
        return Ok(courses);
    }

    // POST /api/courses — add a new course
    [HttpPost]
    public async Task<IActionResult> Add([FromBody] Course course)
    {
        await _service.AddAsync(course);
        return Ok(new { message = "Course added successfully" });
    }

    // DELETE /api/courses/3 — delete a course
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(new { message = "Course deleted successfully" });
    }
}


// ============================================================
// Controllers/EnrollmentsController.cs
// Handles enrollments and grades endpoints
// ============================================================

[ApiController]
[Route("api/[controller]")]
public class EnrollmentsController : ControllerBase
{
    private readonly EnrollmentService _service;

    public EnrollmentsController(EnrollmentService service)
    {
        _service = service;
    }

    // GET /api/enrollments/student/5 — get all courses for a student
    [HttpGet("student/{studentId}")]
    public async Task<IActionResult> GetStudentCourses(int studentId)
    {
        var enrollments = await _service.GetStudentCoursesAsync(studentId);
        return Ok(enrollments);
    }

    // POST /api/enrollments — enroll a student in a course
    // Body: { "studentId": 1, "courseId": 2 }
    [HttpPost]
    public async Task<IActionResult> Enroll([FromBody] EnrollRequest req)
    {
        await _service.EnrollAsync(req.StudentId, req.CourseId);
        return Ok(new { message = "Student enrolled successfully" });
    }

    // GET /api/enrollments/grades/5 — get grades for a student
    [HttpGet("grades/{studentId}")]
    public async Task<IActionResult> GetGrades(int studentId)
    {
        var grades = await _service.GetStudentGradesAsync(studentId);
        return Ok(grades);
    }

    // POST /api/enrollments/grades — assign a grade
    // Body: { "enrollmentId": 1, "grade": 85.5, "letterGrade": "A" }
    [HttpPost("grades")]
    public async Task<IActionResult> AssignGrade([FromBody] GradeRequest req)
    {
        await _service.AssignGradeAsync(req);
        return Ok(new { message = "Grade assigned successfully" });
    }
}
