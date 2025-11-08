# 📱 Contexto para el Frontend - Actualización de Usuarios

## 🎯 Resumen Ejecutivo

Se ha implementado un nuevo endpoint **TODO-EN-UNO** para actualizar usuarios que resuelve el problema del error 400 con `roleId` y `branchIds`.

**Solución**: El frontend ahora puede enviar estos campos en el payload y el backend los maneja correctamente.

---

## ❌ Problema Identificado

### Antes (Generaba Error 400)

```typescript
// ❌ ESTO GENERABA ERROR
PUT /api/seguridades/usuarios/:id
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "roleId": "uuid-rol",        // ← Backend rechazaba este campo
  "branchIds": ["uuid-1"]      // ← Backend rechazaba este campo
}

// Response:
// 400 Bad Request: "property roleId should not exist"
```

### Causa del Problema

El endpoint `/usuarios/:id` solo aceptaba datos básicos del usuario. Los campos `roleId` y `branchIds` no estaban soportados.

---

## ✅ Solución Implementada

### Nuevo Endpoint: `/usuarios/:id/completo`

Este endpoint acepta **TODO** en una sola llamada:
- ✅ Datos básicos del usuario
- ✅ Rol principal (`roleId`)
- ✅ Sucursales disponibles (`branchIds`)

---

## 📋 Especificación Técnica

### Endpoint

```
PUT /api/seguridades/usuarios/:id/completo
```

### Headers

```typescript
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json",
  "Accept-Language": "es"  // opcional: es, en, pt
}
```

### Body (Todos los campos son opcionales)

```typescript
{
  // DATOS BÁSICOS
  "email"?: string;              // Email del usuario
  "password"?: string;           // Nueva contraseña (opcional)
  "firstName"?: string;          // Nombre
  "lastName"?: string;           // Apellido
  "companyId"?: string;          // ID de la empresa (UUID)
  "isActive"?: boolean;          // Estado activo/inactivo
  
  // GESTIÓN DE ROLES
  "roleId"?: string;             // ID del rol principal (UUID)
  
  // GESTIÓN DE SUCURSALES
  "branchIds"?: string[];        // Array de IDs de sucursales (UUIDs)
}
```

### Response (200 OK)

```json
{
  "data": {
    "id": "uuid-usuario",
    "email": "usuario@empresa.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "companyId": "uuid-empresa",
    "isActive": true,
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
    "description": "Recurso actualizado exitosamente"
  }
}
```

### Errores Posibles

| Código | Descripción | Causa |
|--------|-------------|-------|
| 400 | Bad Request | Datos inválidos o sucursal no pertenece a la empresa del usuario |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Forbidden | Sin permisos `users.edit` |
| 404 | Not Found | Usuario, rol o sucursal no encontrado |
| 409 | Conflict | Email ya existe para otro usuario |

---

## 💻 Implementación en React Native

### Ejemplo Completo

```typescript
/**
 * Actualizar usuario con TODO en una sola llamada
 */
const updateUserComplete = async (userId: string, data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
  roleId?: string;
  branchIds?: string[];
}) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/seguridades/usuarios/${userId}/completo`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept-Language': 'es',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.result.description);
    }

    const result = await response.json();
    return result.data; // Usuario actualizado
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    throw error;
  }
};
```

### Uso en Formulario de Edición

```typescript
// UserEditForm.tsx
import { useState } from 'react';

const UserEditForm = ({ userId, onSuccess }: Props) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    isActive: true,
    roleId: '',
    branchIds: [],
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ UNA sola llamada con TODO
      const updatedUser = await updateUserComplete(userId, formData);
      
      // Success
      onSuccess(updatedUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* Campos del formulario */}
      <TextInput
        value={formData.firstName}
        onChangeText={(text) => setFormData({...formData, firstName: text})}
        placeholder="Nombre"
      />
      
      <TextInput
        value={formData.lastName}
        onChangeText={(text) => setFormData({...formData, lastName: text})}
        placeholder="Apellido"
      />
      
      {/* Selector de Rol */}
      <RolePicker
        value={formData.roleId}
        onChange={(roleId) => setFormData({...formData, roleId})}
      />
      
      {/* Selector de Sucursales (Multiselect) */}
      <BranchMultiSelect
        selectedIds={formData.branchIds}
        onChange={(branchIds) => setFormData({...formData, branchIds})}
      />
      
      {/* Botón de Guardar */}
      <Button
        title="Guardar Cambios"
        onPress={handleSubmit}
        disabled={loading}
      />
      
      {error && <Text style={{color: 'red'}}>{error}</Text>}
    </View>
  );
};
```

---

## 🔄 Migración del Código Existente

### Cambio Requerido

```typescript
// ❌ ANTES (Generaba error 400)
await fetch(`/api/seguridades/usuarios/${userId}`, {
  method: 'PUT',
  body: JSON.stringify({
    firstName: 'Juan',
    lastName: 'Pérez',
    roleId: selectedRoleId,       // ← Causaba error
    branchIds: selectedBranches,  // ← Causaba error
  })
});

