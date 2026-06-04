using Microsoft.EntityFrameworkCore;
using WildlifeAPI.Models;

namespace WildlifeAPI.Data
{
    public class WildlifeDbContext : DbContext
    {
        public WildlifeDbContext(DbContextOptions<WildlifeDbContext> options) : base(options)
        {
        }

        public DbSet<Especie> Especies { get; set; }
        public DbSet<Avistamiento> Avistamientos { get; set; }
    }
}
