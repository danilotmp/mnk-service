# Architecture Decision Records (ADR)

**Proyecto**: MNK Service  
**Última Actualización**: 10 de Noviembre, 2025

---

## Índice
- [ADR-001: Arquitectura DDD + Hexagonal](#adr-001-arquitectura-ddd--hexagonal)
- [ADR-002: Sistema de Autorización Basado en Permisos](#adr-002-sistema-de-autorización-basado-en-permisos)
- [ADR-003: Internacionalización (i18n)](#adr-003-internacionalización-i18n)
- [ADR-004: Arquitectura Multiempresa](#adr-004-arquitectura-multiempresa)
- [ADR-005: Endpoints TODO-EN-UNO](#adr-005-endpoints-todo-en-uno)
- [ADR-006: Inclusión de Relaciones en Respuestas](#adr-006-inclusión-de-relaciones-en-respuestas)

---

## ADR-001: Arquitectura DDD + Hexagonal

### Estado
✅ **Aceptado** - Implementado

### Contexto
Necesitábamos una arquitectura escalable, mantenible y que facilite la separación de responsabilidades en un sistema multiempresa complejo.

### Decisión
Implementar **Domain-Driven Design (DDD)** con **Arquitectura Hexagonal** (Ports & Adapters).

### Estructura
```
src/
├── common/              # Código compartido
│   ├── decorators/
│   ├── dto/
│   ├── filters/
│   ├── helpers/
│   ├── interceptors/
│   ├── messages/        # i18n
│   ├── middleware/
│   └── types/
├── config/              # Configuración global
├── database/            # Seeders
└── domains/             # Dominios de negocio
    └── seguridades/     # Dominio de Seguridades
        ├── application/       # Casos de uso
        │   └── services/      # Lógica de negocio
        ├── infrastructure/    # Adaptadores
        │   ├── auth/         # JWT Strategy
        │   ├── decorators/   # Decoradores custom
        │   ├── entities/     # TypeORM entities
        │   ├── guards/       # Guards de autorización
        │   └── repositories/ # Acceso a datos
        ├── presentation/     # Capa de presentación
        │   ├── controllers/  # REST controllers
        │   └── dto/          # Data Transfer Objects
        └── seguridades.module.ts
```

### Ventajas
- ✅ Separación clara de responsabilidades
- ✅ Fácil testing (cada capa es independiente)
- ✅ Bajo acoplamiento, alta cohesión
- ✅ Facilita agregar nuevos dominios sin afectar existentes
- ✅ Lógica de negocio independiente de framework

### Alternativas Consideradas
1. **Arquitectura en capas tradicional** - Rechazada por alto acoplamiento
2. **Clean Architecture** - Muy similar, elegimos Hexagonal por simplicidad

### Consecuencias
- Los nuevos desarrolladores necesitan entender DDD
- Requiere disciplina para mantener las separaciones
- Más archivos/carpetas, pero mejor organizados

---

## ADR-002: Sistema de Autorización Basado en Permisos

### Estado
✅ **Aceptado** - Implementado

### Contexto
Necesitábamos un sistema de autorización flexible que permita control granular de accesos sin hardcodear roles.

### Decisión
Implementar autorización basada en **permisos** en lugar de solo roles.

### Modelo
```
Usuario → UserRole → Role → RolePermission → Permission
```

- Un usuario puede tener múltiples roles
- Un rol tiene múltiples permisos
- Los permisos son la unidad atómica de autorización

### Permisos del Sistema
```typescript
// Gestión de usuarios
users.view
users.create
users.edit
users.delete

// Gestión de roles
roles.view
roles.create
roles.edit
roles.delete

// Gestión de permisos
permissions.view
permissions.manage

// Gestión de empresas
companies.view
companies.create
companies.edit
companies.delete

// Gestión de sucursales
branches.view
branches.create
branches.edit
branches.delete

// Accesos
security.accesses.view
```

### Implementación
```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(['users.view'])
async getUsuarios() { ... }
```

### Ventajas
- ✅ Control granular de accesos
- ✅ Flexible: cambiar permisos sin cambiar código
- ✅ Auditable: se puede rastrear quién tiene qué permisos
- ✅ Escalable: agregar nuevos permisos sin refactorizar

### Alternativas Consideradas
1. **RBAC puro (solo roles)** - Rechazado por inflexibilidad
2. **ACL (Access Control Lists)** - Rechazado por complejidad

### Consecuencias
- Necesidad de gestionar permisos desde la UI
- Tablas adicionales en la base de datos
- Proceso de onboarding más complejo

---

## ADR-003: Internacionalización (i18n)

### Estado
✅ **Aceptado** - Implementado

### Contexto
Sistema multiempresa con clientes en diferentes países (Ecuador, Brasil, etc.) que requieren mensajes en su idioma.

### Decisión
Implementar i18n con soporte para español, inglés y portugués usando archivos JSON y header `Accept-Language`.

### Implementación
```
src/common/messages/i18n/locales/
├── es/
│   ├── errors.json
│   └── success.json
├── en/
│   ├── errors.json
│   └── success.json
└── pt/
    ├── errors.json
    └── success.json
```

### Uso
```typescript
// Frontend envía
headers: {
  'Accept-Language': 'es'  // es, en, pt
}

// Backend responde
{
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa"  // en español
  }
}
```

### Idiomas Soportados
- 🇪🇸 Español (es) - Idioma por defecto
- 🇺🇸 Inglés (en)
- 🇧🇷 Portugués (pt)

### Ventajas
- ✅ Experiencia de usuario mejorada
- ✅ Expansión internacional facilitada
- ✅ Separación de mensajes del código

### Consecuencias
- Necesidad de mantener traducciones actualizadas
- Posibles inconsistencias entre idiomas
- Archivos adicionales de configuración

---

## ADR-004: Arquitectura Multiempresa

### Estado
✅ **Aceptado** - Implementado

### Contexto
Sistema SaaS que debe soportar múltiples empresas con sus propias sucursales, usuarios y datos aislados.

### Decisión
Implementar multitenancy a nivel de aplicación con identificador de empresa en cada registro.

### Modelo de Datos
```
Company (Empresa)
├── Branches (Sucursales)
├── Users (Usuarios)
└── [Otros datos específicos de empresa]

User
├── companyId (Empresa principal)
├── currentBranchId (Sucursal actual)
└── availableBranches (Sucursales disponibles)
```

### Headers de Contexto
```typescript
headers: {
  'company-code': 'MNK',       // Código de empresa
  'user-id': 'uuid',           // ID del usuario
  'app-source': 'mobile'       // Origen de la petición
}
```

### Ventajas
- ✅ Aislamiento de datos por empresa
- ✅ Escalabilidad (una base de datos para todos)
- ✅ Gestión centralizada
- ✅ Costos reducidos vs. bases de datos separadas

### Alternativas Consideradas
1. **Base de datos por empresa** - Rechazado por complejidad operacional
2. **Schemas por empresa** - Rechazado por limitaciones de algunos DB

### Consecuencias
- Cuidado extra con queries para evitar data leaks
- Índices en companyId en todas las tablas relevantes
- Testing de aislamiento de datos crítico

---

## ADR-005: Endpoints TODO-EN-UNO

### Estado
✅ **Aceptado** - Implementado (Nov 2025)

### Contexto
Frontend tenía que hacer múltiples llamadas para operaciones comunes:
- Crear usuario → Asignar rol → Asignar sucursales = 3 llamadas
- Actualizar usuario → Actualizar rol → Actualizar sucursales = 3 llamadas

### Decisión
Crear endpoints que permitan operaciones completas en una sola llamada HTTP.

### Ejemplos

#### POST /api/seguridades/usuarios
```typescript
// UNA llamada hace todo
{
  "email": "nuevo@example.com",
  "password": "Password123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+593987654321",
  "companyId": "uuid",
  "roleId": "uuid-rol",        // Opcional
  "branchIds": ["uuid-suc"]    // Opcional
}
```

#### PUT /api/seguridades/usuarios/:id/completo
```typescript
// UNA llamada actualiza todo
{
  "firstName": "Juan Updated",
  "phone": "+593999888777",
  "roleId": "nuevo-rol-uuid",
  "branchIds": ["uuid-suc1", "uuid-suc2"]
}
```

### Ventajas
- ✅ Menos latencia (1 llamada vs 3)
- ✅ Menos posibilidades de error
- ✅ Transaccionalidad garantizada
- ✅ Código frontend más simple
- ✅ Mejor UX (operaciones más rápidas)

### Desventajas
- ⚠️ DTOs más complejos
- ⚠️ Validaciones más elaboradas
- ⚠️ Endpoints específicos siguen disponibles para casos puntuales

### Consecuencias
- Mantener ambos: endpoints específicos y completos
- Documentación clara de cuándo usar cada uno
- Testing más complejo

---

## ADR-006: Inclusión de Relaciones en Respuestas

### Estado
✅ **Aceptado** - Implementado (Nov 2025)

### Contexto
Frontend tenía que hacer llamadas adicionales para obtener relaciones:
```typescript
const user = await getUser(id);        // 1 llamada
const roles = await getUserRoles(id);  // 2 llamada
const branches = await getUserBranches(id); // 3 llamada
```

### Decisión
Incluir relaciones comunes automáticamente en las respuestas de consulta.

### Implementación

#### Antes
```json
GET /api/seguridades/usuarios/123
{
  "data": {
    "id": "123",
    "email": "user@example.com",
    "firstName": "Juan"
  }
}
```

#### Ahora
```json
GET /api/seguridades/usuarios/123
{
  "data": {
    "id": "123",
    "email": "user@example.com",
    "firstName": "Juan",
    "roles": [
      {
        "id": "uuid-rol",
        "name": "admin",
        "displayName": "Administrador"
      }
    ],
    "availableBranches": [...]
  }
}
```

### Reglas
1. **GET de colecciones**: Incluir relaciones básicas (roles)
2. **GET por ID**: Incluir todas las relaciones relevantes
3. **POST/PUT**: Retornar objeto completo con relaciones
4. **DELETE**: No incluir relaciones (solo confirmación)

### Relaciones Incluidas
- **Usuario**: roles, sucursales disponibles
- **Rol**: permisos (en endpoints específicos)
- **Empresa**: sucursales (en endpoints específicos)

### Ventajas
- ✅ Menos llamadas HTTP
- ✅ Datos consistentes
- ✅ Mejor performance percibida
- ✅ Código frontend más simple

### Desventajas
- ⚠️ Payloads más grandes
- ⚠️ Queries más complejas
- ⚠️ Posible over-fetching en algunos casos

### Consecuencias
- Endpoints específicos disponibles para casos donde no se necesiten relaciones
- Considerar paginación/lazy loading para relaciones grandes
- Documentar claramente qué relaciones se incluyen

---

## Decisiones Pendientes / Futuras

### En Consideración

#### PEND-001: Implementar Caché
**Contexto**: Algunas consultas se repiten frecuentemente (permisos, roles)  
**Opciones**: Redis, In-Memory Cache  
**Estado**: En evaluación

#### PEND-002: Migración a PostgreSQL
**Contexto**: SQLite es para desarrollo, necesitamos PostgreSQL para producción  
**Opciones**: PostgreSQL en Azure  
**Estado**: Planificado para Q1 2026

#### PEND-003: Rate Limiting
**Contexto**: Protección contra abuso de API  
**Opciones**: Nest Throttler, Redis  
**Estado**: En evaluación

---

## Proceso de ADR

### Cómo Proponer una Nueva Decisión

1. **Crear un issue** describiendo el problema
2. **Investigar alternativas** con pros/cons
3. **Discutir en equipo** las opciones
4. **Documentar la decisión** en este archivo
5. **Implementar** siguiendo la decisión
6. **Actualizar ADR** con estado final

### Estados Posibles
- 🟡 **Propuesto** - En discusión
- 🟢 **Aceptado** - Aprobado e implementado
- 🔴 **Rechazado** - No se implementará
- 🔵 **Obsoleto** - Reemplazado por otra decisión
- ⚪ **Supersedido** - Mejorado por ADR más reciente

---

## Referencias

- [Architecture Decision Records](https://adr.github.io/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [NestJS Documentation](https://docs.nestjs.com/)

