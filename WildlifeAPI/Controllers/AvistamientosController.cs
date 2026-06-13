using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WildlifeAPI.Data;
using WildlifeAPI.Models;

namespace WildlifeAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AvistamientosController : ControllerBase
    {
        private readonly WildlifeDbContext _context;
        private readonly ILogger<AvistamientosController> _logger;

        public AvistamientosController(WildlifeDbContext context, ILogger<AvistamientosController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Avistamientos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Avistamiento>>> GetAvistamientos()
        {
            _logger.LogInformation("Consultando lista de avistamientos...");
            return await _context.Avistamientos.Include(a => a.Especie).ToListAsync();
        }

        // GET: api/Avistamientos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Avistamiento>> GetAvistamiento(int id)
        {
            var avistamiento = await _context.Avistamientos.Include(a => a.Especie).FirstOrDefaultAsync(a => a.Id == id);

            if (avistamiento == null)
            {
                return NotFound();
            }

            return avistamiento;
        }

        // POST: api/Avistamientos
        [HttpPost]
        public async Task<ActionResult<Avistamiento>> PostAvistamiento(Avistamiento avistamiento)
        {
            _context.Avistamientos.Add(avistamiento);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Se creó un registro de avistamiento con ID {Id}", avistamiento.Id);

            return CreatedAtAction("GetAvistamiento", new { id = avistamiento.Id }, avistamiento);
        }

        // PUT: api/Avistamientos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAvistamiento(int id, Avistamiento avistamiento)
        {
            if (id != avistamiento.Id)
            {
                return BadRequest();
            }

            _context.Entry(avistamiento).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AvistamientoExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Avistamientos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAvistamiento(int id)
        {
            var avistamiento = await _context.Avistamientos.FindAsync(id);
            if (avistamiento == null)
            {
                return NotFound();
            }

            _context.Avistamientos.Remove(avistamiento);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AvistamientoExists(int id)
        {
            return _context.Avistamientos.Any(e => e.Id == id);
        }
        [HttpGet("FixSpeciesData")]
        public async Task<IActionResult> FixSpeciesData([FromServices] WildlifeAPI.Services.IWikipediaService wikiService)
        {
            var especies = await _context.Especies.ToListAsync();
            var results = new List<string>();
            foreach(var e in especies)
            {
                var info = await wikiService.GetAnimalInfoAsync(e.NombreComun);
                bool updated = false;
                
                if (info.ImageUrl != null && e.FotoUrl != info.ImageUrl)
                {
                    e.FotoUrl = info.ImageUrl;
                    updated = true;
                }
                
                if (!string.IsNullOrEmpty(info.Description) && (string.IsNullOrEmpty(e.Descripcion) || e.Descripcion.Contains("asombrosa")))
                {
                    e.Descripcion = info.Description;
                    updated = true;
                }

                if (updated)
                {
                    results.Add($"Actualizado {e.NombreComun}");
                }
                else
                {
                    results.Add($"Ya estaba bien {e.NombreComun}");
                }
            }
            await _context.SaveChangesAsync();
            return Ok(results);
        }
    }
}
