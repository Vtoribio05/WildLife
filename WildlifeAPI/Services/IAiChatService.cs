namespace WildlifeAPI.Services
{
    public interface IAiChatService
    {
        Task<string> ProcessQuestionAsync(string question);
    }
}
