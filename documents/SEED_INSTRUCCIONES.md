# 🌱 Script de Seeding - Datos de Prueba

## 📋 Descripción

Este script crea datos de ejemplo en la base de datos para poder realizar pruebas:
- **1 Empresa**: MNK Solutions
- **2 Sucursales**: Quito y Guayaquil
- **2 Usuarios**: Administrador y Usuario de prueba

## 🚀 Ejecutar el Seeding

### Opción 1: Ejecutar script de seeding

```bash
npm run seed
```

### Opción 2: Borrar y recrear datos

```bash
npm run seed:reset
```

### Opción 3: Solo borrar la BDD

```bash
npm run seed:clear
```

## 📧 Credenciales Creadas

### 👔 Administrador (acceso completo)

```
Email: admin@mnksolutions.com
Password: Admin123!
Company: MNK Solutions
Branches: Quito, Guayaquil
Permisos: Todos (*)
```

### 👤 Usuario de Prueba (acceso limitado)

```
Email: test@mnksolutions.com
Password: Test123!
Company: MNK Solutions
Branch: Guayaquil
Permisos: Ver reportes, Ver datos
```

## 🏢 Empresa Creada

**MNK Solutions S.A.**
- Código: `MNK`
- Email: contacto@mnksolutions.com
- Plan: Premium
- Máximo sucursales: 10
- Máximo usuarios: 100

## 🏢 Sucursales Creadas

### 1. Sucursal Quito (Principal)
- **Código**: `MNK-QUITO`
- **Tipo**: Headquarters (Sede principal)
- **Dirección**: Av. Principal 123, Quito
- **Teléfono**: +593 2 2345678

### 2. Sucursal Guayaquil
- **Código**: `MNK-GUAYAQUIL`
- **Tipo**: Branch (Sucursal)
- **Dirección**: Av. 9 de Octubre 456, Guayaquil
- **Teléfono**: +593 4 5678901

## 🧪 Probar con Postman

### 1. Login con Administrador

```http
POST http://localhost:3000/api/seguridades/login
Content-Type: application/json

{
  "email": "admin@mnksolutions.com",
  "password": "Admin123!"
}
```

**Headers adicionales:**
```
company-code: MNK
```

### 2. Login con Usuario de Prueba

```http
POST http://localhost:3000/api/seguridades/login
Content-Type: application/json

{
  "email": "test@mnksolutions.com",
  "password": "Test123!"
}
```

**Headers adicionales:**
```
company-code: MNK
```

## 🔄 Re-ejecutar el Seeding

Si ya existen datos y quieres recrearlos:

```bash
# Opción 1: Todo en uno
npm run seed:reset

# Opción 2: Manualmente
# 1. Detener el servidor (Ctrl+C)
# 2. Eliminar la BDD
npm run seed:clear
# 3. Volver a crear datos
npm run seed
# 4. Iniciar el servidor
npm run start:dev
```

## ⚠️ Notas Importantes

1. **No ejecutes el seeding en producción**: Este script está solo para desarrollo
2. **La BDD se recrea**: Si ejecutas `seed:reset`, se borran todos los datos existentes
3. **Los usuarios tienen permisos completos**: El admin puede hacer todo
4. **Las contraseñas son débiles**: Solo para pruebas, cámbialas en producción

## 📦 Datos Creados

### Tablas afectadas:

- `companies` - 1 empresa
- `branches` - 2 sucursales
- `usuarios` - 2 usuarios

### Estructura de permisos:

**Administrador:**
```json
{
  "roles": ["admin"],
  "permissions": ["*"],
  "branches": [
    {"branchId": "...", "role": "admin", "permissions": ["*"]},
    {"branchId": "...", "role": "admin", "permissions": ["*"]}
  ]
}
```

**Usuario de prueba:**
```json
{
  "roles": ["user"],
  "permissions": ["reports.view", "data.view"],
  "branches": [
    {"branchId": "...", "role": "user", "permissions": ["reports.view"]}
  ]
}
```

## 🐛 Troubleshooting

### Error: "Ya existen datos de prueba"
El script detecta si ya hay datos y no los sobrescribe. Para recrear:
```bash
npm run seed:reset
```

### Error: "Cannot find module"
Instala las dependencias:
```bash
npm install
```

### Error: "Database is locked"
Cierra todas las conexiones a la base de datos:
- Detén el servidor
- Cierra DB Browser
- Ejecuta el seed nuevamente

## 📝 Personalizar los Datos

Edita el archivo `src/database/seed.ts` para cambiar:
- Nombres de usuarios
- Contraseñas
- Direcciones
- Permisos
- Configuraciones de empresa

---

**¡Listo para probar! 🎉**

