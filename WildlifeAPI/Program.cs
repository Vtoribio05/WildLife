using Microsoft.EntityFrameworkCore;
using WildlifeAPI.Data;
using WildlifeAPI.Services;
using NetTopologySuite.IO.Converters;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.Converters.Add(new GeoJsonConverterFactory());
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Database (PostgreSQL with NetTopologySuite)
builder.Services.AddDbContext<WildlifeDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        o => o.UseNetTopologySuite());
});

// Configure Dependency Injection for Custom Interface (AI)
builder.Services.AddHttpClient<IAiChatService, AiChatService>();

var app = builder.Build();

// Ejecutar el Data Seeder para llenar la base de datos si está vacía
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        await DataSeeder.InitializeAsync(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocurrió un error al sembrar la base de datos automáticamente.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
