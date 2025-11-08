# 📦 Colección de Postman Actualizada

## ✅ Cambios Realizados

La colección de Postman **`MNK_Service_API.postman_collection.json`** ha sido actualizada para incluir la nueva arquitectura de 3 niveles.

---

## 🎯 ¿Qué hay de nuevo?

### 1. 🆕 Nueva Sección: "Contexto del Usuario (Sin Permisos)"

**5 Nuevos Endpoints** para que el usuario acceda a su contexto sin permisos administrativos:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth/me/companies` | GET | Mis empresas disponibles |
| `/api/auth/me/companies/:id` | GET | Mi empresa específica |
| `/api/auth/me/branches` | GET | Mis sucursales disponibles |
| `/api/auth/me/branches/:id` | GET | Mi sucursal específica |
| `/api/auth/me/switch-branch` | POST | Cambiar sucursal activa |

✅ **Solo requieren JWT válido**
✅ **Sin permisos administrativos**

---

### 2. 🔐 Sección Actualizada: "ADMIN - Empresas (Con Permisos)"

Las rutas fueron actualizadas:

**ANTES**: `/api/seguridades/empresas`
**AHORA**: `/api/seguridades/admin/empresas`

✅ Prefijo `/admin/` para claridad
✅ Requieren permisos específicos (`companies.*`)
✅ Documentación mejorada con emojis

---

### 3. 🔐 Sección Actualizada: "ADMIN - Sucursales (Con Permisos)"

Las rutas fueron actualizadas:

**ANTES**: `/api/seguridades/sucursales`
**AHORA**: `/api/seguridades/admin/sucursales`

✅ Prefijo `/admin/` para claridad
✅ Requieren permisos específicos (`branches.*`)
✅ Documentación mejorada con emojis

---

## 🎨 Mejoras Adicionales

### Variables Nuevas

Se agregaron 2 nuevas variables de colección:

```javascript
{
  "companyId": "",  // Se captura automáticamente en el login
  "branchId": ""    // Se captura automáticamente en el login
}
```

### Script Mejorado en Login

El endpoint de Login ahora captura automáticamente:
- `accessToken`
- `refreshToken`
- `userId`
- **`companyId`** (NUEVO)
- **`branchId`** (NUEVO)

```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.collectionVariables.set("accessToken", jsonData.data.accessToken);
    pm.collectionVariables.set("refreshToken", jsonData.data.refreshToken);
    pm.collectionVariables.set("userId", jsonData.data.user.id);
    
    // NUEVO: Guardar companyId y branchId
    if (jsonData.data.user.companyId) {
        pm.collectionVariables.set("companyId", jsonData.data.user.companyId);
    }
    if (jsonData.data.user.currentBranchId) {
        pm.collectionVariables.set("branchId", jsonData.data.user.currentBranchId);
    }
}
```

### Uso de Variables en Endpoints

Los endpoints ahora usan las variables capturadas:

```
{{baseUrl}}/api/auth/me/companies/{{companyId}}
{{baseUrl}}/api/auth/me/branches/{{branchId}}
{{baseUrl}}/api/seguridades/admin/empresas/{{companyId}}
```

---

## 📊 Estructura Completa de la Colección

```
MNK_Service_API.postman_collection.json
├── 📁 Autenticación (4 endpoints)
│   ├── Login (⭐ Response mejorado)
│   ├── Registro
│   ├── Refresh Token
│   └── Obtener Perfil
│
├── 📁 🆕 Contexto del Usuario (Sin Permisos) ⭐ NUEVO
│   ├── Mis Empresas
│   ├── Mi Empresa por ID
│   ├── Mis Sucursales
│   ├── Mi Sucursal por ID
│   └── Cambiar Sucursal Activa
│
├── 📁 Usuarios (5 endpoints)
├── 📁 Roles (5 endpoints)
├── 📁 Permisos (5 endpoints)
├── 📁 Menú (2 endpoints)
│
├── 📁 🔐 ADMIN - Empresas (Con Permisos) ⭐ ACTUALIZADO
│   ├── Listar Todas las Empresas (Admin)
│   ├── Ver Empresa por ID (Admin)
│   ├── Crear Empresa (Admin)
│   ├── Actualizar Empresa (Admin)
│   └── Eliminar Empresa (Admin)
│
└── 📁 🔐 ADMIN - Sucursales (Con Permisos) ⭐ ACTUALIZADO
    ├── Listar Todas las Sucursales (Admin)
    ├── Sucursales de Empresa (Admin)
    ├── Ver Sucursal por ID (Admin)
    ├── Crear Sucursal (Admin)
    ├── Actualizar Sucursal (Admin)
    └── Eliminar Sucursal (Admin)
```

**Total**: 8 secciones organizadas | 36+ endpoints documentados

---

## 🚀 Cómo Usar

### Paso 1: Importar la Colección

1. Abre Postman
2. Click en **Import**
3. Selecciona `MNK_Service_API.postman_collection.json`
4. Click en **Import**

### Paso 2: Configurar Variables (Opcional)

La única variable que necesitas configurar manualmente es:

- `baseUrl`: `http://localhost:3000` (ya configurada por defecto)

