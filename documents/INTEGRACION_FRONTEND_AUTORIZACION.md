# 🎨 Guía de Integración Frontend - Sistema de Autorización

## 📋 Descripción

Este documento explica cómo integrar el sistema de autorización y menú dinámico desde React Native (Frontend).

## 🎯 Objetivo

Proporcionar ejemplos claros y prácticas para:
- Obtener el menú dinámico según permisos del usuario
- Verificar permisos antes de mostrar contenido
- Proteger rutas según permisos
- Manejar páginas públicas y privadas

## 🔗 Endpoints Disponibles

### 1. Obtener Menú Privado

```
GET /api/seguridades/menu
Authorization: Bearer <accessToken>
Accept-Language: es | en | pt
```

**Descripción:**
- **Requiere token JWT válido.** El backend extrae el `userId` del token y construye el menú privado combinando los permisos de todos los roles activos del usuario.
- Si el usuario no tiene permisos asignados, devuelve un arreglo vacío y una alerta informativa en `result.details` para que el frontend muestre el mensaje correspondiente.
- Los items públicos deben gestionarse en el frontend (por ejemplo, secciones de marketing o páginas públicas).

**Respuesta (con permisos):**
```json
{
  "data": [
    {
      "id": "home",
      "label": "Inicio",
      "route": "/"
    },
    {
      "id": "explore",
      "label": "Explorar",
      "route": "/main/explore"
    },
    {
      "id": "products",
      "label": "Productos",
      "columns": [
        {
          "title": "Productos",
          "items": [
            { "id": "network-security", "label": "Network Security", "route": "/products/network-security" }
          ]
        }
      ]
    },
    {
      "id": "loans",
      "label": "Préstamos",
      "submenu": [
        {
          "id": "multicredit",
          "label": "Multicrédito",
          "description": "Préstamo multicrédito",
          "route": "/loans/multicredit"
        }
      ]
    }
  ],
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa",
    "details": null
  }
}
```

### 2. Validar Acceso Puntual

```
GET /api/seguridades/access?route=/ruta-del-frontend
Authorization: Bearer <accessToken>
Accept-Language: es | en | pt
```

**Descripción:**
- Endpoint ligero para que el frontend pregunte si el usuario autenticado puede acceder a una ruta específica (por ejemplo `/security/users`).
- Devuelve `200` cuando el usuario tiene el permiso asociado a la ruta o `403` cuando no está autorizado.
- El backend normaliza la ruta (`/ruta`, sin dominio ni query params) y busca primero en la tabla de permisos y, si es necesario, en la estructura del menú.

**Respuesta 200 (acceso permitido):**
```json
{
  "data": {
    "route": "/security/users",
    "access": true
  },
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa",
    "details": null
  }
}
```

**Respuesta 403 (acceso denegado):**
```json
{
  "data": null,
  "result": {
    "statusCode": 403,
    "description": "No tienes permisos suficientes para acceder a este recurso",
    "details": {
      "route": "/security/users"
    }
  }
}
```

## 📱 Implementación en React Native

### 1. Servicio de Menú

```typescript
// services/menu.service.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface MenuItem {
  id: string;
  label: string;
  route?: string;
  columns?: Array<{
    title: string;
    items: Array<{
      id: string;
      label: string;
      route: string;
    }>;
  }>;
  submenu?: Array<{
    id: string;
    label: string;
    route: string;
    description?: string;
  }>;
}

export interface MenuResponse {
  data: MenuItem[];
  result: {
    statusCode: number;
    description: string;
    details: any;
  };
}

export class MenuService {
  /**
   * Obtener menú del sistema
   * 
   * Comportamiento:
   * - Si se envía accessToken válido: devuelve menú completo según permisos del rol del usuario
   * - Si no se envía accessToken o es inválido: devuelve solo items públicos
   * 
   * @param accessToken Token de acceso (opcional)
   * @param language Idioma (es, en, pt)
   * @returns Array de items del menú filtrados según permisos
   */
  static async getMenu(accessToken?: string, language: string = 'es'): Promise<MenuItem[]> {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        'Accept-Language': language,
      };

      // Agregar token si existe (opcional)
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await axios.get<MenuResponse>(
        `${API_BASE_URL}/menu`,
        { headers }
      );

      if (response.data.result.statusCode === 200) {
        return response.data.data;
      }

      throw new Error(response.data.result.description);
    } catch (error) {
      console.error('Error obteniendo menú:', error);
      throw error;
    }
  }
}
```

