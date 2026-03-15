// ============================================================
// Services/StudentService.cs
// Contains all database logic for students
// Controllers call this — Service calls PostgreSQL stored procs
// ============================================================

using Dapper;      // lightweight ORM — maps SQL results to C# objects
using Npgsql;      // PostgreSQL driver for .NET

public class StudentService
{
    // Connection string loaded from appsettings.json
    private readonly string _conn;

    // IConfiguration is injected automatically by ASP.NET Core
    public StudentService(IConfiguration config)
    {
        _conn = config.GetConnectionString("DefaultConnection")!;
    }

    // ============================================================
    // GET ALL STUDENTS
    // Calls: fn_get_all_students() — PostgreSQL FUNCTION
    // Returns: list of all students ordered by last name
    // ============================================================
    public async Task<IEnumerable<Student>> GetAllAsync()
    {
        // 'using' ensures the DB connection closes automatically when done
        using var db = new NpgsqlConnection(_conn);

        // SELECT * FROM function() — functions return table results
        return await db.QueryAsync<Student>("SELECT * FROM fn_get_all_students()");
    }

    // ============================================================
    // GET ONE STUDENT BY ID
    // Calls: fn_get_student_by_id(id) — PostgreSQL FUNCTION
    // Returns: single student or null if not found
    // ============================================================
    public async Task<Student?> GetByIdAsync(int id)
    {
        using var db = new NpgsqlConnection(_conn);

        // QueryFirstOrDefaultAsync returns one result, or null if no rows
        return await db.QueryFirstOrDefaultAsync<Student>(
            "SELECT * FROM fn_get_student_by_id(@p_student_id)",
            new { p_student_id = id }  // anonymous object maps parameter names
        );
    }

    // ============================================================
    // ADD A NEW STUDENT
    // Calls: sp_add_student(...) — PostgreSQL PROCEDURE
    // ExecuteAsync is used for CALL (procedures don't return data)
    // ============================================================
    public async Task AddAsync(Student s)
    {
        using var db = new NpgsqlConnection(_conn);

        // DynamicParameters lets you add params one by one — clearer than anonymous object
        var parameters = new DynamicParameters();
        parameters.Add("p_first_name",    s.FirstName);
        parameters.Add("p_last_name",     s.LastName);
        parameters.Add("p_email",         s.Email);
        parameters.Add("p_phone",         s.Phone);
        parameters.Add("p_date_of_birth", s.DateOfBirth);

        await db.ExecuteAsync(
            "CALL sp_add_student(@p_first_name, @p_last_name, @p_email, @p_phone, @p_date_of_birth)",
            parameters
        );
    }

    // ============================================================
    // UPDATE AN EXISTING STUDENT
    // Calls: sp_update_student(...) — PostgreSQL PROCEDURE
    // ============================================================
    public async Task UpdateAsync(Student s)
    {
        using var db = new NpgsqlConnection(_conn);

        await db.ExecuteAsync(
            "CALL sp_update_student(@p_student_id, @p_first_name, @p_last_name, @p_email, @p_phone)",
            new
            {
                p_student_id = s.StudentId,
                p_first_name = s.FirstName,
                p_last_name  = s.LastName,
                p_email      = s.Email,
                p_phone      = s.Phone
            }
        );
    }

    // ============================================================
    // DELETE A STUDENT
    // Calls: sp_delete_student(id) — PostgreSQL PROCEDURE
    // ON DELETE CASCADE removes their enrollments + grades too
    // ============================================================
    public async Task DeleteAsync(int id)
    {
        using var db = new NpgsqlConnection(_conn);

        await db.ExecuteAsync(
            "CALL sp_delete_student(@p_student_id)",
            new { p_student_id = id }
        );
    }
}
