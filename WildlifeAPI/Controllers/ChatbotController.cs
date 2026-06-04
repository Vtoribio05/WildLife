using Microsoft.AspNetCore.Mvc;
using WildlifeAPI.Services;

namespace WildlifeAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatbotController : ControllerBase
    {
        private readonly IAiChatService _aiChatService;
        private readonly ILogger<ChatbotController> _logger;

        public ChatbotController(IAiChatService aiChatService, ILogger<ChatbotController> logger)
        {
            _aiChatService = aiChatService;
            _logger = logger;
        }

        public class ChatRequest
        {
            public string Question { get; set; } = string.Empty;
        }

        [HttpPost("ask")]
        public async Task<ActionResult<string>> AskQuestion([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Question))
            {
                return BadRequest("La pregunta no puede estar vacía.");
            }

            _logger.LogInformation("Recibiendo pregunta para el chatbot IA.");
            var response = await _aiChatService.ProcessQuestionAsync(request.Question);
            
            return Ok(new { Answer = response });
        }
    }
}
