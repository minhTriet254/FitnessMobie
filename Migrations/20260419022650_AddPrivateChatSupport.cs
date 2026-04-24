using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPrivateChatSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "02f16ce7-7abe-4a51-a116-6b4978728f36");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "05979b60-95a2-4f26-a289-9eb50c5e6453");

            migrationBuilder.AddColumn<bool>(
                name: "IsReadByAdmin",
                table: "Messages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastMessageAt",
                table: "Conversations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "689deef9-6692-46d4-9593-b632bb09a10a", null, "User", "USER" },
                    { "7a797af5-dff7-4f57-90cf-71db7a1df7b8", null, "Admin", "ADMIN" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "689deef9-6692-46d4-9593-b632bb09a10a");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "7a797af5-dff7-4f57-90cf-71db7a1df7b8");

            migrationBuilder.DropColumn(
                name: "IsReadByAdmin",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "LastMessageAt",
                table: "Conversations");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "02f16ce7-7abe-4a51-a116-6b4978728f36", null, "Admin", "ADMIN" },
                    { "05979b60-95a2-4f26-a289-9eb50c5e6453", null, "User", "USER" }
                });
        }
    }
}
