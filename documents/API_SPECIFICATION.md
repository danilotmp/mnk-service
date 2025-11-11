# API Specification - MNK Service

**Versión**: 1.2.0  
**Base URL**: `http://localhost:3000/api`  
**Última Actualización**: 10 de Noviembre, 2025

---

## Índice

1. [Autenticación](#autenticación)
2. [Gestión de Usuarios](#gestión-de-usuarios)
3. [Gestión de Roles](#gestión-de-roles)
4. [Gestión de Permisos](#gestión-de-permisos)
5. [Gestión de Empresas](#gestión-de-empresas)
6. [Gestión de Sucursales](#gestión-de-sucursales)
7. [Menú Dinámico](#menú-dinámico)
8. [Contexto del Usuario](#contexto-del-usuario)
9. [Estructuras de Datos](#estructuras-de-datos)
10. [Códigos de Error](#códigos-de-error)

---

## Convenciones Globales

### Headers Requeridos

#### Endpoints Públicos
```http
Content-Type: application/json
Accept-Language: es|en|pt  (opcional, default: es)
```

#### Endpoints Protegidos
```http
Authorization: Bearer {access_token}
Content-Type: application/json
Accept-Language: es|en|pt  (opcional, default: es)
```

### Formato de Respuesta Estándar

#### Respuesta Exitosa
```json
{
  "data": { ... },
  "result": {
    "statusCode": 200,
    "description": "Mensaje de éxito"
  }
}
```

#### Respuesta con Error
```json
{
  "data": null,
  "result": {
    "statusCode": 400,
    "description": "Mensaje de error",
    "details": {
      "error": "ERROR_CODE",
      "message": "Detalles adicionales"
    }
  }
}
```

### Paginación
```typescript
// Query params
{
  page?: number    // Default: 1
  limit?: number   // Default: 10, Max: 100
}

// Response
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

---

## Autenticación

### POST /seguridades/auth/login

Iniciar sesión y obtener tokens JWT.

#### Request
```http
POST /api/seguridades/auth/login
Content-Type: application/json

{
  "email": "admin@mnksolutions.com",
  "password": "Admin123!"
}
```

#### Response 200
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "admin@mnksolutions.com",
      "firstName": "Admin",
      "lastName": "User",
      "companyId": "uuid-empresa",
      "company": {
        "id": "uuid-empresa",
        "code": "MNK",
        "name": "MNK Solutions"
      },
      "currentBranchId": "uuid-sucursal",
      "availableBranches": [
        {
          "id": "uuid-sucursal",
          "code": "SUC001",
          "name": "Sucursal Centro",
          "type": "principal"
        }
      ]
    }
  },
  "result": {
    "statusCode": 200,
    "description": "Inicio de sesión exitoso"
  }
}
```

#### Errores
- `401` - Credenciales inválidas
- `403` - Usuario inactivo

---

### POST /seguridades/auth/register

Registrar un nuevo usuario.

#### Request
```http
POST /api/seguridades/auth/register
Content-Type: application/json

{
  "email": "nuevo@example.com",
  "password": "Password123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+593987654321",
  "companyId": "uuid-empresa"
}
```

#### Response 201
```json
{
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "id": "uuid-nuevo-usuario",
      "email": "nuevo@example.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "companyId": "uuid-empresa"
    }
  },
  "result": {
    "statusCode": 201,
    "description": "Registro exitoso"
  }
}
```

#### Errores
- `400` - Datos inválidos
- `409` - Email ya existe

---

### POST /seguridades/auth/refresh-token

Refrescar el access token.

#### Request
```http
POST /api/seguridades/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response 200
```json
{
  "data": {
    "accessToken": "nuevo-access-token..."
  },
  "result": {
    "statusCode": 200,
    "description": "Token refrescado exitosamente"
  }
}
```

---

### GET /seguridades/profile

Obtener perfil del usuario autenticado.

#### Request
```http
GET /api/seguridades/profile
Authorization: Bearer {token}
```

#### Response 200
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": "+593987654321",
    "companyId": "uuid-empresa",
    "isActive": true,
    "currentBranchId": "uuid-sucursal",
    "availableBranches": [...]
  },
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa"
  }
}
```

---

## Gestión de Usuarios

### GET /seguridades/usuarios

Obtener lista paginada de usuarios.

**Permiso Requerido**: `users.view`

#### Request
```http
GET /api/seguridades/usuarios?page=1&limit=10&search=juan&isActive=true
Authorization: Bearer {token}
```

#### Query Parameters
- `page` (number, optional): Página actual (default: 1)
- `limit` (number, optional): Items por página (default: 10, max: 100)
- `search` (string, optional): Búsqueda en email, firstName, lastName
- `isActive` (boolean, optional): Filtrar por estado activo
- `companyId` (uuid, optional): Filtrar por empresa

#### Response 200
```json
{
  "data": {
    "items": [
      {
        "id": "uuid-usuario",
        "email": "usuario@example.com",
        "firstName": "Juan",
        "lastName": "Pérez",
        "phone": "+593987654321",
        "companyId": "uuid-empresa",
        "isActive": true,
        "currentBranchId": "uuid-sucursal",
        "availableBranches": [
          {
            "id": "uuid-sucursal",
            "code": "SUC001",
            "name": "Sucursal Centro"
          }
        ],
        "roles": [
          {
            "id": "uuid-rol",
            "name": "admin",
            "displayName": "Administrador",
            "description": "Rol con todos los permisos",
            "assignedAt": "2024-01-01T10:00:00.000Z"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  },
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa"
  }
}
```

---

### GET /seguridades/usuarios/:id

Obtener un usuario por ID.

**Permiso Requerido**: `users.view`

#### Request
```http
GET /api/seguridades/usuarios/{uuid}
Authorization: Bearer {token}
```

#### Response 200
```json
{
  "data": {
    "id": "uuid-usuario",
    "email": "usuario@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": "+593987654321",
    "companyId": "uuid-empresa",
    "isActive": true,
    "currentBranchId": "uuid-sucursal",
    "availableBranches": [...],
    "roles": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa"
  }
}
```

#### Errores
- `404` - Usuario no encontrado

---

### POST /seguridades/usuarios

Crear un nuevo usuario.

**Permiso Requerido**: `users.create`

#### Request
```http
POST /api/seguridades/usuarios
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "nuevo@example.com",
  "password": "Password123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+593987654321",
  "companyId": "uuid-empresa",
  "roleId": "uuid-rol",
  "branchIds": ["uuid-sucursal-1", "uuid-sucursal-2"],
  "isActive": true
}
```

#### Campos
- `email` (string, required): Email único del usuario
- `password` (string, required): Contraseña (mín. 6 caracteres)
- `firstName` (string, required): Nombre
- `lastName` (string, required): Apellido
- `phone` (string, optional): Teléfono
- `companyId` (uuid, required): ID de la empresa
- `roleId` (uuid, optional): ID del rol a asignar
- `branchIds` (uuid[], optional): IDs de sucursales disponibles
- `isActive` (boolean, optional): Estado (default: true)

#### Response 201
```json
{
  "data": {
    "id": "uuid-nuevo-usuario",
    "email": "nuevo@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": "+593987654321",
    "companyId": "uuid-empresa",
    "isActive": true,
    "currentBranchId": "uuid-sucursal-1",
    "availableBranches": [
      {
        "id": "uuid-sucursal-1",
        "code": "SUC001",
        "name": "Sucursal Centro"
      }
    ],
    "roles": [
      {
        "id": "uuid-rol",
        "name": "admin",
        "displayName": "Administrador",
        "description": "Rol con todos los permisos",
        "assignedAt": "2024-11-10T15:30:00.000Z"
      }
    ],
    "createdAt": "2024-11-10T15:30:00.000Z",
    "updatedAt": "2024-11-10T15:30:00.000Z"
  },
  "result": {
    "statusCode": 201,
    "description": "Usuario creado exitosamente"
  }
}
```

#### Errores
- `400` - Datos inválidos
- `409` - Email ya existe
- `404` - Rol o sucursal no encontrada

---

### PUT /seguridades/usuarios/:id

Actualizar datos básicos de un usuario.

**Permiso Requerido**: `users.edit`

#### Request
```http
PUT /api/seguridades/usuarios/{uuid}
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Juan Actualizado",
  "lastName": "Pérez Actualizado",
  "phone": "+593999888777",
  "email": "nuevo-email@example.com",
  "isActive": true
}
```

#### Campos (todos opcionales)
- `email` (string): Nuevo email
- `password` (string): Nueva contraseña
- `firstName` (string): Nuevo nombre
- `lastName` (string): Nuevo apellido
- `phone` (string): Nuevo teléfono
- `companyId` (uuid): Nueva empresa
- `isActive` (boolean): Nuevo estado

#### Response 200
```json
{
  "data": {
    "id": "uuid-usuario",
    "email": "nuevo-email@example.com",
    "firstName": "Juan Actualizado",
    "lastName": "Pérez Actualizado",
    "phone": "+593999888777",
    "isActive": true,
    ...
  },
  "result": {
    "statusCode": 200,
    "description": "Recurso actualizado exitosamente"
  }
}
```

---

### PUT /seguridades/usuarios/:id/completo

⭐ **Endpoint TODO-EN-UNO** - Actualizar usuario completo (datos + rol + sucursales).

**Permiso Requerido**: `users.edit`

#### Request
```http
PUT /api/seguridades/usuarios/{uuid}/completo
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Juan Actualizado",
  "lastName": "Pérez Actualizado",
  "phone": "+593999888777",
  "email": "actualizado@example.com",
  "isActive": true,
  "roleId": "uuid-nuevo-rol",
  "branchIds": ["uuid-suc1", "uuid-suc2"]
}
```

#### Campos (todos opcionales)
- `email` (string): Nuevo email
- `password` (string): Nueva contraseña
- `firstName` (string): Nuevo nombre
- `lastName` (string): Nuevo apellido
- `phone` (string): Nuevo teléfono
- `companyId` (uuid): Nueva empresa
- `isActive` (boolean): Nuevo estado
- `roleId` (uuid): Nuevo rol (reemplaza el actual)
- `branchIds` (uuid[]): Nuevas sucursales (reemplaza las actuales)

#### Response 200
```json
{
  "data": {
    "id": "uuid-usuario",
    "email": "actualizado@example.com",
    "firstName": "Juan Actualizado",
    "lastName": "Pérez Actualizado",
    "phone": "+593999888777",
    "isActive": true,
    "currentBranchId": "uuid-suc1",
    "availableBranches": [
      {
        "id": "uuid-suc1",
        "code": "SUC001",
        "name": "Sucursal Centro"
      },
      {
        "id": "uuid-suc2",
        "code": "SUC002",
        "name": "Sucursal Norte"
      }
    ],
    "roles": [
      {
        "id": "uuid-nuevo-rol",
        "name": "manager",
        "displayName": "Gerente",
        "description": "Rol de gerente",
        "assignedAt": "2024-11-10T16:00:00.000Z"
      }
    ],
    ...
  },
  "result": {
    "statusCode": 200,
    "description": "Recurso actualizado exitosamente"
  }
}
```

#### Notas
- **Ventaja**: Una sola llamada actualiza todo
- **Uso típico**: Formularios de edición de usuarios
- **Transaccional**: Si falla algo, no se actualiza nada

---

### DELETE /seguridades/usuarios/:id

Eliminar un usuario (soft delete).

**Permiso Requerido**: `users.delete`

#### Request
```http
DELETE /api/seguridades/usuarios/{uuid}
Authorization: Bearer {token}
```

#### Response 200
```json
{
  "data": {
    "id": "uuid-usuario",
    "message": "Usuario eliminado exitosamente"
  },
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa"
  }
}
```

---

### GET /seguridades/usuarios/:id/roles

Obtener roles asignados a un usuario.

**Permiso Requerido**: `users.view`

#### Request
```http
GET /api/seguridades/usuarios/{uuid}/roles
Authorization: Bearer {token}
```

#### Response 200
```json
{
  "data": [
    {
      "id": "uuid-rol",
      "name": "admin",
      "displayName": "Administrador",
      "description": "Rol con todos los permisos",
      "isActive": true,
      "assignedAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa"
  }
}
```

---

### GET /seguridades/usuarios/:id/sucursales

Obtener sucursales disponibles para un usuario.

**Permiso Requerido**: `users.view`

#### Request
```http
GET /api/seguridades/usuarios/{uuid}/sucursales
Authorization: Bearer {token}
```

#### Response 200
```json
{
  "data": {
    "currentBranchId": "uuid-sucursal-1",
    "availableBranches": [
      {
        "id": "uuid-sucursal-1",
        "code": "SUC001",
        "name": "Sucursal Centro"
      },
      {
        "id": "uuid-sucursal-2",
        "code": "SUC002",
        "name": "Sucursal Norte"
      }
    ]
  },
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa"
  }
}
```

---

## Gestión de Roles

### GET /seguridades/roles

Obtener lista paginada de roles.

**Permiso Requerido**: `roles.view`

#### Request
```http
GET /api/seguridades/roles?page=1&limit=10&isActive=true
Authorization: Bearer {token}
```

#### Query Parameters
- `page` (number, optional)
- `limit` (number, optional)
- `isActive` (boolean, optional): Filtrar por estado activo
- `name` (string, optional): Filtrar por nombre

#### Response 200
```json
{
  "data": {
    "items": [
      {
        "id": "uuid-rol",
        "name": "admin",
        "displayName": "Administrador",
        "description": "Rol con todos los permisos",
        "isSystem": true,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  },
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa"
  }
}
```

---

### GET /seguridades/roles/:id

Obtener un rol por ID.

**Permiso Requerido**: `roles.view`

#### Request
```http
GET /api/seguridades/roles/{uuid}
Authorization: Bearer {token}
```

#### Response 200
```json
{
  "data": {
    "id": "uuid-rol",
    "name": "admin",
    "displayName": "Administrador",
    "description": "Rol con todos los permisos del sistema",
    "isSystem": true,
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

---

### POST /seguridades/roles

Crear un nuevo rol.

**Permiso Requerido**: `roles.create`

#### Request
```http
POST /api/seguridades/roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "manager",
  "displayName": "Gerente",
  "description": "Rol de gerente de sucursal",
  "isActive": true
}
```

#### Campos
- `name` (string, required): Nombre único del rol (slug)
- `displayName` (string, required): Nombre para mostrar
- `description` (string, optional): Descripción del rol
- `isActive` (boolean, optional): Estado (default: true)

#### Response 201
```json
{
  "data": {
    "id": "uuid-nuevo-rol",
    "name": "manager",
    "displayName": "Gerente",
    "description": "Rol de gerente de sucursal",
    "isSystem": false,
    "isActive": true,
    "createdAt": "2024-11-10T16:00:00.000Z",
    "updatedAt": "2024-11-10T16:00:00.000Z"
  },
  "result": {
    "statusCode": 201,
    "description": "Rol creado exitosamente"
  }
}
```

---

### PUT /seguridades/roles/:id

Actualizar un rol.

**Permiso Requerido**: `roles.edit`

#### Request
```http
PUT /api/seguridades/roles/{uuid}
Authorization: Bearer {token}
Content-Type: application/json

{
  "displayName": "Gerente General",
  "description": "Gerente con permisos extendidos",
  "isActive": true
}
```

#### Campos (todos opcionales)
- `name` (string): Nuevo nombre (slug)
- `displayName` (string): Nuevo nombre para mostrar
- `description` (string): Nueva descripción
- `isActive` (boolean): Nuevo estado

**Nota**: No se pueden modificar roles del sistema (`isSystem: true`)

---

### DELETE /seguridades/roles/:id

Eliminar un rol (soft delete).

**Permiso Requerido**: `roles.delete`

#### Request
```http
DELETE /api/seguridades/roles/{uuid}
Authorization: Bearer {token}
```

**Nota**: No se pueden eliminar roles del sistema

---

## Gestión de Permisos

### GET /seguridades/permisos

Obtener lista paginada de permisos.

**Permiso Requerido**: `permissions.view`

#### Request
```http
GET /api/seguridades/permisos?page=1&limit=10
Authorization: Bearer {token}
```

#### Response 200
```json
{
  "data": {
    "items": [
      {
        "id": "uuid-permiso",
        "code": "users.view",
        "name": "Ver Usuarios",
        "description": "Permite ver la lista de usuarios",
        "category": "users",
        "isSystem": true,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### GET /seguridades/permisos/:id

Obtener un permiso por ID.

**Permiso Requerido**: `permissions.view`

---

### POST /seguridades/permisos

Crear un nuevo permiso.

**Permiso Requerido**: `permissions.manage`

---

### PUT /seguridades/permisos/:id

Actualizar un permiso.

**Permiso Requerido**: `permissions.manage`

---

### DELETE /seguridades/permisos/:id

Eliminar un permiso.

**Permiso Requerido**: `permissions.manage`

---

## Gestión de Empresas

### GET /seguridades/admin/empresas

Obtener lista paginada de empresas.

**Permiso Requerido**: `companies.view`

---

### GET /seguridades/admin/empresas/:id

Obtener una empresa por ID.

**Permiso Requerido**: `companies.view`

---

### POST /seguridades/admin/empresas

Crear una nueva empresa.

**Permiso Requerido**: `companies.create`

---

### PUT /seguridades/admin/empresas/:id

Actualizar una empresa.

**Permiso Requerido**: `companies.edit`

---

### DELETE /seguridades/admin/empresas/:id

Eliminar una empresa.

**Permiso Requerido**: `companies.delete`

---

## Gestión de Sucursales

### GET /seguridades/admin/sucursales

Obtener lista paginada de sucursales.

**Permiso Requerido**: `branches.view`

---

### GET /seguridades/admin/sucursales/empresa/:companyId

Obtener sucursales de una empresa específica.

**Permiso Requerido**: `branches.view`

---

### POST /seguridades/admin/sucursales

Crear una nueva sucursal.

**Permiso Requerido**: `branches.create`

---

### PUT /seguridades/admin/sucursales/:id

Actualizar una sucursal.

**Permiso Requerido**: `branches.edit`

---

### DELETE /seguridades/admin/sucursales/:id

Eliminar una sucursal.

**Permiso Requerido**: `branches.delete`

---

## Menú Dinámico

### GET /seguridades/menu

Obtener menú dinámico según permisos del usuario.

**Autenticación Requerida**: Sí  
**Permisos**: No requiere permisos específicos

#### Request
```http
GET /api/seguridades/menu
Authorization: Bearer {token}
Accept-Language: es
```

#### Response 200
```json
{
  "data": [
    {
      "id": "dashboard",
      "label": "Dashboard",
      "icon": "home",
      "route": "/dashboard",
      "order": 1,
      "isPublic": true
    },
    {
      "id": "users",
      "label": "Usuarios",
      "icon": "users",
      "route": "/security/users",
      "order": 2,
      "isPublic": false,
      "requiredPermissions": ["users.view"]
    }
  ],
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa"
  }
}
```

**Nota**: Solo retorna items para los cuales el usuario tiene permisos.

---

## Contexto del Usuario

### GET /auth/me/companies

Obtener empresas disponibles para el usuario autenticado.

**Autenticación Requerida**: Sí  
**Permisos**: No requiere

#### Request
```http
GET /api/auth/me/companies
Authorization: Bearer {token}
```

#### Response 200
```json
{
  "data": [
    {
      "id": "uuid-empresa",
      "code": "MNK",
      "name": "MNK Solutions",
      "isActive": true
    }
  ],
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa"
  }
}
```

---

### GET /auth/me/companies/:id

Obtener detalles de una empresa del usuario.

**Autenticación Requerida**: Sí  
**Permisos**: No requiere

---

### GET /auth/me/branches

Obtener sucursales disponibles para el usuario autenticado.

**Autenticación Requerida**: Sí  
**Permisos**: No requiere

---

## Estructuras de Datos

### Usuario (User)
```typescript
{
  id: string;                    // UUID
  email: string;                 // Email único
  firstName: string;             // Nombre
  lastName: string;              // Apellido
  phone?: string;                // Teléfono (opcional)
  companyId: string;             // UUID de empresa
  isActive: boolean;             // Estado
  currentBranchId: string;       // UUID sucursal actual
  availableBranches: Branch[];   // Sucursales disponibles
  roles: Role[];                 // Roles asignados
  createdAt: Date;
  updatedAt: Date;
}
```

### Rol (Role)
```typescript
{
  id: string;                    // UUID
  name: string;                  // Slug único (ej: "admin")
  displayName: string;           // Nombre para mostrar
  description: string;           // Descripción
  isSystem: boolean;             // Rol del sistema
  isActive: boolean;             // Estado
  createdAt: Date;
  updatedAt: Date;
}
```

### Permiso (Permission)
```typescript
{
  id: string;                    // UUID
  code: string;                  // Código único (ej: "users.view")
  name: string;                  // Nombre para mostrar
  description: string;           // Descripción
  category: string;              // Categoría (users, roles, etc)
  isSystem: boolean;             // Permiso del sistema
  isActive: boolean;             // Estado
  createdAt: Date;
}
```

### Empresa (Company)
```typescript
{
  id: string;                    // UUID
  code: string;                  // Código único
  name: string;                  // Nombre de la empresa
  isActive: boolean;             // Estado
  createdAt: Date;
  updatedAt: Date;
}
```

### Sucursal (Branch)
```typescript
{
  id: string;                    // UUID
  code: string;                  // Código único
  name: string;                  // Nombre de la sucursal
  type: string;                  // principal | secundaria
  companyId: string;             // UUID de empresa
  isActive: boolean;             // Estado
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Códigos de Error

### Errores de Autenticación (401)
- `INVALID_CREDENTIALS` - Credenciales inválidas
- `TOKEN_EXPIRED` - Token expirado
- `TOKEN_INVALID` - Token inválido
- `UNAUTHORIZED` - No autenticado

### Errores de Autorización (403)
- `FORBIDDEN` - Sin permisos
- `INSUFFICIENT_PERMISSIONS` - Permisos insuficientes
- `USER_INACTIVE` - Usuario inactivo

### Errores de Validación (400)
- `VALIDATION_ERROR` - Error de validación general
- `INVALID_EMAIL` - Email inválido
- `PASSWORD_TOO_SHORT` - Contraseña muy corta
- `BUSINESS_RULE_VIOLATION` - Violación de regla de negocio

### Errores de Recursos (404)
- `NOT_FOUND` - Recurso no encontrado
- `USER_NOT_FOUND` - Usuario no encontrado
- `ROLE_NOT_FOUND` - Rol no encontrado
- `COMPANY_NOT_FOUND` - Empresa no encontrada
- `BRANCH_NOT_FOUND` - Sucursal no encontrada

### Errores de Conflicto (409)
- `EMAIL_EXISTS` - Email ya existe
- `RESOURCE_CONFLICT` - Conflicto de recursos

### Errores del Servidor (500)
- `INTERNAL_ERROR` - Error interno del servidor

---

## Notas Importantes

### Sobre Paginación
- El límite máximo por página es 100 items
- Si no se especifica, se usa `page=1` y `limit=10`
- El total de páginas se calcula automáticamente

### Sobre Permisos
- Los permisos se evalúan en cada request
- Un usuario puede tener múltiples roles
- Los permisos son acumulativos (OR lógico)

### Sobre Soft Delete
- Los recursos "eliminados" solo se marcan como inactivos
- Pueden ser reactivados por administradores
- No se eliminan físicamente de la base de datos

### Sobre Transacciones
- Los endpoints TODO-EN-UNO son transaccionales
- Si falla alguna parte, no se guarda nada
- Garantiza consistencia de datos

---

## Versionamiento

Esta API sigue versionamiento semántico (SemVer):
- **Major**: Cambios incompatibles
- **Minor**: Nuevas funcionalidades compatibles
- **Patch**: Correcciones de bugs

**Versión Actual**: 1.2.0

---

## Soporte

Para más información:
- **Swagger UI**: http://localhost:3000/api
- **Postman Collection**: Ver `MNK_Service_API.postman_collection.json`
- **Documentación ADR**: Ver `ADR.md`

