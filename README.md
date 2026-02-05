# Library Management API

API REST construida con Node.js, TypeScript, Express y Prisma para la gestión de una biblioteca con autenticación JWT.

## 📋 Requisitos

- Node.js (v16 o superior)
- npm o yarn
- postgresql (incluido en Node.js)

## 🚀 Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone git@github.com:RicardoBravo92/library-management-system.git
   cd library-management-system
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
   ```env
   DATABASE_URL="postgresql://postgres:prisma@localhost:5432/postgres"
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



## 📚 Documentación API

La documentación interactiva de Swagger está disponible en:
   ```bash
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

```bash
http://localhost:3000/api/v1/health
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

{
  "name": "Gabriel García Márquez",
  "nationality": "Colombiano" // Opcional
}

#### `PUT /authors/:id`
Actualiza un autor existente.

**Body:**
{
  "name": "Gabriel García Márquez",
  "nationality": "Colombiano"
}

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
{
  "title": "Cien años de soledad",
  "genre": "Realismo mágico", // Opcional
  "authorId": 1
}

#### `PUT /books/:id`
Actualiza un libro existente. **Si cambia el autor, actualiza ambos contadores.**

**Body:**
{
  "title": "Cien años de soledad",
  "genre": "Realismo mágico",
  "authorId": 1
}

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

### Ejecutar Tests

Para ejecutar las pruebas automatizadas (unitarias y de integración), asegúrate de que el contenedor de Docker `postgres` esté corriendo, ya que las pruebas de integración utilizan una base de datos real en un entorno de prueba.

```bash
# Asegurar que la base de datos de Docker esté arriba
docker-compose up -d postgres

# Ejecutar las pruebas
npm run test
```

Los tests cubren:
- **Pruebas Unitarias:** Servicios y lógica de negocio.
- **Pruebas de Integración:** Endpoints de la API (`/health`, `/auth`, `/books`, `/users`).

> **Nota:** El comando `npm run test` está configurado para usar `node --experimental-vm-modules` para soportar módulos ES (ESM) con Jest y se conecta automáticamente al contenedor de Postgres local configurado en `.env.test`.

### Opción rápida con seeder

Ejecuta el seeder para tener datos de prueba listos:
```bash
npm run prisma:seed
```

Luego inicia sesión con: `admin@library.com` / `password123`

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```
   
   
6. **Exportar datos:**
   
   curl -X GET http://localhost:3000/api/v1/export \
     -H "Authorization: Bearer <tu_token>" \
     --output export.xlsx

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
- **postgresql**: Base de datos
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
