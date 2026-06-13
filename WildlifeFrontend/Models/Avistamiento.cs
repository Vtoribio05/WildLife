using System.Text.Json.Serialization;

namespace WildlifeFrontend.Models;

public class Avistamiento
{
    public int Id { get; set; }
    public int EspecieId { get; set; }
    public DateTime Fecha { get; set; }
    
    [JsonPropertyName("coordenadas")]
    public GeoJsonPoint? Coordenadas { get; set; }
    
    public Especie? Especie { get; set; }
}

public class GeoJsonPoint
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "Point";
    
    [JsonPropertyName("coordinates")]
    public double[] Coordinates { get; set; } = new double[2]; // [longitude, latitude]
}
