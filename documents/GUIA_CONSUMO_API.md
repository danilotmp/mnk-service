# 📘 Guía de Consumo de API - Gestión de Tokens

## 🎯 Objetivo

Esta guía explica cómo consumir correctamente los servicios del backend MNK Service, con énfasis en la gestión segura de tokens JWT (accessToken y refreshToken).

## 🔐 Sistema de Autenticación

### Dos Tokens, Dos Propósitos

El sistema utiliza **dos tokens** con propósitos diferentes:

| Token | Duración | Propósito | Dónde se usa |
|-------|----------|-----------|--------------|
| **accessToken** | 15 minutos | Identificar al usuario en cada request | En headers de requests normales |
| **refreshToken** | 7 días | Obtener nuevo accessToken cuando expira | En el endpoint `/refresh-token` |

## 📦 Almacenamiento de Tokens

### React Native (AsyncStorage)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Guardar tokens después del login
await AsyncStorage.setItem('accessToken', response.data.accessToken);
await AsyncStorage.setItem('refreshToken', response.data.refreshToken);

// Obtener tokens
const accessToken = await AsyncStorage.getItem('accessToken');
const refreshToken = await AsyncStorage.getItem('refreshToken');

// Eliminar tokens (logout)
await AsyncStorage.removeItem('accessToken');
await AsyncStorage.removeItem('refreshToken');
```

### Web (localStorage)

```javascript
// Guardar
localStorage.setItem('accessToken', response.data.accessToken);
localStorage.setItem('refreshToken', response.data.refreshToken);

// Obtener
const accessToken = localStorage.getItem('accessToken');

// Eliminar
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
```

## 🚀 Implementación Paso a Paso

### 1. Configuración Base del Cliente API

```typescript
// src/config/api.config.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000/api';

