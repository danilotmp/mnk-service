# 🚀 Cómo usar la Colección de Postman

## 📥 Importar la Colección

1. Abre Postman
2. Click en **Import** (esquina superior izquierda)
3. Selecciona el archivo: `documents/MNK_Service_API.postman_collection.json`
4. Click en **Import**

## ⚙️ Configurar Variables de Entorno

La colección usa variables para facilitar las pruebas:

### Variables Globales
- `baseUrl`: http://localhost:3000
- `accessToken`: Se guarda automáticamente después del login
- `refreshToken`: Se guarda automáticamente después del login
- `userId`: Se guarda automáticamente después del login

### Configurar baseUrl

1. En Postman, click en el engranaje ⚙️ (Manage Environments)
2. Click en **Add** para crear un nuevo environment
3. Name: `MNK Service Local`
4. Agrega la variable: `baseUrl` = `http://localhost:3000`
5. Click **Save**

## 🧪 Probar los Endpoints

### 1. Login (Primer paso)

```
POST {{baseUrl}}/api/seguridades/login
```

**Headers:**
- `Content-Type: application/json`
- `company-code: COMP001`

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "Password123!"
}
```

**Nota:** El token se guarda automáticamente en las variables de entorno.

### 2. Obtener Perfil (Requiere autenticación)

```
GET {{baseUrl}}/api/seguridades/profile
```

**Headers:**
- `Authorization: Bearer {{accessToken}}`
- `company-code: COMP001`
- `user-id: {{userId}}`
- `app-source: mobile`

### 3. Refresh Token

```
POST {{baseUrl}}/api/seguridades/refresh-token
```

**Headers:**
- `Content-Type: application/json`
- `company-code: COMP001`

**Body:**
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

## 📋 Endpoints Disponibles

### 🔐 Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/seguridades/login` | Iniciar sesión |
| POST | `/api/seguridades/register` | Registrar usuario |
| POST | `/api/seguridades/refresh-token` | Refrescar token |
| GET | `/api/seguridades/profile` | Obtener perfil (auth) |

### 👤 Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios/me` | Obtener usuario actual (auth) |

## 🎯 Headers Multiempresa

Todos los endpoints soportan headers multiempresa:

- `company-code`: Código de la empresa (requerido en algunos endpoints)
- `user-id`: ID del usuario (opcional)
- `app-source`: Origen de la app (mobile, web, legacy)
- `client-ip`: IP del cliente (se captura automáticamente)

## 🔄 Flujo de Trabajo Recomendado

1. **Login** → Obtiene tokens y los guarda automáticamente
2. **Usar cualquier endpoint protegido** → El token se usa automáticamente
3. **Si el token expira** → Usar **Refresh Token** para obtener uno nuevo
4. **Repetir paso 2**

## 📝 Estructura de Respuesta

Todas las respuestas siguen este formato:

```json
{
  "data": {
    // Datos de la respuesta
  },
  "result": {
    "statusCode": 200,      // Código HTTP (200 = éxito)
    "description": "Mensaje descriptivo",
    "details": null          // Detalles técnicos del error
  }
}
```

### Códigos de Status HTTP

- `200` - Éxito
- `201` - Creado exitosamente
- `400` - Error de validación
- `401` - No autenticado
- `403` - Sin permisos
- `404` - No encontrado
- `500` - Error del servidor

## 🐛 Troubleshooting

### Error: Connection refused
- Verifica que el servidor esté corriendo: `npm run start:dev`
- Verifica el puerto en `baseUrl`

### Error: 401 Unauthorized
- Ejecuta el endpoint de **Login** primero
- Verifica que el token esté en la variable `{{accessToken}}`

### Error: 400 Bad Request
- Verifica que el body del request sea un JSON válido
- Revisa los campos requeridos en el body

## 🔗 Swagger UI

También puedes usar Swagger para probar la API:

```
http://localhost:3000/api/docs
```

## 📌 Notas

- Los tokens tienen expiración (15 minutos access, 7 días refresh)
- El refresh token debe usarse antes de que el access token expire
- Todos los endpoints protegidos requieren el header `Authorization: Bearer {token}`
- El header `company-code` es requerido para operaciones multiempresa

---

**¡Listo para probar! 🎉**