Las demás variables (`accessToken`, `refreshToken`, `userId`, `companyId`, `branchId`) se capturan automáticamente al hacer login.

### Paso 3: Hacer Login

1. Ve a **Autenticación > Login**
2. Click en **Send**
3. ✅ Las variables se capturan automáticamente

### Paso 4: Probar Endpoints de Contexto (Sin Permisos)

```bash
1. Contexto del Usuario > Mis Empresas
   → GET /api/auth/me/companies
   → ✅ Sin permisos requeridos

2. Contexto del Usuario > Mis Sucursales
   → GET /api/auth/me/branches
   → ✅ Sin permisos requeridos

3. Contexto del Usuario > Cambiar Sucursal Activa
   → POST /api/auth/me/switch-branch
   → Body: { "branchId": "{{branchId}}" }
   → ✅ Sin permisos requeridos
```

### Paso 5: Probar Endpoints Admin (Con Permisos)

```bash
1. ADMIN - Empresas > Listar Todas las Empresas (Admin)
   → GET /api/seguridades/admin/empresas?page=1&limit=10
   → ⚠️ Requiere: companies.view

2. ADMIN - Sucursales > Listar Todas las Sucursales (Admin)
   → GET /api/seguridades/admin/sucursales?page=1&limit=10
   → ⚠️ Requiere: branches.view
```

---

## 🎯 Identificación Visual

Los endpoints ahora tienen emojis para fácil identificación:

- 🆕 = Nuevo endpoint/sección
- 🔐 = Requiere permisos administrativos
- ✅ = Sin permisos requeridos (solo JWT)
- ⚠️ = Advertencia sobre permisos

---

## 📝 Documentación en Endpoints

Cada endpoint incluye:

- ✅ **Descripción clara** del propósito
- ✅ **Permisos requeridos** (si aplica)
- ✅ **Parámetros documentados** con ejemplos
- ✅ **Variables automáticas** donde sea posible
- ✅ **Ejemplos de body** con datos realistas

---

## 🔄 Comparación: Antes vs Ahora

### ❌ ANTES

```
📁 Empresas
  - GET /api/seguridades/empresas
  - GET /api/seguridades/empresas/:id
  - POST /api/seguridades/empresas
  - PUT /api/seguridades/empresas/:id
  - DELETE /api/seguridades/empresas/:id

❌ Sin endpoints para contexto del usuario
❌ Rutas sin prefijo /admin/
❌ Poco claro qué requiere permisos
```

### ✅ AHORA

```
📁 🆕 Contexto del Usuario (Sin Permisos)
  - GET /api/auth/me/companies ✅
  - GET /api/auth/me/companies/:id ✅
  - GET /api/auth/me/branches ✅
  - GET /api/auth/me/branches/:id ✅
  - POST /api/auth/me/switch-branch ✅

📁 🔐 ADMIN - Empresas (Con Permisos)
  - GET /api/seguridades/admin/empresas ⚠️
  - GET /api/seguridades/admin/empresas/:id ⚠️
  - POST /api/seguridades/admin/empresas ⚠️
  - PUT /api/seguridades/admin/empresas/:id ⚠️
  - DELETE /api/seguridades/admin/empresas/:id ⚠️

✅ Separación clara de niveles
✅ Rutas con prefijo /admin/
✅ Visual: emojis indican permisos
✅ Variables automáticas
```

---

## 💡 Consejos

### 1. Mantén el Token Actualizado

Si el token expira, simplemente:
- Ve a **Autenticación > Refresh Token**
- O vuelve a hacer Login

### 2. Usa las Variables

En lugar de escribir IDs manualmente:

❌ Mal:
```
/api/auth/me/companies/abc-123-def-456
```

✅ Bien:
```
/api/auth/me/companies/{{companyId}}
```

### 3. Revisa la Documentación

Cada endpoint tiene una pestaña **Docs** con:
- Descripción completa
- Permisos requeridos
- Ejemplos de uso

### 4. Organiza por Flujos

**Flujo Usuario Normal**:
1. Login
2. Mis Empresas
3. Mis Sucursales
4. Cambiar Sucursal

**Flujo Administrador**:
1. Login
2. Admin - Listar Empresas
3. Admin - Crear Empresa
4. Admin - Listar Sucursales

---

## 🎉 Conclusión

La colección de Postman ahora refleja completamente la **arquitectura de 3 niveles**:

- ✅ **Nivel 1**: Contexto del Usuario (sin permisos)
- ✅ **Nivel 2**: Admin Lectura (con permisos view)
- ✅ **Nivel 3**: Admin Escritura (con permisos create/edit/delete)

**Una sola colección** para todo el sistema, organizada, documentada y lista para usar. 🚀

---

**¿Dudas?** Revisa:
- 📖 `ARQUITECTURA_ENDPOINTS.md` - Guía completa
- 🚀 `QUICKSTART_ARQUITECTURA_MEJORADA.md` - Inicio rápido
- 🌐 Swagger: http://localhost:3000/api


