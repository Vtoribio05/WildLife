using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.IO.Converters;
using WildlifeAPI.Data;
using WildlifeAPI.Services;

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
    var connectionString = builder.Configuration.GetConnectionString("PoolerConnection");

    // Si todavía no configuras tu región del Pooler, usamos la conexión directa por defecto

    if (string.IsNullOrEmpty(connectionString) || connectionString.Contains("[TU_REGION]"))
    {
        connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    }

    options.UseNpgsql(
        connectionString,
        o => o.UseNetTopologySuite());
});

// Configurar Inyección de Dependencias para Interfaz Personalizada (IA)
builder.Services.AddHttpClient<IAiChatService, AiChatService>();

var app = builder.Build();

// Forzar que la aplicación siempre se ejecute en el puerto 5085
app.Urls.Add("http://localhost:5085");

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

// Habilitar Swagger siempre (útil para que cargue aunque Visual Studio no envíe la variable de entorno 'Development')
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