### 2. Hook Personalizado para Menú

```typescript
// hooks/useMenu.ts
import { useState, useEffect } from 'react';
import { MenuService, MenuItem } from '../services/menu.service';
import { useAuth } from './useAuth'; // Tu hook de autenticación

export const useMenu = (language: string = 'es') => {
  const { accessToken, isAuthenticated } = useAuth();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        // El servicio maneja automáticamente si hay token o no
        // Si hay token válido: devuelve menú según permisos
        // Si no hay token o es inválido: devuelve solo items públicos
        const menuItems = await MenuService.getMenu(accessToken || undefined, language);

        setMenu(menuItems);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el menú');
        console.error('Error en useMenu:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [isAuthenticated, accessToken, language]);

  return { menu, loading, error, refetch: () => fetchMenu() };
};
```

### 3. Servicio de Autorización Puntual

```typescript
// services/authorization.service.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export class AuthorizationService {
  /**
   * Valida si el usuario autenticado puede acceder a la ruta indicada.
   * Devuelve true cuando el backend responde 200, lanza error cuando responde 403.
   */
  static async checkAccess(
    route: string,
    accessToken: string,
    language: string = 'es',
  ): Promise<void> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'Accept-Language': language,
      'Content-Type': 'application/json',
    };

    await axios.get(`${API_BASE_URL}/seguridades/access`, {
      headers,
      params: { route },
    });
  }
}
```

### 4. Componente de Menú

```typescript
// components/Menu.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMenu } from '../hooks/useMenu';
import { useNavigation } from '@react-navigation/native';

export const Menu: React.FC = () => {
  const { menu, loading, error } = useMenu();
  const navigation = useNavigation();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Cargando menú...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  const handleMenuItemPress = (route: string) => {
    navigation.navigate(route as never);
  };

  const renderMenuItem = (item: MenuItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.menuItem}
        onPress={() => item.route && handleMenuItemPress(item.route)}
      >
        <Text style={styles.menuLabel}>{item.label}</Text>

        {/* Renderizar submenú */}
        {item.submenu && (
          <View style={styles.submenu}>
            {item.submenu.map((subItem) => (
              <TouchableOpacity
                key={subItem.id}
                style={styles.submenuItem}
                onPress={() => handleMenuItemPress(subItem.route)}
              >
                <Text style={styles.submenuLabel}>{subItem.label}</Text>
                {subItem.description && (
                  <Text style={styles.submenuDescription}>{subItem.description}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Renderizar columns */}
        {item.columns && (
          <View style={styles.columns}>
            {item.columns.map((column, colIndex) => (
              <View key={colIndex} style={styles.column}>
                <Text style={styles.columnTitle}>{column.title}</Text>
                {column.items.map((colItem) => (
                  <TouchableOpacity
                    key={colItem.id}
                    style={styles.columnItem}
                    onPress={() => handleMenuItemPress(colItem.route)}
                  >
                    <Text style={styles.columnLabel}>{colItem.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {menu.map(renderMenuItem)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  menuItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  submenu: {
    marginTop: 8,
    paddingLeft: 16,
  },
  submenuItem: {
    paddingVertical: 8,
  },
  submenuLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  submenuDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  columns: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  column: {
    flex: 1,
    minWidth: 150,
    marginRight: 16,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  columnItem: {
    paddingVertical: 6,
  },
  columnLabel: {
    fontSize: 13,
    color: '#666',
  },
  error: {
    color: 'red',
    fontSize: 14,
  },
});
```

### 5. Protección de Rutas

```typescript
// components/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Button } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { AuthorizationService } from '../services/authorization.service';
import axios from 'axios';

interface ProtectedRouteProps {
  children: React.ReactNode;
  routePath: string; // Ruta exacta que se desea validar (ej: '/security/users')
  fallbackScreen?: string;
  language?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  routePath,
  fallbackScreen = 'Home',
  language = 'es',
}) => {
  const { isAuthenticated, accessToken } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const validateAccess = async () => {
      if (!isAuthenticated || !accessToken) {
        navigation.navigate('Login' as never);
        return;
      }

      try {
        await AuthorizationService.checkAccess(routePath, accessToken, language);
        setHasPermission(true);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          setHasPermission(false);
          setErrorMessage('No tienes permisos para acceder a esta página');
        } else {
          console.error('Error validando acceso:', error);
          setErrorMessage('Ocurrió un error verificando los permisos');
        }
      } finally {
        setLoading(false);
      }
    };

    validateAccess();
  }, [isAuthenticated, accessToken, routePath, fallbackScreen, language]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Validando acceso...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 16, marginBottom: 16 }}>{errorMessage}</Text>
        <Button title="Volver al inicio" onPress={() => navigation.navigate(fallbackScreen as never)} />
      </View>
    );
  }

  return <>{children}</>;
};
```

