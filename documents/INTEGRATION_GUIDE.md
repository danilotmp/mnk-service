# Guía de Integración Frontend - MNK Service API

**Versión**: 1.2.0  
**Última Actualización**: 10 de Noviembre, 2025

---

## Índice

1. [Inicio Rápido](#inicio-rápido)
2. [Autenticación](#autenticación)
3. [Gestión de Usuarios](#gestión-de-usuarios)
4. [Autorización y Permisos](#autorización-y-permisos)
5. [Multiempresa](#multiempresa)
6. [Manejo de Errores](#manejo-de-errores)
7. [Ejemplos Completos](#ejemplos-completos)
8. [Mejores Prácticas](#mejores-prácticas)

---

## Inicio Rápido

### Configuración Inicial

```typescript
// config/api.ts
export const API_CONFIG = {
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

### Cliente HTTP Base

```typescript
// services/apiClient.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Obtener token del storage
    const token = await AsyncStorage.getItem('accessToken');

    // Headers base
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.result.description,
        response.status,
        data.result.details
      );
    }

    return data.data;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_CONFIG.baseURL);

// Clase de error personalizada
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

---

## Autenticación

### Login

```typescript
// services/auth.service.ts
interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    companyId: string;
  };
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<any>(
      '/seguridades/auth/login',
      credentials
    );

    // Guardar tokens
    await AsyncStorage.setItem('accessToken', response.accessToken);
    await AsyncStorage.setItem('refreshToken', response.refreshToken);
    await AsyncStorage.setItem('userId', response.user.id);

    return response;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('userId');
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  }

  async refreshToken(): Promise<string> {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<any>(
      '/seguridades/auth/refresh-token',
      { refreshToken }
    );

    await AsyncStorage.setItem('accessToken', response.accessToken);
    return response.accessToken;
  }
}

export const authService = new AuthService();
```

### Uso en Componente

```typescript
// screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { authService } from '../services/auth.service';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });
      
      // Navegar al home
      navigation.replace('Home', { user: response.user });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Contraseña"
        secureTextEntry
      />
      <Button
        title={loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
};
```

---

## Gestión de Usuarios

### Servicio de Usuarios

```typescript
// services/user.service.ts
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyId: string;
  isActive: boolean;
  currentBranchId: string;
  availableBranches: Branch[];
  roles: Role[];
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyId: string;
  roleId?: string;
  branchIds?: string[];
  isActive?: boolean;
}

export class UserService {
  // Obtener usuarios con paginación
  async getUsers(
    page = 1,
    limit = 10,
    filters?: {
      search?: string;
      isActive?: boolean;
      companyId?: string;
    }
  ): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    return apiClient.get<PaginatedResponse<User>>(
      `/seguridades/usuarios?${params}`
    );
  }

  // Obtener usuario por ID
  async getUserById(userId: string): Promise<User> {
    return apiClient.get<User>(`/seguridades/usuarios/${userId}`);
  }

  // Crear usuario (con rol y sucursales)
  async createUser(data: CreateUserData): Promise<User> {
    return apiClient.post<User>('/seguridades/usuarios', data);
  }

  // Actualizar usuario completo
  async updateUserComplete(
    userId: string,
    updates: Partial<CreateUserData>
  ): Promise<User> {
    return apiClient.put<User>(
      `/seguridades/usuarios/${userId}/completo`,
      updates
    );
  }

  // Eliminar usuario
  async deleteUser(userId: string): Promise<void> {
    return apiClient.delete(`/seguridades/usuarios/${userId}`);
  }

  // Obtener roles del usuario
  async getUserRoles(userId: string): Promise<Role[]> {
    return apiClient.get<Role[]>(`/seguridades/usuarios/${userId}/roles`);
  }
}

export const userService = new UserService();
```

### Ejemplo: Listar Usuarios

```typescript
// components/UserList.tsx
import React, { useState, useEffect } from 'react';
import { FlatList, Text, View, ActivityIndicator } from 'react-native';
import { userService } from '../services/user.service';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers(page, 20, {
        isActive: true,
      });
      
      setUsers(response.items);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <Text style={styles.userName}>
        {item.firstName} {item.lastName}
      </Text>
      <Text style={styles.userEmail}>{item.email}</Text>
      {item.phone && <Text style={styles.userPhone}>{item.phone}</Text>}
      
      {/* Mostrar roles */}
      <View style={styles.rolesContainer}>
        {item.roles.map(role => (
          <View key={role.id} style={styles.roleBadge}>
            <Text style={styles.roleText}>{role.displayName}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <FlatList
      data={users}
      renderItem={renderUser}
      keyExtractor={item => item.id}
      onEndReached={() => {
        if (page < totalPages) {
          setPage(page + 1);
        }
      }}
      onEndReachedThreshold={0.5}
    />
  );
};
```

### Ejemplo: Crear Usuario

```typescript
// screens/CreateUserScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Switch, Alert } from 'react-native';
import { userService } from '../services/user.service';

const CreateUserScreen = ({ navigation, route }) => {
  const { companyId, availableRoles, availableBranches } = route.params;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    companyId: companyId,
    roleId: '',
    branchIds: [],
    isActive: true,
  });

  const handleSubmit = async () => {
    try {
      // Validar campos requeridos
      if (!formData.email || !formData.password || !formData.firstName) {
        Alert.alert('Error', 'Por favor completa todos los campos requeridos');
        return;
      }

      // Crear usuario
      const newUser = await userService.createUser(formData);
      
      Alert.alert('Éxito', 'Usuario creado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email *"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Contraseña *"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
      />

      <TextInput
        placeholder="Nombre *"
        value={formData.firstName}
        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
      />

      <TextInput
        placeholder="Apellido *"
        value={formData.lastName}
        onChangeText={(text) => setFormData({ ...formData, lastName: text })}
      />

      <TextInput
        placeholder="Teléfono"
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
        keyboardType="phone-pad"
      />

      {/* Selector de Rol */}
      <RolePicker
        roles={availableRoles}
        selectedRoleId={formData.roleId}
        onSelect={(roleId) => setFormData({ ...formData, roleId })}
      />

      {/* Selector de Sucursales */}
      <BranchMultiSelect
        branches={availableBranches}
        selectedIds={formData.branchIds}
        onChange={(branchIds) => setFormData({ ...formData, branchIds })}
      />

      {/* Switch de activo */}
      <View style={styles.switchContainer}>
        <Text>Usuario Activo</Text>
        <Switch
          value={formData.isActive}
          onValueChange={(value) => setFormData({ ...formData, isActive: value })}
        />
      </View>

      <Button title="Crear Usuario" onPress={handleSubmit} />
    </View>
  );
};
```

---

## Autorización y Permisos

### Verificar Permisos

```typescript
// services/authorization.service.ts
interface MenuAccess {
  route: string;
  hasAccess: boolean;
}

export class AuthorizationService {
  private userPermissions: string[] = [];

  // Cargar permisos del usuario
  async loadUserPermissions(): Promise<void> {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return;

    const user = await apiClient.get<User>(`/seguridades/usuarios/${userId}`);
    
    // Extraer todos los permisos de todos los roles
    this.userPermissions = user.roles
      .flatMap(role => role.permissions || [])
      .map(permission => permission.code);
  }

  // Verificar si el usuario tiene un permiso
  hasPermission(permissionCode: string): boolean {
    return this.userPermissions.includes(permissionCode);
  }

  // Verificar si el usuario tiene alguno de los permisos
  hasAnyPermission(permissionCodes: string[]): boolean {
    return permissionCodes.some(code => this.hasPermission(code));
  }

  // Verificar si el usuario tiene todos los permisos
  hasAllPermissions(permissionCodes: string[]): boolean {
    return permissionCodes.every(code => this.hasPermission(code));
  }

  // Verificar acceso a ruta
  async checkRouteAccess(route: string): Promise<boolean> {
    try {
      await apiClient.get<MenuAccess>(`/seguridades/access?route=${route}`);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const authorizationService = new AuthorizationService();
```

### Componente Protegido

```typescript
// components/ProtectedComponent.tsx
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { authorizationService } from '../services/authorization.service';

interface ProtectedComponentProps {
  requiredPermission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  requiredPermission,
  children,
  fallback = <Text>No tienes permisos para ver esto</Text>,
}) => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    setHasPermission(authorizationService.hasPermission(requiredPermission));
  }, [requiredPermission]);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default ProtectedComponent;
```

### Uso del Componente Protegido

```typescript
// screens/UsersScreen.tsx
<ProtectedComponent requiredPermission="users.create">
  <Button title="Crear Usuario" onPress={handleCreate} />
</ProtectedComponent>

<ProtectedComponent requiredPermission="users.delete">
  <Button title="Eliminar" onPress={handleDelete} color="red" />
</ProtectedComponent>
```

---

## Multiempresa

### Contexto de Empresa

```typescript
// contexts/CompanyContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';

interface CompanyContextData {
  currentCompany: Company | null;
  availableCompanies: Company[];
  switchCompany: (companyId: string) => void;
}

const CompanyContext = createContext<CompanyContextData>({} as CompanyContextData);

export const CompanyProvider: React.FC = ({ children }) => {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const companies = await apiClient.get<Company[]>('/auth/me/companies');
      setAvailableCompanies(companies);
      
      // Establecer la primera como actual si no hay una seleccionada
      if (!currentCompany && companies.length > 0) {
        setCurrentCompany(companies[0]);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const switchCompany = (companyId: string) => {
    const company = availableCompanies.find(c => c.id === companyId);
    if (company) {
      setCurrentCompany(company);
      // Recargar datos relevantes...
    }
  };

  return (
    <CompanyContext.Provider
      value={{
        currentCompany,
        availableCompanies,
        switchCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);
```

---

## Manejo de Errores

### Interceptor de Errores

```typescript
// services/errorHandler.ts
export class ErrorHandler {
  static handle(error: any): string {
    if (error instanceof ApiError) {
      switch (error.statusCode) {
        case 400:
          return this.handleBadRequest(error);
        case 401:
          return this.handleUnauthorized(error);
        case 403:
          return this.handleForbidden(error);
        case 404:
          return this.handleNotFound(error);
        case 409:
          return this.handleConflict(error);
        case 500:
          return 'Error interno del servidor. Por favor intenta más tarde.';
        default:
          return error.message || 'Error desconocido';
      }
    }

    return 'Error de conexión. Verifica tu internet.';
  }

  private static handleBadRequest(error: ApiError): string {
    if (error.details?.message) {
      if (Array.isArray(error.details.message)) {
        return error.details.message.join('\n');
      }
      return error.details.message;
    }
    return 'Datos inválidos. Por favor verifica los campos.';
  }

  private static handleUnauthorized(error: ApiError): string {
    // Limpiar tokens
    AsyncStorage.removeItem('accessToken');
    AsyncStorage.removeItem('refreshToken');
    
    return 'Sesión expirada. Por favor inicia sesión nuevamente.';
  }

  private static handleForbidden(error: ApiError): string {
    return 'No tienes permisos para realizar esta acción.';
  }

  private static handleNotFound(error: ApiError): string {
    return 'Recurso no encontrado.';
  }

  private static handleConflict(error: ApiError): string {
    if (error.details?.error === 'EMAIL_EXISTS') {
      return 'Este email ya está registrado.';
    }
    return 'Conflicto de datos. Por favor verifica la información.';
  }
}
```

### Uso Global

```typescript
// App.tsx
import { ErrorHandler } from './services/errorHandler';

// En cualquier llamada API
try {
  await userService.createUser(data);
} catch (error) {
  const message = ErrorHandler.handle(error);
  Alert.alert('Error', message);
}
```

---

## Ejemplos Completos

### Flujo Completo: Login → Listar Usuarios → Crear Usuario

```typescript
// Example: Complete User Management Flow
import React, { useState, useEffect } from 'react';
import { authService } from './services/auth.service';
import { userService } from './services/user.service';
import { ErrorHandler } from './services/errorHandler';

const UserManagementFlow = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState([]);

  // 1. Login
  const handleLogin = async () => {
    try {
      await authService.login({
        email: 'admin@mnksolutions.com',
        password: 'Admin123!',
      });
      setIsAuthenticated(true);
      await loadUsers();
    } catch (error) {
      Alert.alert('Error', ErrorHandler.handle(error));
    }
  };

  // 2. Listar usuarios
  const loadUsers = async () => {
    try {
      const response = await userService.getUsers(1, 20);
      setUsers(response.items);
    } catch (error) {
      Alert.alert('Error', ErrorHandler.handle(error));
    }
  };

  // 3. Crear usuario
  const createUser = async () => {
    try {
      const newUser = await userService.createUser({
        email: 'nuevo@example.com',
        password: 'Password123!',
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '+593987654321',
        companyId: 'uuid-empresa',
        roleId: 'uuid-rol',
        branchIds: ['uuid-sucursal'],
      });

      Alert.alert('Éxito', 'Usuario creado correctamente');
      await loadUsers(); // Recargar lista
    } catch (error) {
      Alert.alert('Error', ErrorHandler.handle(error));
    }
  };

  return (
    <View>
      {!isAuthenticated ? (
        <Button title="Iniciar Sesión" onPress={handleLogin} />
      ) : (
        <>
          <FlatList
            data={users}
            renderItem={({ item }) => (
              <Text>{item.firstName} {item.lastName}</Text>
            )}
          />
          <Button title="Crear Nuevo Usuario" onPress={createUser} />
        </>
      )}
    </View>
  );
};
```

---

## Mejores Prácticas

### 1. Manejo de Tokens

```typescript
// ✅ CORRECTO: Interceptar 401 y refrescar token
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.statusCode === 401) {
      try {
        await authService.refreshToken();
        // Reintentar request original
        return apiClient.request(error.config);
      } catch {
        // Logout y redirigir a login
        await authService.logout();
        navigation.navigate('Login');
      }
    }
    return Promise.reject(error);
  }
);

// ❌ INCORRECTO: No manejar expiración de tokens
```

### 2. Caché Local

```typescript
// ✅ CORRECTO: Cachear datos que no cambian frecuentemente
const getRoles = async (forceRefresh = false) => {
  const cacheKey = 'roles_cache';
  
  if (!forceRefresh) {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Si el caché tiene menos de 1 hora
      if (Date.now() - timestamp < 3600000) {
        return data;
      }
    }
  }

  const roles = await apiClient.get('/seguridades/roles');
  await AsyncStorage.setItem(cacheKey, JSON.stringify({
    data: roles,
    timestamp: Date.now(),
  }));
  
  return roles;
};
```

### 3. Validación Client-Side

```typescript
// ✅ CORRECTO: Validar antes de enviar al servidor
const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const createUser = async (data) => {
  // Validar localmente primero
  if (!validateEmail(data.email)) {
    Alert.alert('Error', 'Email inválido');
    return;
  }

  if (data.password.length < 6) {
    Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
    return;
  }

  // Enviar al servidor
  await userService.createUser(data);
};
```

### 4. Loading States

```typescript
// ✅ CORRECTO: Mostrar estados de carga
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const loadData = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await userService.getUsers();
    setUsers(data.items);
  } catch (err) {
    setError(ErrorHandler.handle(err));
  } finally {
    setLoading(false);
  }
};

// En el render
if (loading) return <ActivityIndicator />;
if (error) return <ErrorView message={error} />;
return <DataView data={users} />;
```

### 5. Paginación Infinita

```typescript
// ✅ CORRECTO: Implementar paginación infinita
const [users, setUsers] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);

const loadMore = async () => {
  if (loading || !hasMore) return;

  try {
    setLoading(true);
    const response = await userService.getUsers(page, 20);
    
    setUsers([...users, ...response.items]);
    setPage(page + 1);
    setHasMore(response.pagination.page < response.pagination.totalPages);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

// En FlatList
<FlatList
  data={users}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  ListFooterComponent={loading ? <ActivityIndicator /> : null}
/>
```

### 6. Debounce en Búsquedas

```typescript
// ✅ CORRECTO: Debounce para búsquedas
import { debounce } from 'lodash';

const [searchTerm, setSearchTerm] = useState('');

const debouncedSearch = useCallback(
  debounce(async (term: string) => {
    if (term.length < 3) return;
    
    const results = await userService.getUsers(1, 20, {
      search: term,
    });
    setUsers(results.items);
  }, 500),
  []
);

useEffect(() => {
  debouncedSearch(searchTerm);
}, [searchTerm, debouncedSearch]);
```

---

## Checklist de Integración

### Configuración Inicial
- [ ] Configurar baseURL de la API
- [ ] Implementar cliente HTTP con interceptores
- [ ] Configurar AsyncStorage para tokens
- [ ] Implementar manejo de errores global

### Autenticación
- [ ] Implementar login
- [ ] Implementar logout
- [ ] Implementar refresh token
- [ ] Proteger rutas que requieren autenticación

### Gestión de Usuarios
- [ ] Listar usuarios con paginación
- [ ] Ver detalle de usuario
- [ ] Crear usuario con rol y sucursales
- [ ] Actualizar usuario
- [ ] Eliminar usuario

### Autorización
- [ ] Implementar verificación de permisos
- [ ] Crear componentes protegidos
- [ ] Ocultar/deshabilitar acciones sin permisos

### Multiempresa
- [ ] Implementar contexto de empresa
- [ ] Permitir cambio de empresa
- [ ] Filtrar datos por empresa actual

### Mejoras
- [ ] Implementar caché local
- [ ] Agregar validaciones client-side
- [ ] Implementar loading states
- [ ] Agregar retry logic para requests fallidos
- [ ] Implementar analytics/tracking

---

## Soporte

- **Swagger**: http://localhost:3000/api
- **Postman**: `MNK_Service_API.postman_collection.json`
- **Especificación**: Ver `API_SPECIFICATION.md`
- **Arquitectura**: Ver `ADR.md`

