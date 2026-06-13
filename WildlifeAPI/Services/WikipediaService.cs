using System.Text.Json;

namespace WildlifeAPI.Services
{
    public interface IWikipediaService
    {
        Task<(string? ImageUrl, string? Description)> GetAnimalInfoAsync(string animalName);
        Task<string?> GetImageUrlAsync(string animalName); // Keep for backward compatibility
    }

    public class WikipediaService : IWikipediaService
    {
        private readonly HttpClient _httpClient;

        public WikipediaService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            // Set User-Agent as required by Wikipedia API
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "WildlifeApp/1.0 (arturo@example.com)");
        }

        public async Task<string?> GetImageUrlAsync(string animalName)
        {
            var info = await GetAnimalInfoAsync(animalName);
            return info.ImageUrl;
        }

        public async Task<(string? ImageUrl, string? Description)> GetAnimalInfoAsync(string animalName)
        {
            if (animalName.Equals("Orangután", StringComparison.OrdinalIgnoreCase))
            {
                animalName = "Pongo abelii"; // Usa el nombre científico para evitar una foto histórica en Wikipedia
            }

            var query = Uri.EscapeDataString(animalName.ToLower());
            
            // Intento 1: Wikipedia en Español (Búsqueda en texto en lugar de título exacto)
            var urlEs = $"https://es.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={query}&gsrlimit=1&prop=pageimages|extracts&format=json&piprop=original&exintro=1&explaintext=1";
            var resultEs = await FetchInfoFromUrl(urlEs);
            if (resultEs.ImageUrl != null || resultEs.Description != null) return resultEs;

            // Intento 2: Wikipedia en Inglés
            var urlEn = $"https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={query}&gsrlimit=1&prop=pageimages|extracts&format=json&piprop=original&exintro=1&explaintext=1";
            return await FetchInfoFromUrl(urlEn);
        }

        private async Task<(string? ImageUrl, string? Description)> FetchInfoFromUrl(string url)
        {
            string? imageUrl = null;
            string? description = null;

            try
            {
                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode) return (null, null);

                var jsonResponse = await response.Content.ReadAsStringAsync();
                using var document = JsonDocument.Parse(jsonResponse);

                if (!document.RootElement.TryGetProperty("query", out var queryElement) || 
                    !queryElement.TryGetProperty("pages", out var pages))
                {
                    return (null, null);
                }
                
                foreach (var page in pages.EnumerateObject())
                {
                    if (page.Name == "-1") continue;

                    if (page.Value.TryGetProperty("original", out var originalElement))
                    {
                        if (originalElement.TryGetProperty("source", out var sourceElement))
                        {
                            imageUrl = sourceElement.GetString();
                        }
                    }

                    if (page.Value.TryGetProperty("extract", out var extractElement))
                    {
                        description = extractElement.GetString();
                        // Truncate if too long (e.g. max 400 characters)
                        if (!string.IsNullOrEmpty(description) && description.Length > 400)
                        {
                            description = description.Substring(0, 397) + "...";
                        }
                    }

                    // First valid page is all we need
                    break;
                }
            }
            catch
            {
                // Ignorar errores
            }

            return (imageUrl, description);
        }
    }
}