### 6. Uso del Menú en Navegación

```typescript
// App.tsx o tu componente principal
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Menu } from './components/Menu';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomeScreen } from './screens/HomeScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { LoginScreen } from './screens/LoginScreen';

const Stack = createStackNavigator();

export const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Explore">
          {() => (
            <ProtectedRoute requiredPermission="explore">
              <ExploreScreen />
            </ProtectedRoute>
          )}
        </Stack.Screen>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
      {/* Menú renderizado aquí */}
      <Menu />
    </NavigationContainer>
  );
};
```

## 🔄 Actualización del Menú

El menú se actualiza automáticamente cuando:
- El usuario inicia sesión
- El usuario cierra sesión
- Cambia el idioma (`Accept-Language`)
- Se actualiza el token de acceso

```typescript
// Ejemplo de actualización del menú después de login
const handleLogin = async (credentials: LoginCredentials) => {
  try {
    const response = await login(credentials);
    // Guardar token
    await saveAccessToken(response.data.data.accessToken);
    // El hook useMenu se actualizará automáticamente
  } catch (error) {
    console.error('Error en login:', error);
  }
};
```

## 📊 Estructura de Respuesta

### Menú Completo (Usuario Autenticado)

```json
{
  "data": [
    {
      "id": "home",
      "label": "Inicio",
      "route": "/"
    },
    {
      "id": "explore",
      "label": "Explorar",
      "route": "/main/explore"
    },
    {
      "id": "products",
      "label": "Productos",
      "columns": [
        {
          "title": "Productos",
          "items": [
            { "id": "network-security", "label": "Network Security", "route": "/products/network-security" }
          ]
        }
      ]
    }
  ],
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa",
    "details": null
  }
}
```

### Menú Público (Usuario No Autenticado)

```json
{
  "data": [
    {
      "id": "home",
      "label": "Inicio",
      "route": "/"
    },
    {
      "id": "contact",
      "label": "Contacto",
      "route": "/main/contact"
    }
  ],
  "result": {
    "statusCode": 200,
    "description": "Operación exitosa",
    "details": null
  }
}
```

## 🌐 Manejo de Idiomas

El menú se puede obtener en diferentes idiomas usando el header `Accept-Language`:

```typescript
// Español (por defecto)
const menuES = await MenuService.getMenu(token, 'es');

// Inglés
const menuEN = await MenuService.getMenu(token, 'en');

// Portugués
const menuPT = await MenuService.getMenu(token, 'pt');
```

## ⚠️ Manejo de Errores

```typescript
try {
  const menu = await MenuService.getMenu(accessToken);
  // Usar menú
} catch (error: any) {
  if (error.response?.status === 401) {
    // Token expirado o inválido
    // Redirigir a login
  } else if (error.response?.status === 403) {
    // Sin permisos
    // Mostrar mensaje de error
  } else {
    // Error genérico
    console.error('Error obteniendo menú:', error);
  }
}
```

## 📝 Resumen

### Endpoints

- `GET /api/seguridades/menu` – Menú privado según permisos del usuario autenticado
- `GET /api/seguridades/access?route=/ruta` – Validación puntual de acceso (200/403)

### Implementación

1. **Servicio de Menú**: Clase para consumir el endpoint del menú privado
2. **Hook Personalizado**: `useMenu()` para manejar estado y refrescos
3. **Servicio de Autorización Puntual**: `AuthorizationService.checkAccess()` para validar rutas
4. **Componente de Menú**: Renderizar el menú dinámico
5. **ProtectedRoute**: Consulta el endpoint puntual y redirige al usuario si recibe 403

### Características

✅ Menú dinámico según permisos  
✅ Páginas públicas y privadas  
✅ Soporte multiidioma  
✅ Actualización automática  
✅ Manejo de errores y redirección en rutas no autorizadas  

---

**¡Sistema listo para integrar en React Native! 🎉**

