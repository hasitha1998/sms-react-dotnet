// ============================================================
// Controllers/StudentsController.cs
// Handles all HTTP requests for /api/students
// Each method = one API endpoint
// ============================================================

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

// [ApiController] — enables automatic model validation + JSON binding
// [Route] — sets the base URL for this controller: /api/students
[ApiController]
[Route("api/[controller]")]
// [Authorize] — uncomment this to require JWT login for all endpoints
// [Authorize]
public class StudentsController : ControllerBase
{
    // StudentService is injected by ASP.NET Core (registered in Program.cs)
    private readonly StudentService _service;

    public StudentsController(StudentService service)
    {
        _service = service;
    }

    // ============================================================
    // GET /api/students
    // Returns all students as a JSON array
    // ============================================================
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var students = await _service.GetAllAsync();
        return Ok(students);  // 200 OK with JSON body
    }

    // ============================================================
    // GET /api/students/5
    // Returns one student by ID, or 404 if not found
    // ============================================================
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var student = await _service.GetByIdAsync(id);

        if (student == null)
            return NotFound(new { message = $"Student with ID {id} not found" });  // 404

        return Ok(student);  // 200 OK
    }

    // ============================================================
    // POST /api/students
    // Adds a new student
    // [FromBody] reads the JSON body from the request
    // ============================================================
    [HttpPost]
    public async Task<IActionResult> Add([FromBody] Student student)
    {
        // ModelState.IsValid checks if required fields are present
        if (!ModelState.IsValid)
            return BadRequest(ModelState);  // 400 Bad Request

        await _service.AddAsync(student);
        return Ok(new { message = "Student added successfully" });  // 200 OK
    }

    // ============================================================
    // PUT /api/students/5
    // Updates an existing student
    // ============================================================
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Student student)
    {
        // Ensure the ID in the URL matches the body
        student.StudentId = id;

        await _service.UpdateAsync(student);
        return Ok(new { message = "Student updated successfully" });
    }

    // ============================================================
    // DELETE /api/students/5
    // Deletes a student (cascade removes their enrollments/grades)
    // ============================================================
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(new { message = "Student deleted successfully" });  // 200 OK
    }
}
