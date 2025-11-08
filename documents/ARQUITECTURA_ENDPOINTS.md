# 🏗️ Arquitectura de Endpoints - Modelo de 3 Niveles

Este documento describe la arquitectura de endpoints implementada en el sistema, diseñada para **balancear seguridad con usabilidad**.

## 📊 Filosofía de Diseño

### Problema que Resolvemos

❌ **Antes**: Sistema sobre-restrictivo
- Usuario necesitaba permisos administrativos para ver su propia empresa
- Cambiar de sucursal requería permisos especiales
- Mala experiencia de usuario (UX)
- Permisos innecesarios para operaciones básicas

✅ **Ahora**: Sistema balanceado
- Usuario accede a SU contexto sin permisos especiales
- Administrador gestiona TODO el sistema con permisos
- Mejor UX manteniendo seguridad

## 🎯 Modelo de 3 Niveles

```
┌─────────────────────────────────────────────────────────────┐
│ NIVEL 1: Endpoints de CONTEXTO (Usuario Autenticado)       │
│ Prefijo: /api/auth/me/*                                    │
│ → Solo requiere JWT válido                                  │
│ → Usuario solo ve SUS datos                                 │
│ → Sin permisos administrativos                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ NIVEL 2: Endpoints ADMINISTRATIVOS (Lectura)               │
│ Prefijo: /api/seguridades/admin/*                          │
│ → Requiere JWT + Permiso *.view                            │
│ → Ver TODO el sistema                                       │
│ → Solo para administradores                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ NIVEL 3: Endpoints ADMINISTRATIVOS (Escritura)             │
│ Prefijo: /api/seguridades/admin/*                          │
│ → Requiere JWT + Permisos específicos                       │
│ → Crear/Editar/Eliminar recursos                            │
│ → Solo para administradores                                 │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Regla de Oro

```typescript
/**
 * MATRIZ DE DECISIÓN DE PERMISOS
 * 
 * ┌──────────────┬──────────────────┬──────────────────────┐
 * │ Operación    │ Ámbito           │ Requiere Permiso     │
 * ├──────────────┼──────────────────┼──────────────────────┤
 * │ GET          │ Mis recursos     │ NO (solo JWT)        │
 * │ GET          │ Mi contexto      │ NO (solo JWT)        │
 * │ GET          │ Todo el sistema  │ SÍ (*.view)          │
 * │ POST/PUT     │ Cualquier cosa   │ SÍ (*.create/edit)   │
 * │ DELETE       │ Cualquier cosa   │ SÍ (*.delete)        │
 * └──────────────┴──────────────────┴──────────────────────┘
 */
```

## 🔐 NIVEL 1: Endpoints de Contexto

### Base URL: `/api/auth/me`

**Características:**
- ✅ Solo requiere estar autenticado (JWT válido)
- ✅ Usuario solo accede a SUS recursos
- ✅ Sin permisos administrativos
- ✅ Respuesta inmediata sin configuración

### Endpoints Disponibles:

#### 1. Mis Empresas

```http
GET /api/auth/me/companies
Authorization: Bearer {token}
```

**Uso:** Ver las empresas a las que tengo acceso.

**Respuesta:**
```json
{
  "data": [
    {
      "id": "uuid-empresa",
      "code": "COMP001",
      "name": "Mi Empresa S.A.",
      "isActive": true
    }
  ],
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa"
  }
}
```

#### 2. Mi Empresa Específica

```http
GET /api/auth/me/companies/:id
Authorization: Bearer {token}
```

**Validación:** Solo puedo ver empresas a las que tengo acceso.

#### 3. Mis Sucursales

```http
GET /api/auth/me/branches
Authorization: Bearer {token}
```

**Uso:** Ver las sucursales de mi empresa para dropdown de cambio de contexto.

#### 4. Mi Sucursal Específica

```http
GET /api/auth/me/branches/:id
Authorization: Bearer {token}
```

**Validación:** Solo puedo ver sucursales de mi empresa.

#### 5. Cambiar Sucursal

```http
POST /api/auth/me/switch-branch
Authorization: Bearer {token}
Content-Type: application/json