// ✅ AHORA (Funciona correctamente)
await fetch(`/api/seguridades/usuarios/${userId}/completo`, {
  method: 'PUT',
  body: JSON.stringify({
    firstName: 'Juan',
    lastName: 'Pérez',
    roleId: selectedRoleId,       // ✅ Aceptado
    branchIds: selectedBranches,  // ✅ Aceptado
  })
});
```

**Cambio mínimo**: Agregar `/completo` a la URL.

---

## 📊 Endpoints Adicionales (Opcionales)

Si necesitas consultar roles o sucursales por separado:

### Ver Roles del Usuario

```typescript
GET /api/seguridades/usuarios/:id/roles

// Response:
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
  ]
}
```

### Ver Sucursales del Usuario

```typescript
GET /api/seguridades/usuarios/:id/sucursales

// Response:
{
  "data": {
    "currentBranchId": "uuid-sucursal-1",
    "availableBranches": [
      { "id": "uuid-1", "code": "SUC001", "name": "Sucursal Centro" },
      { "id": "uuid-2", "code": "SUC002", "name": "Sucursal Norte" }
    ]
  }
}
```

**Uso típico**: Para llenar dropdowns antes de editar.

---

## ✅ Validaciones Automáticas del Backend

El endpoint valida automáticamente:

### 1. Rol Válido
```typescript
if (roleId provided) {
  // ✅ Verifica que el rol exista
  // ❌ Error 404 si no existe
}
```

### 2. Sucursales Válidas
```typescript
if (branchIds provided) {
  // ✅ Verifica que cada sucursal exista
  // ✅ Verifica que pertenezca a la empresa del usuario
  // ❌ Error 400 si una sucursal no pertenece a la empresa
  // ❌ Error 404 si una sucursal no existe
}
```

### 3. Email Único
```typescript
if (email changed) {
  // ✅ Verifica que el email no esté en uso por otro usuario
  // ❌ Error 409 si ya existe
}
```

### 4. Actualización de Sucursal Actual
```typescript
if (user.currentBranchId not in new branchIds) {
  // ✅ Automáticamente asigna la primera sucursal de la lista
}
```

---

## 🎯 Casos de Uso Cubiertos

### Caso 1: Actualizar Solo Datos Básicos

```typescript
await updateUserComplete(userId, {
  firstName: "Juan Actualizado",
  lastName: "Pérez Actualizado"
});
// ✅ Solo actualiza nombre y apellido
// ⚠️ No modifica rol ni sucursales
```

### Caso 2: Actualizar Solo Rol

```typescript
await updateUserComplete(userId, {
  roleId: newRoleId
});
// ✅ Solo actualiza el rol principal
// ⚠️ No modifica datos básicos ni sucursales
```

### Caso 3: Actualizar Solo Sucursales

```typescript
await updateUserComplete(userId, {
  branchIds: [branchId1, branchId2, branchId3]
});
// ✅ Solo actualiza sucursales disponibles
// ⚠️ No modifica datos básicos ni rol
```

### Caso 4: Actualizar TODO

```typescript
await updateUserComplete(userId, {
  firstName: "Juan",
  lastName: "Pérez",
  email: "juan.nuevo@empresa.com",
  isActive: true,
  roleId: newRoleId,
  branchIds: [branch1, branch2]
});
// ✅ Actualiza TODO en una sola llamada
```

---

## 🚫 Lo que NO Debes Hacer

### ❌ No uses el endpoint antiguo para roleId/branchIds

```typescript
// ❌ ESTO SEGUIRÁ GENERANDO ERROR 400
PUT /api/seguridades/usuarios/:id
{
  "roleId": "...",
  "branchIds": [...]
}
```

### ❌ No envíes branchIds de otra empresa

```typescript
// ❌ ESTO GENERARÁ ERROR 400
{
  "branchIds": ["uuid-sucursal-de-otra-empresa"]
}
// Error: "Branch does not belong to user company"
```

### ❌ No envíes UUIDs inválidos

```typescript
// ❌ ESTO GENERARÁ ERROR 400
{
  "roleId": "not-a-uuid",
  "branchIds": ["also-not-a-uuid"]
}
// Error: validación de UUID fallará
```

---

## 📝 Checklist de Implementación

Para el equipo frontend:

- [ ] Actualizar la URL del endpoint a `/usuarios/:id/completo`
- [ ] Quitar cualquier validación del lado del cliente que impida enviar `roleId`
- [ ] Quitar cualquier validación del lado del cliente que impida enviar `branchIds`
- [ ] Agregar manejo de errores 400, 404, 409
- [ ] Probar con diferentes combinaciones de campos
- [ ] Probar que funcione enviar solo algunos campos (parcial)
- [ ] Probar que funcione enviar todos los campos (completo)
- [ ] Actualizar tests unitarios si existen

---

## 🧪 Testing en Postman

Puedes probar el endpoint con la colección actualizada:

**Collection**: `MNK_Service_API.postman_collection.json`

**Endpoint**: `Usuarios > ⭐ Actualizar Usuario Completo (TODO-EN-UNO)`

**Variables disponibles**:
- `{{userId}}` - Se captura automáticamente en login
- `{{roleId}}` - Debes configurarla manualmente o capturarla
- `{{branchId}}` - Se captura automáticamente en login

---

## 🔐 Permisos Requeridos

**Permiso**: `users.edit`

Si el usuario no tiene este permiso:
```json
{
  "result": {
    "statusCode": 403,
    "description": "No tienes permisos suficientes para acceder a este recurso"
  }
}
```

---

## 💡 Tips de Implementación

### 1. Manejo de Errores

```typescript
const handleError = (error: any) => {
  if (error.result?.statusCode === 400) {
    return "Datos inválidos. Verifica los campos.";
  }
  if (error.result?.statusCode === 404) {
    return "Usuario, rol o sucursal no encontrado.";
  }
  if (error.result?.statusCode === 409) {
    return "El email ya está en uso.";
  }
  return error.result?.description || "Error desconocido";
};
```

### 2. Validación Cliente

```typescript
const validateForm = (data: FormData) => {
  // Email válido
  if (data.email && !isValidEmail(data.email)) {
    throw new Error("Email inválido");
  }
  
  // Password mínimo 6 caracteres
  if (data.password && data.password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }
  
  // Al menos una sucursal si envías branchIds
  if (data.branchIds && data.branchIds.length === 0) {
    throw new Error("Debes seleccionar al menos una sucursal");
  }
};
```

### 3. Loading States

```typescript
const [state, setState] = useState({
  loading: false,
  error: null,
  success: false
});

