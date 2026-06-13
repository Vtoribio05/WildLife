# Wildlife API 🦁🌍

Una API robusta construida con **.NET 8** y **C#** para gestionar avistamientos de especies animales, integrando capacidades geoespaciales y de Inteligencia Artificial.

## 🚀 Características Principales

- **Gestión de Especies:** Funciones completas (CRUD) para registrar animales terrestres, marinos y aves.
- **Avistamientos Geoespaciales:** Registro de avistamientos con coordenadas exactas (Latitud y Longitud) utilizando **NetTopologySuite**.
- **Chatbot de IA:** Integración nativa con **Groq AI (Llama 3.3)**. El chatbot actúa como un biólogo experto y guía de parque para responder preguntas de los usuarios de forma natural.
- **Data Seeder Automático:** La aplicación incluye un sembrador de datos que se conecta a la API de **GBIF** (Global Biodiversity Information Facility) para llenar la base de datos automáticamente con información de 30 especies reales y sus ubicaciones.
- **Arquitectura en la Nube:** Conectado de forma segura a **Supabase (PostgreSQL)**, soportando conexiones mediante Connection Pooler (IPv4).
- **Documentación Activa:** Todos los endpoints están documentados y son probables gracias a **Swagger**.

## 🛠️ Tecnologías y Librerías

- **Backend:** C# / ASP.NET Core 8.0
- **Base de Datos:** PostgreSQL alojado en Supabase
- **ORM:** Entity Framework Core con soporte para PostGIS (`Npgsql.EntityFrameworkCore.PostgreSQL.NetTopologySuite`)
- **Inteligencia Artificial:** Groq API (Llama 3.3) mediante llamadas `HttpClient`.
- **Swagger / OpenAPI:** Para probar la API fácilmente desde la web.

## ⚙️ Configuración y Ejecución Local

### Prerrequisitos
1. Tener instalado [.NET 8.0 SDK](https://dotnet.microsoft.com/download).
2. Tener configurada tu base de datos en Supabase con las extensiones geoespaciales (`postgis`) activadas.

### Pasos
1. Clona el repositorio:
   ```bash
   git clone https://github.com/Vtoribio05/WildLife.git
   ```
2. Navega al directorio de la API:
   ```bash
   cd WildLife/WildlifeAPI
   ```
3. Configura tus variables de entorno en el archivo `appsettings.json`. Necesitarás tu **Connection String de Supabase** (preferiblemente la URL del Pooler) y tu **API Key de Groq**:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "TuConexionDirecta",
     "PoolerConnection": "TuConexionPooler"
   },
   "AiService": {
     "ApiKey": "TuGroqApiKey"
   }
   ```
4. Ejecuta el proyecto. La API está forzada a iniciarse siempre en el puerto **5085**:
   ```bash
   dotnet run
   ```
5. Abre en tu navegador la siguiente ruta para ver la interfaz interactiva de Swagger:
   👉 **`http://localhost:5085/swagger`**

## 📂 Estructura de Endpoints (Swagger)
- **`GET /api/Especies`** - Lista las especies registradas.
- **`GET /api/Avistamientos`** - Lista los avistamientos con su información geográfica.
- **`POST /api/Chatbot/ask`** - Envía una pregunta a la inteligencia artificial sobre cualquier animal.

## 📝 Notas para el Desarrollador
- Si necesitas aplicar migraciones de base de datos a futuro, recuerda usar el comando `dotnet ef database update`.
- La inserción de datos (Seeding) ocurre de forma automática al iniciar la app si se detecta que hay menos de 30 especies en la base de datos.