class ApiClient {
  private async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem('accessToken');
  }

  private async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem('refreshToken');
  }

  private async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
  }

  async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    // Preparar request
  }
}
```

### 2. Implementación de Requests con Tokens

```typescript
async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
  // Obtener accessToken
  const accessToken = await this.getAccessToken();

  // Preparar headers
  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
    ...options.headers,
  };

  // Realizar request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Si el accessToken expiró (401)
  if (response.status === 401) {
    return await this.handleTokenRefresh(endpoint, options);
  }

  return response;
}
```

### 3. Refrescar Token Automáticamente

```typescript
private async handleTokenRefresh(
  originalEndpoint: string,
  originalOptions: RequestInit
): Promise<Response> {
  try {
    // Obtener refreshToken
    const refreshToken = await this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Solicitar nuevos tokens usando SOLO refreshToken
    const refreshResponse = await fetch(`${API_BASE_URL}/seguridades/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),  // ← Solo refreshToken aquí
    });

    if (!refreshResponse.ok) {
      throw new Error('Failed to refresh token');
    }

    const { data } = await refreshResponse.json();

    // Guardar los nuevos tokens
    await this.saveTokens(data.accessToken, data.refreshToken);

    // Obtener el nuevo accessToken
    const newAccessToken = await this.getAccessToken();

    // Reintentar el request original con el nuevo accessToken
    return fetch(`${API_BASE_URL}${originalEndpoint}`, {
      ...originalOptions,
      headers: {
        ...originalOptions.headers,
        'Authorization': `Bearer ${newAccessToken}`,  // ← Nuevo accessToken
      },
    });

  } catch (error) {
    // Si falla el refresh, redirigir al login
    // await AsyncStorage.clear();
    // navigation.navigate('Login');
    throw error;
  }
}
```

## 📋 Ejemplos de Uso

### Login y Guardar Tokens

```typescript
// src/services/auth.service.ts
class AuthService {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/seguridades/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // Guardar tokens en storage
    await AsyncStorage.setItem('accessToken', data.data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.data.refreshToken);

    return data;
  }
}
```

### Request con Token Automático

```typescript
// El cliente API maneja todo automáticamente
const api = new ApiClient();

// El interceptor agrega el accessToken automáticamente
const user = await api.request('/usuarios/me', { method: 'GET' });

// Si el accessToken expira, se refresca automáticamente
const updatedUser = await api.request('/usuarios/me', { method: 'GET' });
```

### Logout

```typescript
async logout() {
  // Eliminar tokens del storage
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
  
  // Opcional: invalidar refreshToken en el servidor
  try {
    await api.request('/seguridades/logout', { method: 'POST' });
  } catch (error) {
    // Ignorar error si el servidor no tiene este endpoint
  }
  
  // Redirigir al login
  navigation.navigate('Login');
}
```

## 🔄 Flujo Completo de Tokens

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│  1. LOGIN                                                   │
├─────────────────────────────────────────────────────────────┤
│  POST /seguridades/login { email, password }               │
│  ↓                                                          │
│  Response: { accessToken, refreshToken }                   │
│  ↓                                                          │
│  Guardar en AsyncStorage                                   │
│  ✓ accessToken (15 min)                                    │
│  ✓ refreshToken (7 días)                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  2. REQUEST NORMAL                                          │
├─────────────────────────────────────────────────────────────┤
│  GET /usuarios/me                                          │
│  Headers: { Authorization: Bearer <accessToken> }          │
│  ↓                                                          │
│  Response: 200 OK ✅                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  3. ACCESS TOKEN EXPIRA (15 min después)                   │
├─────────────────────────────────────────────────────────────┤
│  GET /usuarios/me                                          │
│  Headers: { Authorization: Bearer <accessToken expirado> } │
│  ↓                                                          │
│  Response: 401 Unauthorized ❌                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  4. REFRESH AUTOMÁTICO                                     │
├─────────────────────────────────────────────────────────────┤
│  POST /seguridades/refresh-token                           │
│  Body: { refreshToken }                                   │
│  ↓                                                          │
│  Response: { accessToken (nuevo), refreshToken (nuevo) }  │
│  ↓                                                          │
│  Guardar nuevos tokens en AsyncStorage                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  5. REINTENTAR REQUEST ORIGINAL                            │
├─────────────────────────────────────────────────────────────┤
│  GET /usuarios/me                                          │
│  Headers: { Authorization: Bearer <nuevoAccessToken> }     │
│  ↓                                                          │
│  Response: 200 OK ✅                                        │
└─────────────────────────────────────────────────────────────┘
```

## ⚠️ Reglas Importantes

### ❌ NO Hacer

1. **No enviar ambos tokens** en el mismo request
2. **No enviar refreshToken** en requests normales
3. **No usar accessToken** para el endpoint `/refresh-token`
4. **No exponer tokens** en logs o consola (solo en desarrollo)
5. **No guardar tokens** en variables globales (usar AsyncStorage)

### ✅ SÍ Hacer

1. **Enviar solo accessToken** en requests normales
2. **Enviar solo refreshToken** en `/refresh-token`
3. **Refrescar automáticamente** cuando reciba 401
4. **Guardar ambos tokens** en AsyncStorage
5. **Reintentar automáticamente** después de refrescar

## 📊 Tabla de Referencia Rápida

| Endpoint | Token a usar | Dónde enviarlo | Ejemplo |
|----------|-------------|----------------|---------|
| `/seguridades/login` | Ninguno | - | Body con email/password |
| `/seguridades/register` | Ninguno | - | Body con datos |
| `/seguridades/refresh-token` | `refreshToken` | Body | `{ "refreshToken": "..." }` |
| **Todos los demás** | `accessToken` | Header | `Authorization: Bearer ...` |

## 🛠️ Headers Recomendados

### Request Normal

```typescript
headers: {
  'Authorization': 'Bearer <accessToken>',
  'Content-Type': 'application/json',
  'company-code': 'MNK',      // Multiempresa
  'user-id': 'uuid-del-user',  // Opcional
  'app-source': 'mobile',      // mobile/web/legacy
}
```

### Request de Refresh

```typescript
headers: {
  'Content-Type': 'application/json',
  // NO incluir Authorization aquí
}
body: {
  refreshToken: '<refreshToken>'  // Solo en el body
}
```

## 🔧 Implementación con Axios (Alternativa)

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configurar axios
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Interceptor para agregar accessToken automáticamente
api.interceptors.request.use(async (config) => {
  const accessToken = await AsyncStorage.getItem('accessToken');
  
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  return config;
});

// Interceptor para refrescar token automáticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Obtener refreshToken
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        // Refrescar token
        const { data } = await axios.post('/seguridades/refresh-token', {
          refreshToken,
        });
        
        // Guardar nuevos tokens
        await AsyncStorage.setItem('accessToken', data.data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
        
        // Reintentar request original
        error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return axios.request(error.config);
        
      } catch (refreshError) {
        // Redirigir al login
        await AsyncStorage.clear();
        // navigation.navigate('Login');
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

## 📝 Estructura de Respuesta

Todas las respuestas del backend siguen este formato:

```json
{
  "data": {
    // Datos de la respuesta
  },
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa",
    "details": null
  }
}
```

### Códigos de Status HTTP

- `200` - Éxito
- `201` - Creado exitosamente
- `400` - Error de validación
- `401` - Token expirado o inválido (necesita refresh)
- `403` - Sin permisos
- `404` - No encontrado
- `500` - Error del servidor

## 🧪 Testing

### Prueba Manual

```typescript
// 1. Login
const loginResponse = await api.login('admin@example.com', 'Admin123!');
console.log('Tokens:', loginResponse.data);

// 2. Request con accessToken
const profile = await api.request('/usuarios/me');
console.log('Profile:', profile);

// 3. Esperar 16 minutos (accessToken expira)
// 4. Request nuevamente - debe refrescar automáticamente
const profile2 = await api.request('/usuarios/me');
console.log('Profile (después de refresh):', profile2);
```

## 🐛 Troubleshooting

### Error: "No refresh token available"
**Solución**: El refreshToken no está guardado. Verifica que el login esté guardando ambos tokens.

### Error: "Token inválido"
**Solución**: El accessToken o refreshToken es inválido. Verifica que no haya sido modificado.

### Error: 401 persistente después de refresh
**Solución**: El endpoint no existe o hay problema de CORS. Verifica la configuración del backend.

### Los tokens no se refrescan automáticamente
**Solución**: Verifica que el interceptor HTTP esté configurado correctamente y que detecte el código 401.

## 📚 Recursos Adicionales

- **Autenticación**: Ver `documents/INTEGRACION_FRONTEND.md`
- **Postman**: Ver `documents/POSTMAN_INSTRUCCIONES.md`
- **Debug**: Ver `documents/DEBUG_INSTRUCCIONES.md`

---

**¡Implementa esto correctamente y tus usuarios no se darán cuenta cuando sus tokens se refresquen! 🎉**

