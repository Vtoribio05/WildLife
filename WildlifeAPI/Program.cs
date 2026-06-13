using Microsoft.EntityFrameworkCore;
using WildlifeAPI.Data;
using WildlifeAPI.Services;
using NetTopologySuite.IO.Converters;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Agregar servicios al contenedor.
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.Converters.Add(new GeoJsonConverterFactory());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configurar base de datos (PostgreSQL con NetTopologySuite)
builder.Services.AddDbContext<WildlifeDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        o => o.UseNetTopologySuite());
});

// Configurar Inyección de Dependencias para Interfaz Personalizada (IA)
builder.Services.AddHttpClient<IAiChatService, AiChatService>();
builder.Services.AddHttpClient<IWikipediaService, WikipediaService>();

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

// Configurar el pipeline de solicitudes HTTP.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
