# ⚡ Quick Guide - Actualización de Usuarios

## 🎯 Cambio Mínimo Requerido

```typescript
// ❌ ANTES (Error 400)
PUT /api/seguridades/usuarios/:id

// ✅ AHORA (Funciona)
PUT /api/seguridades/usuarios/:id/completo
```

**Solo agreguen `/completo` a la URL.**

---

## 📦 Payload Completo (Todos opcionales)

```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "usuario@empresa.com",
  "isActive": true,
  "roleId": "uuid-del-rol",
  "branchIds": ["uuid-sucursal-1", "uuid-sucursal-2"]
}
```

---

## ✅ Ventajas

- ✅ **UNA sola llamada** para actualizar todo
- ✅ Ya **NO hay error 400** con `roleId` y `branchIds`
- ✅ Backend valida automáticamente todo
- ✅ Solo envías los campos que necesitas actualizar

---

## 📱 Código React Native

```typescript
const updateUser = async (userId: string, data: any) => {
  const response = await fetch(
    `${API_URL}/api/seguridades/usuarios/${userId}/completo`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );
  
  if (!response.ok) throw new Error('Error actualizando');
  return response.json();
};
```

---

## 🔍 Respuesta

```json
{
  "data": {
    "id": "uuid-usuario",
    "email": "usuario@empresa.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "isActive": true,
    "currentBranchId": "uuid-sucursal-1",
    "availableBranches": [
      { "id": "uuid-1", "code": "SUC001", "name": "Centro" }
    ]
  },
  "result": {
    "statusCode": 200,
    "description": "Recurso actualizado exitosamente"
  }
}
```

---

## 🚫 Errores Posibles

| Código | Causa |
|--------|-------|
| 400 | Datos inválidos o sucursal no pertenece a la empresa |
| 404 | Usuario, rol o sucursal no encontrado |
| 409 | Email ya existe |

---

## 📚 Documentación Completa

👉 **CONTEXTO_FRONTEND_ACTUALIZACION_USUARIOS.md**

---

**¡Listo en 5 minutos! 🚀**


