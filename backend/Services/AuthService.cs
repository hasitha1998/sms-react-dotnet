// ============================================================
// Services/AuthService.cs
// Handles login, password hashing, and JWT token generation
// ============================================================

using Dapper;
using Npgsql;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public class AuthService
{
    private readonly string _conn;
    private readonly IConfiguration _config;

    public AuthService(IConfiguration config)
    {
        _config = config;
        _conn = config.GetConnectionString("DefaultConnection")!;
    }

    // ============================================================
    // REGISTER — create a new admin user
    // Passwords are ALWAYS hashed with BCrypt before storing
    // NEVER store plain text passwords
    // ============================================================
    public async Task RegisterAsync(string username, string plainPassword)
    {
        // BCrypt.HashPassword creates a one-way hash (cannot be reversed)
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(plainPassword);

        using var db = new NpgsqlConnection(_conn);

        // Direct insert here (no stored procedure for simplicity)
        await db.ExecuteAsync(
            "INSERT INTO users (username, password) VALUES (@username, @password)",
            new { username, password = hashedPassword }
        );
    }

    // ============================================================
    // LOGIN — verify credentials and return a JWT token
    // Returns null if username not found or password is wrong
    // ============================================================
    public async Task<string?> LoginAsync(string username, string plainPassword)
    {
        using var db = new NpgsqlConnection(_conn);

        // Find the user by username
        var user = await db.QueryFirstOrDefaultAsync<User>(
            "SELECT * FROM users WHERE username = @username",
            new { username }
        );

        // User not found
        if (user == null) return null;

        // BCrypt.Verify compares plain password against stored hash
        // This is the correct way — never compare plain text to plain text
        bool isPasswordCorrect = BCrypt.Net.BCrypt.Verify(plainPassword, user.Password);
        if (!isPasswordCorrect) return null;

        // Credentials valid — generate and return a JWT token
        return GenerateJwtToken(user);
    }

    // ============================================================
    // GENERATE JWT TOKEN
    // Creates a signed token that proves the user is authenticated
    // React stores this and sends it with every protected request
    // ============================================================
    private string GenerateJwtToken(User user)
    {
        // Claims = data stored inside the token (readable by anyone with the token)
        var claims = new[]
        {
            new Claim(ClaimTypes.Name,           user.Username),
            new Claim(ClaimTypes.Role,           user.Role),
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString())
        };

        // Signing key — must match what's in appsettings.json
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer:   _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims:   claims,
            expires:  DateTime.UtcNow.AddMinutes(60),  // token expires in 1 hour
            signingCredentials: creds
        );

        // Serialize token to string format: xxxxx.yyyyy.zzzzz
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
