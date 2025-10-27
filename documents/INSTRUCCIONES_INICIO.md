# 🚀 Instrucciones de Inicio - MNK Service

## ✅ Instalación Completada

El backend ha sido creado exitosamente con las siguientes características:

### 📦 Estructura del Proyecto

```
mnk-service/
├── src/
│   ├── common/              # Código compartido
│   │   ├── dto/           # DTOs globales
│   │   ├── filters/       # Filtros de excepciones
│   │   ├── interceptors/  # Interceptors globales
│   │   ├── middleware/     # Middlewares
│   │   └── types/          # Tipos TypeScript
│   ├── config/             # Configuración
│   │   ├── database.config.ts
│   │   └── env.config.ts
│   ├── domains/            # Módulos del dominio (DDD)
│   │   └── seguridades/    # Módulo de autenticación
│   │       ├── application/    # Lógica de negocio
│   │       ├── infrastructure/ # Implementaciones
│   │       └── presentation/   # Controllers y DTOs
│   ├── app.module.ts       # Módulo raíz
│   └── main.ts             # Punto de entrada
├── .env                    # Variables de entorno
├── package.json
└── README.md
```

## 🎯 Comandos Disponibles

### Desarrollo
```bash
npm run start:dev    # Inicia con hot-reload
npm run start:debug  # Inicia en modo debug
```

### Producción
```bash
npm run build        # Compila el proyecto
npm run start:prod   # Inicia en producción
```

### Testing
```bash
npm run test         # Ejecuta tests
npm run test:watch  # Tests en modo watch
npm run test:cov    # Tests con cobertura
```

### Calidad de Código
```bash
npm run lint         # Ejecuta linter
npm run format       # Formatea el código
```

## 🔧 Configuración

### Variables de Entorno

El archivo `.env` contiene:

```env
# Application
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=mnk-secret-key-change-in-production...
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=mnk-refresh-secret-key...
JWT_REFRESH_EXPIRES_IN=7d

# Database
DB_TYPE=sqlite
DB_DATABASE=mnk_service.db
DB_SYNCHRONIZE=true
DB_LOGGING=false
```

### ⚠️ IMPORTANTE para Producción

1. **Cambiar JWT secrets**: Usar claves fuertes y seguras
2. **Deshabilitar DB_SYNCHRONIZE**: Cambiar a `false`
3. **Habilitar logging**: Activar para monitoreo
4. **Usar PostgreSQL**: Para producción

## 🌐 URLs del Servidor

- **API Base**: `http://localhost:3000/api`
- **Swagger**: `http://localhost:3000/api/docs`
- **Health Check**: `http://localhost:3000/api`

## 📚 Documentación

- **README.md**: Información general del proyecto
- **INTEGRACION_FRONTEND.md**: Guía de integración con React Native

## 🔐 Endpoints Disponibles

### Autenticación

```bash
# Login
POST /api/seguridades/login
Body: { "email": "user@example.com", "password": "pass123" }

# Registro
POST /api/seguridades/register
Body: { "email", "password", "firstName", "lastName", "companyId" }

# Refresh Token
POST /api/seguridades/refresh-token
Body: { "refreshToken": "..." }

# Perfil (Autenticado)
GET /api/seguridades/profile
Headers: Authorization: Bearer <token>
```

## 🎨 Arquitectura Implementada

### DDD + Hexagonal

- ✅ **Domain Layer**: Entidades de negocio
- ✅ **Application Layer**: Servicios y casos de uso
- ✅ **Infrastructure Layer**: Repositorios, DB, auth
- ✅ **Presentation Layer**: Controllers y DTOs

### Características

- ✅ JWT con Access y Refresh tokens
- ✅ Middleware multiempresa
- ✅ Respuestas estandarizadas
- ✅ Swagger/OpenAPI
- ✅ Base de datos SQLite (fácil migración)
- ✅ TypeORM para acceso a datos
- ✅ Validación automática de DTOs
- ✅ Filtros de excepciones globales

## 🚧 Próximos Pasos Recomendados

### 1. Crear Módulos Adicionales

```bash
# Ejemplo: Módulo de Productos
src/domains/productos/
  ├── application/
  ├── infrastructure/
  └── presentation/
```

### 2. Migrar a PostgreSQL

Modificar `.env`:
```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=mnk_production
```

### 3. Implementar Roles y Permisos

- Agregar entidad `Role`
- Agregar entidad `Permission`
- Implementar guards por rol

### 4. Agregar Tests

```bash
# Crear archivos .spec.ts
npm run test
```

### 5. Dockerizar la Aplicación

Crear `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
```

## 📱 Integración con Frontend React Native

Ver archivo: `INTEGRACION_FRONTEND.md`

### Headers Requeridos

```typescript
{
  'Authorization': 'Bearer <token>',
  'company-code': '<codigo-empresa>',
  'user-id': '<id-usuario>',
  'app-source': 'mobile'
}
```

### Estructura de Respuesta

```json
{
  "data": { /* datos */ },
  "result": {
    "code": "000",
    "description": "Mensaje",
    "details": null
  },
  "statusCode": 200
}
```

## 🐛 Troubleshooting

### Error: Puerto 3000 en uso
```bash
# Cambiar puerto en .env
PORT=3001
```

### Error: SQLite lock
```bash
# Reinstalar dependencias
npm install --legacy-peer-deps
```

### Error: bcrypt no se compila
```bash
# En Windows, instalar herramientas de compilación
npm install --global windows-build-tools
npm install --legacy-peer-deps
```

## 📝 Notas

- El proyecto usa `--legacy-peer-deps` para compatibilidad
- SQLite es perfecto para desarrollo y pruebas
- La arquitectura permite migrar a otros DB fácilmente
- Todos los módulos son modulares y reutilizables

## ✨ Características Únicas

1. **Arquitectura DDD**: Código organizado por dominio
2. **Hexagonal**: Fácil cambio de implementación
3. **Multiempresa**: Listo para múltiples empresas
4. **Monorepo**: Múltiples módulos en un solo repo
5. **API Gateway**: Punto único de entrada
6. **Respuestas Estándar**: Consistencia en toda la API

## 🎓 Aprender Más

- [NestJS Docs](https://docs.nestjs.com/)
- [TypeORM Docs](https://typeorm.io/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

---

**¡Listo para desarrollar! 🚀**

