using NetTopologySuite.Geometries;

namespace WildlifeAPI.Models
{
    public class Avistamiento
    {
        public int Id { get; set; }
        public int EspecieId { get; set; }
        public DateTime Fecha { get; set; }
        public Point Coordenadas { get; set; } = Point.Empty;
        
        public Especie? Especie { get; set; }
    }
}
