# MNK Service - Backend Multiempresa

Backend modular con arquitectura DDD (Domain-Driven Design) + Hexagonal para aplicación multiempresa React Native.

## 🎯 Características

- ✅ **Arquitectura DDD + Hexagonal** - Separación clara de capas (Domain, Application, Infrastructure, Presentation)
- ✅ **Autenticación JWT** - Tokens de acceso y refresh para seguridad
- ✅ **Multiempresa** - Soporte completo para múltiples empresas, sucursales y usuarios
- ✅ **API Gateway** - Punto único de entrada que enruta a módulos independientes
- ✅ **Base de Datos Local** - SQLite para desarrollo, migrable a PostgreSQL/Cosmos DB
- ✅ **Respuestas Estandarizadas** - Formato único con code, description y details
- ✅ **Swagger** - Documentación automática de la API
- ✅ **Monorepo** - Todos los módulos en un solo repositorio

## 📁 Estructura del Proyecto

```
src/
├── common/                    # Código compartido entre módulos
│   ├── dto/                  # DTOs compartidos
│   ├── middleware/           # Middlewares globales
│   └── interceptors/         # Interceptors globales
├── config/                    # Configuraciones
│   ├── database.config.ts     # Configuración de base de datos
│   └── env.config.ts         # Variables de entorno
├── domains/                  # Dominios de negocio (DDD)
│   └── seguridades/         # Módulo de Seguridades (Auth)
│       ├── application/     # Lógica de negocio
│       ├── infrastructure/  # Implementaciones técnicas
│       ├── presentation/    # Controllers y DTOs
│       └── domain/          # Entidades y reglas de dominio
├── app.module.ts             # Módulo raíz
└── main.ts                   # Punto de entrada
```

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copiar el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:

```env
PORT=3000
NODE_ENV=development

JWT_SECRET=tu-clave-secreta-cambiar-en-produccion
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=tu-clave-refresh-cambiar-en-produccion
JWT_REFRESH_EXPIRES_IN=7d

DB_TYPE=sqlite
DB_DATABASE=mnk_service.db
DB_SYNCHRONIZE=true
DB_LOGGING=false
```

### 3. Poblar base de datos con datos de prueba

```bash
# Crear datos de prueba (empresa, sucursales, usuarios)
npm run seed
```

Esto creará:
- ✅ 1 Empresa: MNK Solutions
- ✅ 2 Sucursales: Quito y Guayaquil  
- ✅ 2 Usuarios:
  - **admin@mnksolutions.com** / Admin123! (Administrador)
  - **test@mnksolutions.com** / Test123! (Usuario)

### 4. Ejecutar el proyecto

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

El servidor estará disponible en `http://localhost:3000/api`

## 📚 Documentación

### Postman Collection
- **Importa**: `documents/MNK_Service_API.postman_collection.json`
- **Instrucciones**: Ver `documents/POSTMAN_INSTRUCCIONES.md`

### Swagger
Una vez iniciado el servidor, accede a la documentación en:
`http://localhost:3000/api/docs`

### Endpoints Disponibles

#### Autenticación

- `POST /api/seguridades/login` - Iniciar sesión
- `POST /api/seguridades/register` - Registrar usuario
- `POST /api/seguridades/refresh-token` - Refrescar token
- `GET /api/seguridades/profile` - Obtener perfil (requiere autenticación)

#### Usuarios

- `GET /api/usuarios/me` - Información del usuario actual (requiere autenticación)

## 🔐 Autenticación

### Headers Requeridos para Requests Autenticados

```http
Authorization: Bearer <access_token>
company-code: <codigo-de-empresa>
user-id: <id-del-usuario> (opcional)
app-source: mobile (opcional)
```

### Estructura de Respuesta

Todas las respuestas siguen el siguiente formato:

```json
{
  "data": { /* datos de la respuesta */ },
  "result": {
    "statusCode": 200,      // Código HTTP (200 = éxito)
    "description": "Mensaje descriptivo para el usuario",
    "details": null         // Detalles técnicos del error si aplica
  }
}
```

## 📦 Módulos

### Seguridades (Seguridad/Auth)
Módulo de autenticación y autorización:
- Login/Logout
- Registro de usuarios
- Gestión de tokens JWT
- Refresh tokens
- Protección de rutas

## 🏗️ Arquitectura

### Domain-Driven Design

La arquitectura sigue los principios de DDD:

**Application Layer**: Lógica de negocio y casos de uso
- Services
- Use Cases

**Infrastructure Layer**: Implementaciones técnicas
- Repositories
- Database Entities
- External Services

**Presentation Layer**: Interfaz con el cliente
- Controllers
- DTOs
- Validation

**Domain Layer**: Entidades y reglas de negocio
- Entities
- Domain Logic

### Hexagonal Architecture

La arquitectura hexagonal (Ports & Adapters) permite:
- **Desacoplamiento**: El dominio no depende de frameworks
- **Testabilidad**: Fácil de testear con mocks
- **Flexibilidad**: Cambiar BDD o frameworks sin afectar el dominio

## 🔄 Migración Futura

### De SQLite a PostgreSQL/Cosmos DB

La arquitectura hexagonal permite cambiar la BDD sin modificar la lógica de negocio:

1. Actualizar `database.config.ts`
2. Cambiar configuración en `.env`
3. Sin cambios en el código de aplicación

### De Monolito a Microservicios

Los módulos están preparados para separarse en servicios independientes:
- Cada módulo en su propio repositorio
- Comunicación vía API Gateway
- Contenerización con Docker

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con cobertura
npm run test:cov

# Tests E2E
npm run test:e2e
```

## 🔧 Scripts Disponibles

```bash
npm start                    # Inicia el servidor
npm run start:dev           # Inicia en modo desarrollo (watch mode)
npm run start:debug       # Inicia en modo debug
npm run build               # Compila el proyecto
npm run format              # Formatea el código
npm run lint                # Ejecuta el linter
npm run test                # Ejecuta tests
npm run seed                # Crear datos de prueba
npm run seed:reset          # Borrar y recrear datos
```

## 📝 Desarrollo

### Agregar Nuevo Módulo

1. Crear carpeta en `src/domains/` con el nombre del módulo
2. Estructurar con las capas: application, infrastructure, presentation
3. Registrar el módulo en `app.module.ts`
4. Agregar controllers en `main.ts` (swagger tags)

### Agregar Nueva Entidad

1. Crear entidad en `infrastructure/entities/`
2. Crear repositorio en `infrastructure/repositories/`
3. Registrar en el módulo con `TypeOrmModule.forFeature()`

## 🌐 Integración con Frontend

Este backend está diseñado para trabajar con:
- **Frontend**: React Native app en `C:\Danilo\PERSONAL\ReactNative\mnk-app`
- **Headers**: Multiempresa con `company-code`, `user-id`, `app-source`
- **Autenticación**: JWT tokens en header `Authorization: Bearer <token>`
- **Respuestas**: Formato estandarizado con `result.statusCode`, `result.description`, `result.details`

## 📄 Licencia

Private - Todos los derechos reservados

