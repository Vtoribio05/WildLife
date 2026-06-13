namespace WildlifeAPI.Models
{
    public class Especie
    {
        public int Id { get; set; }
        public string NombreComun { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty; // Marino o Terrestre
        public bool EnPeligroExtincion { get; set; }
        
        public string? Descripcion { get; set; }
        public string? Bioma { get; set; }
        public string? FotoUrl { get; set; }
        
        public ICollection<Avistamiento> Avistamientos { get; set; } = new List<Avistamiento>();
    }
}