const handleSubmit = async () => {
  setState({ loading: true, error: null, success: false });
  
  try {
    await updateUserComplete(userId, formData);
    setState({ loading: false, error: null, success: true });
  } catch (error) {
    setState({ loading: false, error: error.message, success: false });
  }
};
```

---

## 🎉 Resumen

### Lo que cambió:
- ✅ Nuevo endpoint `/usuarios/:id/completo` acepta `roleId` y `branchIds`
- ✅ Una sola llamada actualiza todo
- ✅ Validaciones automáticas del backend
- ✅ Documentado en Swagger y Postman

### Lo que NO cambió:
- ✅ El endpoint básico `/usuarios/:id` sigue funcionando (solo datos básicos)
- ✅ Los permisos siguen siendo los mismos (`users.edit`)
- ✅ La estructura del response es consistente

### Para el frontend:
- 🔧 Cambiar URL de `/usuarios/:id` a `/usuarios/:id/completo`
- 🔧 Ya NO quitar `roleId` ni `branchIds` del payload
- ✅ Todo lo demás sigue igual

---

## 📞 ¿Preguntas?

Si tienes dudas sobre:
- Campos específicos
- Validaciones
- Casos de uso no cubiertos
- Performance

Consulta:
- **Swagger**: http://localhost:3000/api (documentación interactiva)
- **Postman**: `MNK_Service_API.postman_collection.json`
- **Código**: `src/domains/seguridades/presentation/controllers/seguridades.controller.ts`

---

**¡Listo para implementar! 🚀**


