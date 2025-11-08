# 🏢 Endpoints de Empresas y Sucursales

Esta guía documenta todos los endpoints para la gestión de empresas y sucursales en el sistema multiempresa.

## 📋 Índice

- [Empresas (Companies)](#-empresas-companies)
- [Sucursales (Branches)](#-sucursales-branches)
- [Permisos Requeridos](#-permisos-requeridos)
- [Ejemplos de Uso](#-ejemplos-de-uso)

---

## 🏢 Empresas (Companies)

Base URL: `/api/seguridades/empresas`

### 1. Listar Empresas (Paginado)

**Endpoint:** `GET /api/seguridades/empresas`

**Autenticación:** ✅ Requerida (Bearer Token)

**Permiso:** `companies.view`

**Query Parameters:**
- `page` (number, opcional): Número de página (default: 1)
- `limit` (number, opcional): Elementos por página (default: 10)
- `search` (string, opcional): Búsqueda global en código, nombre y email
- `code` (string, opcional): Filtro específico por código
- `name` (string, opcional): Filtro específico por nombre
- `email` (string, opcional): Filtro específico por email
- `isActive` (boolean, opcional): Filtro por estado activo

**Ejemplo Request:**
```bash
GET /api/seguridades/empresas?page=1&limit=10&search=empresa&isActive=true
Authorization: Bearer {token}
```

**Ejemplo Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid-empresa",
        "code": "COMP001",
        "name": "Mi Empresa S.A.",
        "description": "Empresa de servicios",
        "email": "contacto@empresa.com",
        "address": {
          "street": "Av. Principal 123",
          "city": "Quito",
          "country": "Ecuador"
        },
        "settings": {
          "timezone": "America/Guayaquil",
          "currency": "USD"
        },
        "subscriptionPlan": {
          "plan": "premium",
          "features": ["feature1", "feature2"]
        },
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "itemsPerPage": 10,
      "totalItems": 50,
      "totalPages": 5
    }
  },
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa"
  }
}
```

### 2. Obtener Empresa por ID

**Endpoint:** `GET /api/seguridades/empresas/:id`

**Autenticación:** ✅ Requerida (Bearer Token)

**Permiso:** `companies.view`

**Ejemplo Request:**
```bash
GET /api/seguridades/empresas/uuid-empresa
Authorization: Bearer {token}
```

**Ejemplo Response:**
```json
{
  "data": {
    "id": "uuid-empresa",
    "code": "COMP001",
    "name": "Mi Empresa S.A.",
    "description": "Empresa de servicios",
    "email": "contacto@empresa.com",
    "address": {
      "street": "Av. Principal 123",
      "city": "Quito",
      "country": "Ecuador"
    },
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa"
  }
}
```

### 3. Crear Empresa

**Endpoint:** `POST /api/seguridades/empresas`

**Autenticación:** ✅ Requerida (Bearer Token)

**Permiso:** `companies.create`

**Body Parameters:**
```json
{
  "code": "COMP001",                    // Requerido, único
  "name": "Mi Empresa S.A.",            // Requerido
  "description": "Empresa de servicios", // Opcional
  "email": "contacto@empresa.com",      // Requerido
  "address": {                          // Opcional
    "street": "Av. Principal 123",
    "city": "Quito",
    "country": "Ecuador"
  },
  "settings": {                         // Opcional
    "timezone": "America/Guayaquil",
    "currency": "USD"
  },
  "subscriptionPlan": {                 // Opcional
    "plan": "premium",
    "features": ["feature1", "feature2"]
  },
  "isActive": true                      // Opcional, default: true
}
```

**Ejemplo Request:**
```bash
POST /api/seguridades/empresas
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "COMP001",
  "name": "Mi Empresa S.A.",
  "email": "contacto@empresa.com",
  "isActive": true
}
```

**Ejemplo Response:**
```json
{
  "data": {
    "id": "uuid-empresa",
    "code": "COMP001",
    "name": "Mi Empresa S.A.",
    "email": "contacto@empresa.com",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "result": {
    "statusCode": 201,
    "description": "Recurso creado exitosamente"
  }
}
```

### 4. Actualizar Empresa

**Endpoint:** `PUT /api/seguridades/empresas/:id`

**Autenticación:** ✅ Requerida (Bearer Token)

**Permiso:** `companies.edit`

**Body Parameters:** (todos opcionales)
```json
{
  "code": "COMP001",
  "name": "Mi Empresa S.A. Actualizada",
  "description": "Nueva descripción",
  "email": "nuevo@empresa.com",
  "address": { ... },
  "settings": { ... },
  "subscriptionPlan": { ... },
  "isActive": true
}
```

**Ejemplo Request:**
```bash
PUT /api/seguridades/empresas/uuid-empresa
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Mi Empresa S.A. Actualizada",
  "email": "nuevo@empresa.com"
}
```

### 5. Eliminar Empresa (Soft Delete)

**Endpoint:** `DELETE /api/seguridades/empresas/:id`

**Autenticación:** ✅ Requerida (Bearer Token)

**Permiso:** `companies.delete`

**Ejemplo Request:**
```bash
DELETE /api/seguridades/empresas/uuid-empresa
Authorization: Bearer {token}
```

**Ejemplo Response:**
```json
{
  "data": {
    "id": "uuid-empresa",
    "message": "Empresa eliminada exitosamente"
  },
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa"
  }
}
```

---

## 🏪 Sucursales (Branches)

Base URL: `/api/seguridades/sucursales`

### 1. Listar Sucursales (Paginado)

**Endpoint:** `GET /api/seguridades/sucursales`

**Autenticación:** ✅ Requerida (Bearer Token)

**Permiso:** `branches.view`

**Query Parameters:**
- `page` (number, opcional): Número de página (default: 1)
- `limit` (number, opcional): Elementos por página (default: 10)
- `companyId` (string, opcional): Filtro por empresa
- `search` (string, opcional): Búsqueda global en código y nombre
- `code` (string, opcional): Filtro específico por código
- `name` (string, opcional): Filtro específico por nombre
- `type` (string, opcional): Filtro por tipo (headquarters, branch, warehouse, store)
- `isActive` (boolean, opcional): Filtro por estado activo

**Ejemplo Request:**
```bash
GET /api/seguridades/sucursales?page=1&limit=10&companyId=uuid-empresa&isActive=true
Authorization: Bearer {token}
```

**Ejemplo Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid-sucursal",
        "companyId": "uuid-empresa",
        "code": "SUC001",
        "name": "Sucursal Centro",
        "type": "headquarters",
        "address": {
          "street": "Av. Central 456",
          "city": "Guayaquil",
          "country": "Ecuador"
        },
        "contactInfo": {
          "phone": "0987654321",
          "email": "sucursal@empresa.com"
        },
        "settings": {
          "openHours": "08:00-18:00",
          "maxCapacity": 100
        },
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "company": {
          "id": "uuid-empresa",
          "code": "COMP001",
          "name": "Mi Empresa S.A."
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "itemsPerPage": 10,
      "totalItems": 25,
      "totalPages": 3
    }
  },
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa"
  }
}
```

