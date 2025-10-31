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

### 1. Obtener Menú

```
GET /api/menu
Authorization: Bearer <accessToken>  (Opcional)
Accept-Language: es | en | pt
```

**Descripción:**
- **Con token válido (usuario autenticado)**: Devuelve menú completo según permisos del rol del usuario (items públicos + privados según permisos)
- **Sin token o token inválido (usuario no autenticado)**: Devuelve solo items públicos

**Comportamiento:**
- No requiere autenticación obligatoria
- Si se envía token válido, se usa para obtener los permisos del usuario desde su rol
- Si no se envía token o es inválido, se trata como no autenticado y solo devuelve items públicos

**Respuesta con token (autenticado):**
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
            {
              "id": "network-security",
              "label": "Network Security",
              "route": "/products/network-security"
            }
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

**Respuesta sin token (no autenticado):**
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

### 3. Componente de Menú

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

### 4. Protección de Rutas

```typescript
// components/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallbackRoute?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  fallbackRoute = '/',
}) => {
  const { isAuthenticated, accessToken } = useAuth();
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      if (!isAuthenticated) {
        // Si no está autenticado, redirigir a login
        navigation.navigate('Login' as never);
        return;
      }

      if (!requiredPermission) {
        // Si no requiere permiso específico, solo necesita estar autenticado
        setHasPermission(true);
        setLoading(false);
        return;
      }

      // Aquí puedes implementar verificación de permisos
      // Por ahora, si está autenticado, asumimos que tiene permiso
      // En producción, deberías verificar el permiso específico con el backend
      setHasPermission(true);
      setLoading(false);
    };

    checkPermission();
  }, [isAuthenticated, requiredPermission]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No tienes permisos para acceder a esta página</Text>
      </View>
    );
  }

  return <>{children}</>;
};
```

### 5. Uso del Menú en Navegación

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

- `GET /api/menu` - Menú del sistema
  - Token opcional (no requiere autenticación obligatoria)
  - Con token válido: devuelve menú completo según permisos del rol (items públicos + privados)
  - Sin token o token inválido: devuelve solo items públicos

### Implementación

1. **Servicio de Menú**: Clase para consumir endpoints
2. **Hook Personalizado**: `useMenu()` para manejar estado
3. **Componente de Menú**: Renderizar menú dinámico
4. **Protección de Rutas**: Componente para proteger rutas privadas

### Características

✅ Menú dinámico según permisos  
✅ Páginas públicas y privadas  
✅ Soporte multiidioma  
✅ Actualización automática  
✅ Manejo de errores  

---

**¡Sistema listo para integrar en React Native! 🎉**

