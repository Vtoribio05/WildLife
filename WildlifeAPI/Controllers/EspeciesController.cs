using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WildlifeAPI.Data;
using WildlifeAPI.Models;

namespace WildlifeAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EspeciesController : ControllerBase
    {
        private readonly WildlifeDbContext _context;
        private readonly ILogger<EspeciesController> _logger;

        public EspeciesController(WildlifeDbContext context, ILogger<EspeciesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Especies
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Especie>>> GetEspecies()
        {
            _logger.LogInformation("Consultando lista de especies...");
            return await _context.Especies.ToListAsync();
        }

        // GET: api/Especies/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Especie>> GetEspecie(int id)
        {
            var especie = await _context.Especies.FindAsync(id);

            if (especie == null)
            {
                _logger.LogWarning("No se encontró la especie con ID {Id}", id);
                return NotFound();
            }

            return especie;
        }

        // POST: api/Especies
        [HttpPost]
        public async Task<ActionResult<Especie>> PostEspecie(Especie especie)
        {
            _context.Especies.Add(especie);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Se creó un registro de especie con ID {Id} ({Nombre})", especie.Id, especie.NombreComun);

            return CreatedAtAction("GetEspecie", new { id = especie.Id }, especie);
        }

        // PUT: api/Especies/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEspecie(int id, Especie especie)
        {
            if (id != especie.Id)
            {
                return BadRequest();
            }

            _context.Entry(especie).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Se actualizó la especie con ID {Id}", id);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EspecieExists(id))
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

        // DELETE: api/Especies/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEspecie(int id)
        {
            var especie = await _context.Especies.FindAsync(id);
            if (especie == null)
            {
                return NotFound();
            }

            _context.Especies.Remove(especie);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Se eliminó la especie con ID {Id}", id);

            return NoContent();
        }

        private bool EspecieExists(int id)
        {
            return _context.Especies.Any(e => e.Id == id);
        }
    }
}
