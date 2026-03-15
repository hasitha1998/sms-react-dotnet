// ============================================================
// Controllers/AuthController.cs
// Handles login and registration endpoints
// ============================================================

using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _service;

    public AuthController(AuthService service)
    {
        _service = service;
    }

    // ============================================================
    // POST /api/auth/login
    // Body: { "username": "admin", "password": "secret" }
    // Returns: { "token": "eyJhbGci..." }
    // React stores this token in localStorage and sends it with
    // every request in the Authorization header
    // ============================================================
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var token = await _service.LoginAsync(req.Username, req.Password);

        if (token == null)
            return Unauthorized(new { message = "Invalid username or password" });  // 401

        return Ok(new { token });  // 200 OK — React saves this token
    }

    // ============================================================
    // POST /api/auth/register
    // Body: { "username": "admin", "password": "secret" }
    // Creates a new admin user — protect this in production!
    // ============================================================
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] LoginRequest req)
    {
        await _service.RegisterAsync(req.Username, req.Password);
        return Ok(new { message = "User registered successfully" });
    }
}
