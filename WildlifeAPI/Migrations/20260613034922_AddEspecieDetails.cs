using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WildlifeAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddEspecieDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bioma",
                table: "Especies",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Descripcion",
                table: "Especies",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FotoUrl",
                table: "Especies",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bioma",
                table: "Especies");

            migrationBuilder.DropColumn(
                name: "Descripcion",
                table: "Especies");

            migrationBuilder.DropColumn(
                name: "FotoUrl",
                table: "Especies");
        }
    }
}