### 2. Obtener Sucursales por Empresa

**Endpoint:** `GET /api/seguridades/sucursales/empresa/:companyId`

**Autenticación:** ✅ Requerida (Bearer Token)

**Permiso:** `branches.view`

**Ejemplo Request:**
```bash
GET /api/seguridades/sucursales/empresa/uuid-empresa
Authorization: Bearer {token}
```

**Ejemplo Response:**
```json
{
  "data": [
    {
      "id": "uuid-sucursal-1",
      "companyId": "uuid-empresa",
      "code": "SUC001",
      "name": "Sucursal Centro",
      "type": "headquarters",
      "isActive": true,
      "company": { ... }
    },
    {
      "id": "uuid-sucursal-2",
      "companyId": "uuid-empresa",
      "code": "SUC002",
      "name": "Sucursal Norte",
      "type": "branch",
      "isActive": true,
      "company": { ... }
    }
  ],
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa"
  }
}
```

### 3. Obtener Sucursal por ID

**Endpoint:** `GET /api/seguridades/sucursales/:id`

**Autenticación:** ✅ Requerida (Bearer Token)

**Permiso:** `branches.view`

**Ejemplo Request:**
```bash
GET /api/seguridades/sucursales/uuid-sucursal
Authorization: Bearer {token}
```

### 4. Crear Sucursal

**Endpoint:** `POST /api/seguridades/sucursales`

**Autenticación:** ✅ Requerida (Bearer Token)

**Permiso:** `branches.create`

**Body Parameters:**
```json
{
  "companyId": "uuid-empresa",          // Requerido
  "code": "SUC001",                     // Requerido, único
  "name": "Sucursal Centro",            // Requerido
  "type": "headquarters",               // Opcional (headquarters, branch, warehouse, store)
  "address": {                          // Opcional
    "street": "Av. Central 456",
    "city": "Guayaquil",
    "country": "Ecuador"
  },
  "contactInfo": {                      // Opcional
    "phone": "0987654321",
    "email": "sucursal@empresa.com"
  },
  "settings": {                         // Opcional
    "openHours": "08:00-18:00",
    "maxCapacity": 100
  },
  "isActive": true                      // Opcional, default: true
}
```

