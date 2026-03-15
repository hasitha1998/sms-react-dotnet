// ============================================================
// Program.cs — Entry point for the ASP.NET Core application
// This file configures all services and middleware
// ============================================================

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Tell Dapper to map snake_case DB columns (first_name) to PascalCase C# properties (FirstName)
// Without this, edit form won't populate because the data fields come back as null
Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

// ============================================================
// REGISTER SERVICES (Dependency Injection)
// Services registered here can be injected into Controllers
// ============================================================

// Add controller support (scans Controllers/ folder automatically)
builder.Services.AddControllers();

// Register our custom service classes
// AddScoped = one instance per HTTP request (recommended for DB services)
builder.Services.AddScoped<StudentService>();
builder.Services.AddScoped<CourseService>();
builder.Services.AddScoped<EnrollmentService>();
builder.Services.AddScoped<AuthService>();

// ============================================================
// CORS — Cross-Origin Resource Sharing
// Without this, the browser blocks React (port 5173) from
// calling this API (port 5000) — they are on different ports
// ============================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
        policy
            .WithOrigins("http://localhost:5173")  // React dev server URL
            .AllowAnyHeader()
            .AllowAnyMethod()
    );
});

// ============================================================
// JWT AUTHENTICATION
// Configures how tokens are validated on protected endpoints
// ============================================================
var jwtKey = builder.Configuration["Jwt:Key"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,    // reject expired tokens
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// Swagger — generates interactive API docs at /swagger
// Remove these two lines in production if you don't want docs exposed
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ============================================================
// BUILD THE APP
// ============================================================
var app = builder.Build();

// ============================================================
// MIDDLEWARE PIPELINE
// Middleware runs in order — sequence matters!
// ============================================================

// Swagger UI — visit http://localhost:5000/swagger to test API manually
app.UseSwagger();
app.UseSwaggerUI();

// Apply CORS policy (must be BEFORE UseAuthentication and MapControllers)
app.UseCors("AllowReact");

// Enable JWT authentication check on incoming requests
app.UseAuthentication();
app.UseAuthorization();

// Map HTTP routes to Controller action methods
app.MapControllers();

// Start the server
app.Run();