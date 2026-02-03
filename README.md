# Library Management API

API REST construida con Node.js, TypeScript, Express y Prisma para la gestión de una biblioteca con autenticación JWT.

## 📋 Requisitos

- Node.js (v16 o superior)
- npm o yarn
- SQLite (incluido en Node.js)

## 🚀 Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd BackendRole
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="tu_clave_secreta_super_segura_aqui"
   PORT=3000

   # Opcional: Rate limiting
   RATE_LIMIT_MAX=100
   AUTH_RATE_LIMIT_MAX=10
   NODE_ENV=development
   ```

4. **Generar el cliente de Prisma y ejecutar migraciones:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Opcional - Poblar la base de datos con datos de prueba:**
   ```bash
   npm run prisma:seed
   ```
   Crea usuarios, autores y libros de ejemplo. Credenciales: `admin@library.com` / `password123`

### Modo Desarrollo
```bash
npm run dev
```

### Modo Producción
```bash
npm run build
npm start
```

La API estará disponible en `http://localhost:3000` (o el puerto especificado en `.env`).

## 📚 Documentación API

La documentación interactiva de Swagger está disponible en:
```
http://localhost:3000/api-docs
```

## 🔑 Autenticación

Todas las rutas (excepto `/auth/register` y `/auth/login`) requieren autenticación mediante JWT.

**Para autenticarte:**
1. Registra un usuario: `POST /auth/register`
2. Inicia sesión: `POST /auth/login`
3. Usa el token recibido en el header de las peticiones:
   ```
   Authorization: Bearer <tu_token>
   ```

## 📡 Endpoints

### Health Check

#### `GET /health`
Verifica el estado de la API.

**Respuesta exitosa (200):**
```json
{
  "status": "OK",
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Autenticación

#### `POST /auth/register`
Registra un nuevo usuario.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "name": "Nombre Usuario" // Opcional
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "User created successfully",
  "userId": 1
}
```

