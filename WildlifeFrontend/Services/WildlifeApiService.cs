using System.Net.Http.Json;
using WildlifeFrontend.Models;

namespace WildlifeFrontend.Services;

public interface IWildlifeApiService
{
    Task<IEnumerable<Especie>?> GetEspeciesAsync();
    Task<IEnumerable<Avistamiento>?> GetAvistamientosAsync();
    Task<ChatbotResponse> SendChatMessageAsync(string message);
}

public class WildlifeApiService : IWildlifeApiService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<WildlifeApiService> _logger;
    private readonly IConfiguration _configuration;

    public WildlifeApiService(HttpClient httpClient, ILogger<WildlifeApiService> logger, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _logger = logger;
        _configuration = configuration;
        
        var baseUrl = _configuration.GetValue<string>("ApiSettings:BaseUrl");
        if (!string.IsNullOrEmpty(baseUrl))
        {
            _httpClient.BaseAddress = new Uri(baseUrl);
        }
    }

    public async Task<IEnumerable<Especie>?> GetEspeciesAsync()
    {
        try
        {
            _logger.LogInformation("Obteniendo especies desde el API...");
            return await _httpClient.GetFromJsonAsync<IEnumerable<Especie>>("Especies");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener las especies");
            return new List<Especie>();
        }
    }

    public async Task<IEnumerable<Avistamiento>?> GetAvistamientosAsync()
    {
        try
        {
            _logger.LogInformation("Obteniendo avistamientos desde el API...");
            var options = new System.Text.Json.JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            options.Converters.Add(new NetTopologySuite.IO.Converters.GeoJsonConverterFactory());
            
            return await _httpClient.GetFromJsonAsync<IEnumerable<Avistamiento>>("Avistamientos", options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener los avistamientos");
            return new List<Avistamiento>();
        }
    }

    public async Task<ChatbotResponse> SendChatMessageAsync(string message)
    {
        try
        {
            _logger.LogInformation("Enviando mensaje al chatbot...");
            var response = await _httpClient.PostAsJsonAsync("Chatbot/ask", new { Question = message });
            response.EnsureSuccessStatusCode();
            
            var result = await response.Content.ReadFromJsonAsync<ChatbotResponse>();
            return result ?? new ChatbotResponse { Answer = "Sin respuesta." };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al comunicarse con el chatbot");
            return new ChatbotResponse { Answer = "Lo siento, ocurrió un error al procesar tu solicitud." };
        }
    }
}

public class ChatbotResponse
{
    public string Answer { get; set; } = string.Empty;
    public string? AnimalName { get; set; }
    public double? Longitude { get; set; }
    public double? Latitude { get; set; }
    public string? Description { get; set; }
    public string? Biome { get; set; }
    public string? FotoUrl { get; set; }
}