{
  "branchId": "uuid-sucursal"
}
```

**Uso:** Cambiar mi contexto de sucursal actual.

---

## 🔧 NIVEL 2 y 3: Endpoints Administrativos

### Base URL: `/api/seguridades/admin`

**Características:**
- ✅ Requiere JWT + Permisos específicos
- ✅ Acceso a TODO el sistema
- ✅ Solo para usuarios con rol de administrador

### Endpoints Disponibles:

#### Empresas (Administrativo)

| Método | Endpoint | Permiso Requerido | Descripción |
|--------|----------|-------------------|-------------|
| GET | `/admin/empresas` | `companies.view` | Listar TODAS las empresas |
| GET | `/admin/empresas/:id` | `companies.view` | Ver cualquier empresa |
| POST | `/admin/empresas` | `companies.create` | Crear empresa |
| PUT | `/admin/empresas/:id` | `companies.edit` | Editar empresa |
| DELETE | `/admin/empresas/:id` | `companies.delete` | Eliminar empresa |

#### Sucursales (Administrativo)

| Método | Endpoint | Permiso Requerido | Descripción |
|--------|----------|-------------------|-------------|
| GET | `/admin/sucursales` | `branches.view` | Listar TODAS las sucursales |
| GET | `/admin/sucursales/empresa/:companyId` | `branches.view` | Sucursales de cualquier empresa |
| GET | `/admin/sucursales/:id` | `branches.view` | Ver cualquier sucursal |
| POST | `/admin/sucursales` | `branches.create` | Crear sucursal |
| PUT | `/admin/sucursales/:id` | `branches.edit` | Editar sucursal |
| DELETE | `/admin/sucursales/:id` | `branches.delete` | Eliminar sucursal |

---

## 💡 Casos de Uso

### Caso 1: Usuario Normal - Login y Dropdown

**Flujo:**
1. Usuario hace login
2. Response incluye empresa y sucursales automáticamente
3. Frontend muestra dropdown con sucursales disponibles
4. Usuario cambia de sucursal con `/api/auth/me/switch-branch`

**Sin permisos administrativos requeridos** ✅

```typescript
// 1. Login
POST /api/seguridades/auth/login
{
  "email": "usuario@empresa.com",
  "password": "pass123"
}

// Response incluye TODO:
{
  "accessToken": "...",
  "user": {
    "id": "...",
    "company": {
      "id": "...",
      "name": "Mi Empresa S.A."  // ← Listo para mostrar
    },
    "availableBranches": [  // ← Listo para dropdown
      {
        "id": "...",
        "name": "Sucursal Centro"
      },
      {
        "id": "...",
        "name": "Sucursal Norte"
      }
    ]
  }
}

