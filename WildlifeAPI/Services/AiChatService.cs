using System.Text.Json;
using System.Text;
using System.Net.Http.Headers;

namespace WildlifeAPI.Services
{
    public class AiChatService : IAiChatService
    {
        private readonly ILogger<AiChatService> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly IServiceScopeFactory _scopeFactory;

        public AiChatService(ILogger<AiChatService> logger, IConfiguration configuration, HttpClient httpClient, IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = httpClient;
            _scopeFactory = scopeFactory;
        }

        public async Task<string> ProcessQuestionAsync(string question)
        {
            var apiKey = _configuration["AiService:ApiKey"];
            if (string.IsNullOrEmpty(apiKey)) return "Error: API Key de IA no configurada.";
            
            _logger.LogInformation("Consultando a la IA Groq...");

            var url = "https://api.groq.com/openai/v1/chat/completions";
            
            var payload = new
            {
                model = "llama-3.3-70b-versatile",
                response_format = new { type = "json_object" },
                messages = new[]
                {
                    new { role = "system", content = "Eres un biólogo experto y un guía de parques naturales en el mundo entero. Debes responder estrictamente en formato JSON válido. Tu JSON debe tener estas propiedades exactas: 'Answer' (tu respuesta amigable al usuario), 'AnimalName' (el nombre común del animal mencionado, o null si no se menciona ninguno), 'Longitude' (un número decimal aproximado de longitud en el mundo donde habita este animal, o null), 'Latitude' (un número decimal de latitud, o null), 'Description' (una descripción breve y fascinante del animal, o null), 'Biome' (el bioma principal donde habita, ej. 'Océano', 'Sabana', 'Selva Tropical', o null)." },
                    new { role = "user", content = question }
                }
            };

            var requestMessage = new HttpRequestMessage(HttpMethod.Post, url);
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            requestMessage.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            try
            {
                var response = await _httpClient.SendAsync(requestMessage);
                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Groq Error HTTP {StatusCode}: {ErrorBody}", response.StatusCode, errorBody);
                    return "Error de Groq: " + errorBody;
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                using var document = JsonDocument.Parse(jsonResponse);
                
                var content = document.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (content != null)
                {
                    try
                    {
                        using var responseDoc = JsonDocument.Parse(content);
                        var root = responseDoc.RootElement;
                        
                        string? animalName = root.TryGetProperty("AnimalName", out var nameProp) && nameProp.ValueKind == JsonValueKind.String ? nameProp.GetString() : null;
                        double? lat = root.TryGetProperty("Latitude", out var latProp) && latProp.ValueKind == JsonValueKind.Number ? latProp.GetDouble() : null;
                        double? lng = root.TryGetProperty("Longitude", out var lngProp) && lngProp.ValueKind == JsonValueKind.Number ? lngProp.GetDouble() : null;
                        string? desc = root.TryGetProperty("Description", out var descProp) && descProp.ValueKind == JsonValueKind.String ? descProp.GetString() : null;
                        string? biome = root.TryGetProperty("Biome", out var biomeProp) && biomeProp.ValueKind == JsonValueKind.String ? biomeProp.GetString() : null;

                        if (!string.IsNullOrWhiteSpace(animalName) && lat.HasValue && lng.HasValue)
                        {
                            using var scope = _scopeFactory.CreateScope();
                            var dbContext = scope.ServiceProvider.GetRequiredService<WildlifeAPI.Data.WildlifeDbContext>();
                            var wikiService = scope.ServiceProvider.GetRequiredService<WildlifeAPI.Services.IWikipediaService>();
                            var realFotoUrl = await wikiService.GetImageUrlAsync(animalName);

                            var exists = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.AnyAsync(dbContext.Especies, e => e.NombreComun.ToLower() == animalName.ToLower());
                            if (!exists)
                            {
                                var newEspecie = new WildlifeAPI.Models.Especie
                                {
                                    NombreComun = animalName,
                                    Tipo = (biome?.ToLower().Contains("océano") == true || biome?.ToLower().Contains("mar") == true) ? "Marino" : "Terrestre",
                                    EnPeligroExtincion = false, // Asumimos falso por ahora
                                    Descripcion = desc,
                                    Bioma = biome,
                                    FotoUrl = realFotoUrl ?? $"https://loremflickr.com/320/240/{Uri.EscapeDataString(animalName)}"
                                };
                                
                                dbContext.Especies.Add(newEspecie);
                                await dbContext.SaveChangesAsync();

                                var geometryFactory = NetTopologySuite.NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
                                var newAvistamiento = new WildlifeAPI.Models.Avistamiento
                                {
                                    EspecieId = newEspecie.Id,
                                    Fecha = DateTime.UtcNow,
                                    Coordenadas = geometryFactory.CreatePoint(new NetTopologySuite.Geometries.Coordinate(lng.Value, lat.Value))
                                };
                                
                                dbContext.Avistamientos.Add(newAvistamiento);
                                await dbContext.SaveChangesAsync();
                                
                                _logger.LogInformation($"Nueva especie guardada en la BD desde la IA: {animalName}");
                            }

                            // Inject FotoUrl into the JSON so the frontend can use the Wikipedia image immediately
                            var jsonNode = System.Text.Json.Nodes.JsonNode.Parse(content) as System.Text.Json.Nodes.JsonObject;
                            if (jsonNode != null)
                            {
                                jsonNode["FotoUrl"] = realFotoUrl ?? $"https://loremflickr.com/320/240/{Uri.EscapeDataString(animalName)}";
                                content = jsonNode.ToJsonString();
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error intentando guardar la nueva especie sugerida por la IA.");
                    }
                }

                return content ?? "{}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al comunicarse con la IA Groq.");
                return "Lo siento, mi conexión con Groq falló y no pude generar la respuesta.";
            }
        }
    }
}
