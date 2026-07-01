using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.Geometries;
using WildlifeAPI.Models;

using System.Text.Json;

namespace WildlifeAPI.Data
{
    public static class DataSeeder
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            using var context = new WildlifeDbContext(
                serviceProvider.GetRequiredService<DbContextOptions<WildlifeDbContext>>());

            var especiesExistentes = await context.Especies.ToListAsync();
            var wikiService = serviceProvider.GetRequiredService<WildlifeAPI.Services.IWikipediaService>();
            var configuration = serviceProvider.GetRequiredService<IConfiguration>();
            
            // Backfill new properties for existing species
            bool hasUpdates = false;
            foreach(var e in especiesExistentes)
            {
                if(string.IsNullOrEmpty(e.Descripcion) || e.Descripcion.Contains("asombrosa") || (e.FotoUrl != null && e.FotoUrl.Contains("loremflickr")))
                {
                    var wikiInfo = await wikiService.GetAnimalInfoAsync(e.NombreComun);
                    e.Descripcion = !string.IsNullOrEmpty(wikiInfo.Description) ? wikiInfo.Description : $"El {e.NombreComun} es una especie asombrosa de nuestro planeta.";
                    e.Bioma = e.Tipo == "Marino" ? "Océano" : "Terrestre / Bosque";
                    e.FotoUrl = wikiInfo.ImageUrl ?? string.Format(configuration["ImageDefaults:LoremFlickrUrl"] ?? "https://loremflickr.com/320/240/{0}", Uri.EscapeDataString(e.NombreComun));
                    hasUpdates = true;
                }
            }
            if (hasUpdates) await context.SaveChangesAsync();

            // Si ya tenemos suficientes especies, no volvemos a descargar datos para no duplicar
            if (especiesExistentes.Count >= 30)
            {
                return;
            }

            var nombresExistentes = especiesExistentes.Select(e => e.NombreComun).ToList();

            // Nombres científicos y datos biológicos base (¡Aumentado a 30 animales fascinantes!)
            var animalesBase = new Dictionary<string, (string NombreComun, string Tipo, bool Peligro)>
            {
                // Mamíferos Terrestres
                { "Panthera leo", ("León", "Mamífero", true) },
                { "Loxodonta africana", ("Elefante Africano", "Mamífero", true) },
                { "Ailuropoda melanoleuca", ("Panda Gigante", "Mamífero", true) },
                { "Panthera tigris", ("Tigre de Bengala", "Mamífero", true) },
                { "Macropus rufus", ("Canguro Rojo", "Mamífero", false) },
                { "Giraffa camelopardalis", ("Jirafa", "Mamífero", true) },
                { "Gorilla beringei", ("Gorila de Montaña", "Mamífero", true) },
                { "Diceros bicornis", ("Rinoceronte Negro", "Mamífero", true) },
                { "Acinonyx jubatus", ("Guepardo", "Mamífero", true) },
                { "Hippopotamus amphibius", ("Hipopótamo", "Mamífero", true) },
                { "Pongo abelii", ("Orangután", "Mamífero", true) },
                
                // Osos y Cánidos
                { "Ursus maritimus", ("Oso Polar", "Mamífero", true) },
                { "Ursus arctos", ("Oso Pardo", "Mamífero", false) },
                { "Canis lupus", ("Lobo Gris", "Mamífero", false) },
                { "Vulpes vulpes", ("Zorro Rojo", "Mamífero", false) },

                // Aves
                { "Ara macao", ("Guacamayo Rojo", "Ave", false) },
                { "Haliaeetus leucocephalus", ("Águila Calva", "Ave", false) },
                { "Struthio camelus", ("Avestruz", "Ave", false) },
                { "Aptenodytes forsteri", ("Pingüino Emperador", "Ave", false) },
                { "Phoenicopterus roseus", ("Flamenco Común", "Ave", false) },

                // Reptiles y Anfibios
                { "Chelonia mydas", ("Tortuga Verde", "Reptil", true) },
                { "Phyllobates terribilis", ("Rana Dardo Dorada", "Anfibio", true) },
                { "Crocodylus niloticus", ("Cocodrilo del Nilo", "Reptil", false) },
                { "Eunectes murinus", ("Anaconda Verde", "Reptil", false) },
                { "Varanus komodoensis", ("Dragón de Komodo", "Reptil", true) },
                { "Iguana iguana", ("Iguana Verde", "Reptil", false) },

                // Vida Marina
                { "Carcharodon carcharias", ("Tiburón Blanco", "Pez", true) },
                { "Balaenoptera musculus", ("Ballena Azul", "Mamífero", true) },
                { "Tursiops truncatus", ("Delfín Nariz de Botella", "Mamífero", false) },
                { "Manta birostris", ("Mantarraya Gigante", "Pez", true) }
            };