// 2. Usuario cambia de sucursal
POST /api/auth/me/switch-branch
{
  "branchId": "uuid-sucursal-norte"
}
```

### Caso 2: Administrador - Gestión Completa

**Flujo:**
1. Admin hace login (tiene permisos `companies.*` y `branches.*`)
2. Puede usar `/api/auth/me/*` para su contexto
3. Puede usar `/api/seguridades/admin/*` para administrar

```typescript
// Ver todas las empresas del sistema
GET /api/seguridades/admin/empresas?page=1&limit=10

// Crear nueva empresa
POST /api/seguridades/admin/empresas
{
  "code": "NEWCOMP",
  "name": "Nueva Empresa",
  "email": "contacto@nueva.com"
}

// Ver todas las sucursales del sistema
GET /api/seguridades/admin/sucursales?page=1&limit=10
```

---

## 🔄 Response Mejorado del Login

El login ahora devuelve información completa:

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid-usuario",
      "email": "usuario@empresa.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "companyId": "uuid-empresa",
      "company": {
        "id": "uuid-empresa",
        "code": "COMP001",
        "name": "Mi Empresa S.A.",
        "isActive": true
      },
      "currentBranchId": "uuid-sucursal-actual",
      "availableBranches": [
        {
          "id": "uuid-sucursal-1",
          "code": "SUC001",
          "name": "Sucursal Centro",
          "type": "headquarters",
          "companyId": "uuid-empresa",
          "isActive": true
        },
        {
          "id": "uuid-sucursal-2",
          "code": "SUC002",
          "name": "Sucursal Norte",
          "type": "branch",
          "companyId": "uuid-empresa",
          "isActive": true
        }
      ],
      "availableCompanies": [
        {
          "id": "uuid-empresa",
          "code": "COMP001",
          "name": "Mi Empresa S.A.",
          "isActive": true
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

**Ventajas:**
- ✅ Frontend tiene toda la info necesaria inmediatamente
- ✅ No necesita hacer queries adicionales
- ✅ Usuario ve nombres, no IDs
- ✅ Preparado para multi-empresa futura

---

## 🎨 Comparación: Antes vs Ahora

### ❌ ANTES (Sobre-restrictivo)

```typescript
// Usuario normal intenta ver su empresa
GET /api/seguridades/empresas/:id
❌ Error 403: Requiere permiso companies.view

// Usuario normal intenta cambiar de sucursal
// No tiene endpoint para esto
❌ No hay forma de hacerlo sin permisos administrativos
```

### ✅ AHORA (Balanceado)

```typescript
// Usuario normal ve su empresa
GET /api/auth/me/companies/:id
✅ Success 200: Sin permisos requeridos

// Usuario normal cambia de sucursal
POST /api/auth/me/switch-branch
✅ Success 200: Sin permisos requeridos

// Administrador gestiona empresas
GET /api/seguridades/admin/empresas
✅ Success 200: Con permiso companies.view
```

---

## 📊 Beneficios de esta Arquitectura

### 1. Mejor UX
- Usuario no necesita "ser admin" para usar su propia empresa
- Cambio de sucursal fluido
- Información disponible inmediatamente en login

### 2. Seguridad Balanceada
- Usuarios solo ven SUS datos
- Administradores requieren permisos para ver TODO
- Escritura siempre protegida

### 3. Menos Fricción
- Menos roles que crear
- Menos permisos que asignar
- Sistema más intuitivo
- Onboarding más rápido

### 4. Escalable
- Preparado para multi-empresa
- Preparado para multi-sucursal
- Fácil agregar nuevos endpoints de contexto

### 5. Mantenible
- Separación clara de responsabilidades
- Rutas organizadas por nivel de acceso
- Swagger documenta claramente cada endpoint

---

## 🔍 Patrones Aplicados

### 1. **Separation of Concerns**
- Endpoints de contexto: `/api/auth/me/*`
- Endpoints administrativos: `/api/seguridades/admin/*`

### 2. **Principle of Least Privilege**
- Usuario tiene mínimo acceso necesario por defecto
- Admin requiere permisos explícitos

### 3. **Resource-Based Access Control (RBAC)**
- Usuario accede a recursos basado en su relación con ellos
- No basado únicamente en permisos

### 4. **Progressive Enhancement**
- Usuario básico: funcionalidad básica sin configuración
- Usuario avanzado: más funcionalidad con más permisos

---

## 📝 Guía Rápida para Desarrolladores

### Crear Endpoint de Contexto (Sin Permisos)

```typescript
@Controller('auth/me')
@UseGuards(JwtAuthGuard)  // Solo JWT
export class ProfileController {
  
  @Get('mis-recursos')
  async getMisRecursos(@Request() req) {
    const userId = req.user.userId;
    // Filtrar solo recursos del usuario
    return this.service.findByUser(userId);
  }
}
```

### Crear Endpoint Administrativo (Con Permisos)

```typescript
@Controller('seguridades')
export class AdminController {
  
  @Get('admin/recursos')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(['recursos.view'])
  async getAllRecursos() {
    // Devolver TODOS los recursos
    return this.service.findAll();
  }
}
```

---

## 🎯 Conclusión

Esta arquitectura de 3 niveles proporciona el **balance perfecto entre seguridad y usabilidad**:

- ✅ Usuarios normales: Experiencia fluida sin fricción
- ✅ Administradores: Control total con permisos apropiados
- ✅ Seguridad: Acciones críticas siempre protegidas
- ✅ Escalabilidad: Fácil agregar nuevas funcionalidades

**Filosofía**: Los permisos deben proteger acciones críticas y vistas administrativas, NO el acceso básico del usuario a su propio contexto.

---

**¿Dudas?** Revisa los ejemplos en Postman o consulta el Swagger en `http://localhost:3000/api` 🚀


