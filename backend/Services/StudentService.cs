// ============================================================
// Services/StudentService.cs
// Contains all database logic for students
// Controllers call this — Service calls PostgreSQL stored procs
// ============================================================

using Dapper;      // lightweight ORM — maps SQL results to C# objects
using Npgsql;      // PostgreSQL driver for .NET
using System.Data; // needed for DbType.Date

public class StudentService
{
    private readonly string _conn;

    public StudentService(IConfiguration config)
    {
        _conn = config.GetConnectionString("DefaultConnection")!;
    }

    // GET ALL STUDENTS — calls fn_get_all_students()
    public async Task<IEnumerable<Student>> GetAllAsync()
    {
        using var db = new NpgsqlConnection(_conn);
        return await db.QueryAsync<Student>("SELECT * FROM fn_get_all_students()");
    }

    // GET ONE STUDENT BY ID — calls fn_get_student_by_id(id)
    public async Task<Student?> GetByIdAsync(int id)
    {
        using var db = new NpgsqlConnection(_conn);
        return await db.QueryFirstOrDefaultAsync<Student>(
            "SELECT * FROM fn_get_student_by_id(@p_student_id)",
            new { p_student_id = id }
        );
    }

    // ADD A NEW STUDENT — calls sp_add_student(...)
    // DbType.Date ensures date is sent correctly without time component
    public async Task AddAsync(Student s)
    {
        using var db = new NpgsqlConnection(_conn);

        var parameters = new DynamicParameters();
        parameters.Add("p_first_name", s.FirstName);
        parameters.Add("p_last_name",  s.LastName);
        parameters.Add("p_email",      s.Email);
        parameters.Add("p_phone",      s.Phone);
        // DbType.Date strips the time portion — avoids type mismatch with PostgreSQL DATE column
        parameters.Add("p_date_of_birth",
            s.DateOfBirth.HasValue ? s.DateOfBirth.Value.Date : (DateTime?)null,
            DbType.Date);

        await db.ExecuteAsync(
            "CALL sp_add_student(@p_first_name, @p_last_name, @p_email, @p_phone, @p_date_of_birth)",
            parameters
        );
    }

    // UPDATE AN EXISTING STUDENT — calls sp_update_student(...)
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

    // DELETE A STUDENT — calls sp_delete_student(id)
    // ON DELETE CASCADE removes their enrollments + grades too
    public async Task DeleteAsync(int id)
    {
        using var db = new NpgsqlConnection(_conn);
        await db.ExecuteAsync(
            "CALL sp_delete_student(@p_student_id)",
            new { p_student_id = id }
        );
    }
}