            using var httpClient = new HttpClient();
            var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
            
            var especiesInsertadas = new List<Especie>();
            var coordenadasTemporales = new List<(Especie Especie, Coordinate Coord)>();

            foreach (var animal in animalesBase)
            {
                // Si el animal ya está en la base de datos, lo saltamos
                if (nombresExistentes.Contains(animal.Value.NombreComun))
                    continue;
                var query = Uri.EscapeDataString(animal.Key);
                var url = string.Format(configuration["ExternalApis:GbifApiUrl"] ?? "https://api.gbif.org/v1/occurrence/search?q={0}&limit=1&hasCoordinate=true", query);

                try
                {
                    var response = await httpClient.GetAsync(url);
                    if (!response.IsSuccessStatusCode) continue;

                    var jsonResponse = await response.Content.ReadAsStringAsync();
                    using var document = JsonDocument.Parse(jsonResponse);
                    
                    var results = document.RootElement.GetProperty("results");
                    if (results.GetArrayLength() > 0)
                    {
                        var record = results[0];
                        double lat = record.GetProperty("decimalLatitude").GetDouble();
                        double lon = record.GetProperty("decimalLongitude").GetDouble();

                        var wikiInfo = await wikiService.GetAnimalInfoAsync(animal.Value.NombreComun);
                        var nuevaEspecie = new Especie
                        {
                            NombreComun = animal.Value.NombreComun,
                            Tipo = animal.Value.Tipo,
                            EnPeligroExtincion = animal.Value.Peligro,
                            Descripcion = !string.IsNullOrEmpty(wikiInfo.Description) ? wikiInfo.Description : $"El {animal.Value.NombreComun} es una especie asombrosa de nuestro planeta.",
                            Bioma = animal.Value.Tipo == "Marino" ? "Océano" : "Terrestre / Bosque",
                            FotoUrl = wikiInfo.ImageUrl ?? string.Format(configuration["ImageDefaults:LoremFlickrUrl"] ?? "https://loremflickr.com/320/240/{0}", Uri.EscapeDataString(animal.Value.NombreComun))
                        };

                        especiesInsertadas.Add(nuevaEspecie);
                        coordenadasTemporales.Add((nuevaEspecie, new Coordinate(lon, lat)));
                    }
                }
                catch
                {
                    // Si un animal falla en la API, simplemente lo saltamos
                    continue;
                }
            }

            // 1. Guardar las especies primero para generar sus IDs en la base de datos
            context.Especies.AddRange(especiesInsertadas);
            await context.SaveChangesAsync();

            // 2. Crear los avistamientos usando los IDs generados y las coordenadas de GBIF
            var avistamientos = coordenadasTemporales.Select(item => new Avistamiento
            {
                EspecieId = item.Especie.Id,
                Fecha = DateTime.UtcNow,
                Coordenadas = geometryFactory.CreatePoint(item.Coord)
            }).ToList();

            context.Avistamientos.AddRange(avistamientos);
            await context.SaveChangesAsync();
        }
    }
}
