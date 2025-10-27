# Guía de Integración Frontend - Backend

Este documento explica cómo integrar la aplicación React Native con el backend MNK Service.

## 🔌 Endpoints del Backend

### Base URL
```
http://localhost:3000/api
```

### Endpoints de Autenticación

#### 1. Login
```http
POST /api/seguridades/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "Contraseña123!"
}
```

**Respuesta exitosa (200):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-del-usuario",
      "email": "usuario@example.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "companyId": "uuid-de-empresa"
    }
  },
  "result": {
    "code": "000",
    "description": "Inicio de sesión exitoso",
    "details": null
  },
  "statusCode": 200
}
```

**Respuesta de error (401):**
```json
{
  "data": null,
  "result": {
    "code": "401",
    "description": "Credenciales inválidas",
    "details": "El email o contraseña son incorrectos"
  },
  "statusCode": 401
}
```

#### 2. Registro
```http
POST /api/seguridades/register
Content-Type: application/json

{
  "email": "nuevo@example.com",
  "password": "Contraseña123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "companyId": "uuid-de-empresa"
}
```

#### 3. Refrescar Token
```http
POST /api/seguridades/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 4. Obtener Perfil (Autenticado)
```http
GET /api/seguridades/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
company-code: COMPANY001
```

## 🔐 Headers Requeridos

### Headers para Autenticación
```
Authorization: Bearer <access_token>
```

### Headers Multiempresa
Para requests autenticados, se recomienda incluir:
```
company-code: <codigo-de-empresa>
user-id: <id-del-usuario>
app-source: mobile
```

## 📱 Implementación en React Native

### 1. Configuración del Servicio HTTP

```typescript
// src/config/api.config.ts
const API_BASE_URL = 'http://localhost:3000/api';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
) {
  // Obtener token del storage
  const token = await AsyncStorage.getItem('accessToken');

  // Headers base
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Verificar si la respuesta no es OK
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.result.description);
  }

  return response.json();
}
```

### 2. Servicio de Autenticación

```typescript
// src/domains/auth/services/api-auth.service.ts
import { apiRequest } from '@/config/api.config';

export class ApiAuthService {
  async login(email: string, password: string) {
    const response = await apiRequest('/seguridades/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Guardar tokens
    await AsyncStorage.setItem('accessToken', response.data.accessToken);
    await AsyncStorage.setItem('refreshToken', response.data.refreshToken);

    return response;
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyId: string;
  }) {
    const response = await apiRequest('/seguridades/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Guardar tokens
    await AsyncStorage.setItem('accessToken', response.data.accessToken);
    await AsyncStorage.setItem('refreshToken', response.data.refreshToken);

    return response;
  }

  async logout() {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
  }

  async getProfile() {
    return apiRequest('/seguridades/profile', {
      method: 'GET',
    });
  }
}
```

### 3. Manejo de Respuestas

```typescript
// Uso en un componente
const handleLogin = async () => {
  try {
    const response = await apiAuthService.login(email, password);
    
    // Verificar el resultado
    if (response.result.code === '000') {
      // Éxito
      console.log('Login exitoso:', response.data.user);
      navigation.navigate('Home');
    } else {
      // Error
      console.error('Error:', response.result.description);
      Alert.alert('Error', response.result.description);
    }
  } catch (error) {
    console.error('Error de red:', error);
    Alert.alert('Error', 'No se pudo conectar al servidor');
  }
};
```

## 🔄 Refrescar Token Automáticamente

```typescript
// src/common/interceptors/auth.interceptor.ts
let isRefreshing = false;
let failedQueue: any[] = [];

export async function refreshTokenAndRetry(originalRequest: RequestInit) {
  if (isRefreshing) {
    return new Promise((resolve) => {
      failedQueue.push(resolve);
    });
  }

  isRefreshing = true;
  const refreshToken = await AsyncStorage.getItem('refreshToken');

  try {
    const response = await apiRequest('/seguridades/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    await AsyncStorage.setItem('accessToken', response.data.accessToken);
    await AsyncStorage.setItem('refreshToken', response.data.refreshToken);

    // Reintentar requests fallidos
    failedQueue.forEach((resolve) => resolve());
    failedQueue = [];
    isRefreshing = false;

    // Reintentar el request original
    return originalRequest;
  } catch (error) {
    failedQueue = [];
    isRefreshing = false;
    // Redirigir al login
    navigation.navigate('Login');
    throw error;
  }
}
```

## 📊 Estructura de Respuesta

Todas las respuestas del backend siguen este formato:

```typescript
interface ApiResponse<T> {
  data: T;                    // Datos de la respuesta
  result: {
    code: string;            // "000" para éxito
    description: string;     // Mensaje para mostrar
    details: any;            // Detalles técnicos
  };
  statusCode: number;        // Código HTTP
}
```

### Códigos de Resultado
- `000` - Éxito
- `400` - Error de validación
- `401` - No autenticado
- `403` - Sin permisos
- `404` - No encontrado
- `500` - Error del servidor

## 🚨 Manejo de Errores

```typescript
function handleApiError(error: any) {
  const errorCode = error.response?.result?.code || '500';
  const description = error.response?.result?.description || 'Error desconocido';
  const details = error.response?.result?.details;

  switch (errorCode) {
    case '401':
      // Redirigir al login
      navigation.navigate('Login');
      break;
    case '403':
      // Mostrar mensaje de permisos
      Alert.alert('Sin permisos', description);
      break;
    default:
      // Mostrar mensaje genérico
      Alert.alert('Error', description);
      console.error('Error técnico:', details);
  }
}
```

## 📝 Notas Importantes

1. **Token Storage**: Guarda tokens de forma segura usando `@react-native-async-storage/async-storage`
2. **HTTPS**: En producción, cambiar `http://` por `https://`
3. **Timeout**: Configurar timeout para requests (ej: 30s)
4. **Network Error**: Manejar errores de conexión
5. **Offline Mode**: Considerar caché offline para datos críticos

## 🔗 Integración con Multi-Company Context

```typescript
// En tu MultiCompanyProvider
const { currentCompany } = useMultiCompany();

// Agregar header company-code a todas las requests
const response = await apiRequest('/endpoint', {
  method: 'GET',
  headers: {
    'company-code': currentCompany?.code,
    'user-id': user.id,
    'app-source': 'mobile',
  },
});
```

## 🧪 Testing

```typescript
// Ejemplo de test
describe('ApiAuthService', () => {
  it('debe hacer login exitosamente', async () => {
    const response = await apiAuthService.login('test@example.com', 'password123');
    expect(response.result.code).toBe('000');
    expect(response.data.user).toBeDefined();
  });
});
```