**Ejemplo Request:**
```bash
POST /api/seguridades/sucursales
Authorization: Bearer {token}
Content-Type: application/json

{
  "companyId": "uuid-empresa",
  "code": "SUC001",
  "name": "Sucursal Centro",
  "type": "headquarters",
  "isActive": true
}
```

### 5. Actualizar Sucursal

**Endpoint:** `PUT /api/seguridades/sucursales/:id`

**Autenticación:** ✅ Requerida (Bearer Token)

**Permiso:** `branches.edit`

**Body Parameters:** (todos opcionales)
```json
{
  "companyId": "uuid-empresa",
  "code": "SUC001",
  "name": "Sucursal Centro Actualizada",
  "type": "branch",
  "address": { ... },
  "contactInfo": { ... },
  "settings": { ... },
  "isActive": true
}
```

### 6. Eliminar Sucursal (Soft Delete)

**Endpoint:** `DELETE /api/seguridades/sucursales/:id`

**Autenticación:** ✅ Requerida (Bearer Token)

**Permiso:** `branches.delete`

**Ejemplo Request:**
```bash
DELETE /api/seguridades/sucursales/uuid-sucursal
Authorization: Bearer {token}
```

---

## 🔐 Permisos Requeridos

### Empresas
| Acción | Permiso |
|--------|---------|
| Ver empresas | `companies.view` |
| Crear empresa | `companies.create` |
| Editar empresa | `companies.edit` |
| Eliminar empresa | `companies.delete` |

### Sucursales
| Acción | Permiso |
|--------|---------|
| Ver sucursales | `branches.view` |
| Crear sucursal | `branches.create` |
| Editar sucursal | `branches.edit` |
| Eliminar sucursal | `branches.delete` |

---

## 🎯 Ejemplos de Uso

### Caso 1: Crear Empresa con Sucursal

```bash
# 1. Crear la empresa
POST /api/seguridades/empresas
{
  "code": "COMP001",
  "name": "Mi Empresa S.A.",
  "email": "contacto@empresa.com"
}

# Respuesta: { "data": { "id": "empresa-uuid", ... } }

# 2. Crear sucursal para esa empresa
POST /api/seguridades/sucursales
{
  "companyId": "empresa-uuid",
  "code": "SUC001",
  "name": "Sucursal Principal",
  "type": "headquarters"
}
```

### Caso 2: Listar Sucursales de una Empresa

```bash
# Opción 1: Endpoint específico
GET /api/seguridades/sucursales/empresa/empresa-uuid

# Opción 2: Con paginación y filtros
GET /api/seguridades/sucursales?companyId=empresa-uuid&page=1&limit=10
```

### Caso 3: Buscar Empresas

```bash
# Búsqueda global
GET /api/seguridades/empresas?search=empresa

# Búsqueda por código específico
GET /api/seguridades/empresas?code=COMP001

# Solo empresas activas
GET /api/seguridades/empresas?isActive=true
```

### Caso 4: Filtrar Sucursales por Tipo

```bash
# Solo sucursales tipo "headquarters"
GET /api/seguridades/sucursales?type=headquarters

# Sucursales activas de tipo "branch"
GET /api/seguridades/sucursales?type=branch&isActive=true
```

---

## 📝 Notas Importantes

1. **Soft Delete**: La eliminación de empresas y sucursales es lógica (soft delete), solo cambia `isActive` a `false`.

2. **Validaciones**:
   - Los códigos (`code`) deben ser únicos en todo el sistema.
   - El email de la empresa debe ser válido.
   - El `companyId` debe existir al crear una sucursal.

3. **Relaciones**:
   - Las sucursales incluyen información de su empresa en las consultas (eager loading).
   - Al listar sucursales, se incluye el objeto `company` con datos básicos.

4. **Tipos de Sucursal** (`type`):
   - `headquarters`: Casa matriz
   - `branch`: Sucursal
   - `warehouse`: Bodega
   - `store`: Tienda

5. **Campos JSON**:
   - `address`, `settings`, `contactInfo`, `subscriptionPlan` son objetos JSON flexibles.
   - Puedes almacenar cualquier estructura que necesites.

---

## 🔄 Integración con Usuarios

Los usuarios están asociados a una empresa mediante el campo `companyId`:

```typescript
// Al crear un usuario
{
  "email": "usuario@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "companyId": "uuid-empresa"  // ← Asociado a empresa
}
```

Los usuarios también pueden tener acceso a sucursales específicas mediante `availableBranches`.

---

**¿Necesitas más información?** Revisa el Swagger en `http://localhost:3000/api` para ver la documentación interactiva. 🚀