#### `POST /auth/login`
Inicia sesión y obtiene un token JWT.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "Nombre Usuario"
  }
}
```

### Usuarios (Protegido)

#### `GET /users`
Obtiene la lista de usuarios con **paginación** y **filtros**.

**Query params:**
- `page` (default: 1) - Número de página
- `limit` (default: 10, máx: 100) - Registros por página
- `email` - Filtrar por email (contiene)
- `name` - Filtrar por nombre (contiene)

**Respuesta paginada:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### `GET /users/:id`
Obtiene los detalles de un usuario específico.

### Autores (Protegido)

#### `GET /authors`
Obtiene la lista de autores con **paginación** y **filtros**.

**Query params:**
- `page`, `limit` - Paginación
- `name` - Filtrar por nombre (contiene)
- `nationality` - Filtrar por nacionalidad (contiene)

#### `GET /authors/:id`
Obtiene los detalles de un autor específico con sus libros.

#### `POST /authors`
Crea un nuevo autor.

**Body:**
```json
{
  "name": "Gabriel García Márquez",
  "nationality": "Colombiano" // Opcional
}
```

#### `PUT /authors/:id`
Actualiza un autor existente.

**Body:**
```json
{
  "name": "Gabriel García Márquez",
  "nationality": "Colombiano"
}
```

#### `DELETE /authors/:id`
Elimina un autor (solo si no tiene libros asociados).

### Libros (Protegido)

#### `GET /books`
Obtiene la lista de libros con **paginación** y **filtros**.

**Query params:**
- `page`, `limit` - Paginación
- `title` - Filtrar por título (contiene)
- `genre` - Filtrar por género (contiene)
- `authorId` - Filtrar por ID de autor

#### `GET /books/:id`
Obtiene los detalles de un libro específico con información del autor.

#### `POST /books`
Crea un nuevo libro. **Automáticamente actualiza el contador de libros del autor mediante un Job.**

**Body:**
```json
{
  "title": "Cien años de soledad",
  "genre": "Realismo mágico", // Opcional
  "authorId": 1
}
```

#### `PUT /books/:id`
Actualiza un libro existente. **Si cambia el autor, actualiza ambos contadores.**

**Body:**
```json
{
  "title": "Cien años de soledad",
  "genre": "Realismo mágico",
  "authorId": 1
}
```

#### `DELETE /books/:id`
Elimina un libro. **Automáticamente actualiza el contador de libros del autor.**

### Exportación (Protegido)

#### `GET /export`
Exporta los datos de autores y libros a un archivo Excel (.xlsx).

**Respuesta:** Archivo Excel descargable con dos hojas:
- **Authors**: ID, Name, Nationality, Book Count
- **Books**: ID, Title, Genre, Author Name

## 🔄 Sistema de Jobs

El sistema implementa un **escuchador de eventos** que se activa cuando:
- Se crea un libro
- Se actualiza un libro (si cambia el autor)
- Se elimina un libro

Cuando ocurre alguno de estos eventos, se ejecuta automáticamente un **Job** que actualiza el campo `bookCount` en la tabla `Author` con el número real de libros asociados.

## 🏗️ Estructura del Proyecto

```
BackendRole/
├── src/
│   ├── config/          # Configuración (Prisma client)
│   ├── controllers/     # Lógica de los endpoints
│   ├── jobs/            # Jobs para procesamiento asíncrono
│   ├── middlewares/     # Middlewares (autenticación)
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio reusable
│   ├── utils/           # Utilidades (event emitter)
│   ├── app.ts           # Configuración de Express
│   └── index.ts         # Punto de entrada
├── prisma/
│   ├── schema.prisma    # Esquema de base de datos
│   └── seed.ts          # Seeder (datos de prueba)
├── .env.example         # Ejemplo de variables de entorno
├── Dockerfile           # Configuración Docker
├── package.json         # Dependencias del proyecto
└── README.md            # Este archivo
```

## 🧪 Pruebas

### Opción rápida con seeder

Ejecuta el seeder para tener datos de prueba listos:
```bash
npm run prisma:seed
```

Luego inicia sesión con: `admin@library.com` / `password123`

### Ejemplo de flujo completo (sin seeder):

1. **Registrar usuario:**
   ```bash
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```
   Guarda el token recibido.

3. **Crear autor:**
   ```bash
   curl -X POST http://localhost:3000/authors \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <tu_token>" \
     -d '{"name":"Gabriel García Márquez","nationality":"Colombiano"}'
   ```

4. **Crear libro:**
   ```bash
   curl -X POST http://localhost:3000/books \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <tu_token>" \
     -d '{"title":"Cien años de soledad","genre":"Realismo mágico","authorId":1}'
   ```

5. **Listar autores con paginación y filtros:**
   ```bash
   curl "http://localhost:3000/authors?page=1&limit=5&name=García" \
     -H "Authorization: Bearer <tu_token>"
   ```

6. **Exportar datos:**
   ```bash
   curl -X GET http://localhost:3000/export \
     -H "Authorization: Bearer <tu_token>" \
     --output export.xlsx
   ```

## 🐳 Docker (Opcional)

Para ejecutar con Docker:

```bash
docker-compose up --build
```

## 📝 Validaciones

- **Email**: Debe ser un email válido
- **Password**: Mínimo 6 caracteres
- **Author Name**: Requerido, mínimo 1 carácter
- **Book Title**: Requerido, mínimo 1 carácter
- **AuthorId**: Debe existir en la base de datos

## 🔒 Seguridad y Mejoras

- **Rate Limiting**: Límite de 100 peticiones/15min (general), 10 intentos/15min (login/registro)
- **Helmet**: Headers de seguridad HTTP
- **Compression**: Compresión gzip de respuestas
- **Morgan**: Logging de peticiones HTTP
- Contraseñas hasheadas con bcrypt
- Tokens JWT con expiración de 24 horas
- Validación de tokens en todas las rutas protegidas
- Validación de datos de entrada con Zod

## 📊 Códigos de Respuesta HTTP

- `200`: Operación exitosa
- `201`: Recurso creado exitosamente
- `400`: Error de validación o solicitud incorrecta
- `401`: No autenticado o token inválido
- `404`: Recurso no encontrado
- `409`: Conflicto (ej: email ya registrado)
- `429`: Demasiadas peticiones (rate limit excedido)
- `500`: Error interno del servidor

## 🛠️ Tecnologías Utilizadas

- **Node.js**: Runtime de JavaScript
- **TypeScript**: Superset tipado de JavaScript
- **Express**: Framework web
- **Prisma**: ORM para base de datos
- **SQLite**: Base de datos
- **JWT**: Autenticación
- **bcryptjs**: Hash de contraseñas
- **Zod**: Validación de esquemas
- **ExcelJS**: Generación de archivos Excel
- **Swagger**: Documentación API
- **express-rate-limit**: Rate limiting
- **helmet**: Seguridad HTTP
- **compression**: Compresión de respuestas
- **morgan**: Logging HTTP

## 📄 Licencia

ISC
