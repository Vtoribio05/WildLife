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

        public AiChatService(ILogger<AiChatService> logger, IConfiguration configuration, HttpClient httpClient)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = httpClient;
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
                messages = new[]
                {
                    new { role = "system", content = "Eres un biólogo experto y un guía de parques naturales. Responde de forma breve y amigable." },
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
                
                var answer = document.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                return answer ?? "No pude generar una respuesta.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al comunicarse con la IA Groq.");
                return "Lo siento, mi conexión con Groq falló y no pude generar la respuesta.";
            }
        }
    }
}
