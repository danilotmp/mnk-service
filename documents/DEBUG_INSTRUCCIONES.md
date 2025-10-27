# 🐛 Guía de Debug - MNK Service

## Opciones de Debug

Hay varias formas de hacer debug del servidor NestJS:

## 1. 🔍 Debug con VS Code (Recomendado)

### Configuración automática

El proyecto ya incluye configuración de debug en `.vscode/launch.json`

### Cómo usar:

1. **Abre VS Code** en este proyecto
2. **Presiona F5** o ve a: `Run and Debug` → Selecciona `Debug NestJS` → Click en play ▶️
3. **Pon breakpoints** donde necesites en tu código
4. **Haz request** desde Postman o tu frontend
5. El debugger se detendrá en los breakpoints

### Breakpoints

Para poner un breakpoint:
- Click en el margen izquierdo al lado del número de línea
- O coloca el cursor y presiona `F9`

### Controles de Debug

- **Continue (F5)**: Continuar ejecución
- **Step Over (F10)**: Ejecutar línea actual
- **Step Into (F11)**: Entrar a función
- **Step Out (Shift+F11)**: Salir de función
- **Restart (Shift+Ctrl+F5)**: Reiniciar debug
- **Stop (Shift+F5)**: Detener debug

## 2. 🐛 Debug con Chrome DevTools

### Método manual

```bash
# Inicia el servidor en modo debug
npm run start:debug
```

Luego abre Chrome:
```
chrome://inspect
```

Click en "inspect" debajo de tu proceso Node

### Alternativa: usando la configuración Attach

1. Ejecuta: `npm run start:debug` en terminal
2. En VS Code: `Run and Debug` → `Debug NestJS (Attach)`

## 3. 📊 Debug de Tests

Para hacer debug de tests:

```bash
npm run test:debug
```

O en VS Code:
- Crea breakpoint en tu test
- Presiona `Ctrl+Shift+P` → "Debug: Start debugging"
- Selecciona "JavaScript Debug Terminal"
- Ejecuta: `npm run test:watch`

## 4. 🔧 Debug de API Requests

### En Postman

1. Agrega breakpoint en tu código (VS Code)
2. Ejecuta request en Postman
3. El debugger se detendrá en el breakpoint

### Ver logs en consola

El servidor imprime logs automáticamente:
- Errores capturados
- Requests procesados
- Información de autenticación

### Agregar console.log temporal

```typescript
console.log('=== DEBUG ===');
console.log('Variable valor:', variable);
console.log('Request:', req.body);
```

## 5. 📝 Debug de Variables

### En VS Code Debug

- **Variables**: Ver variables locales
- **Watch**: Agregar expresiones para monitorear
- **Call Stack**: Ver pila de llamadas
- **Breakpoints**: Ver todos los breakpoints

### Agregar watch expressions

1. Click en "Watch" panel en debug
2. Click en el + para agregar expresión
3. Escribe el nombre de la variable

Ejemplo:
```
usuario
req.body
error.message
```

## 6. 🚨 Debug de Errores

### Errores comunes y cómo debuggearlos:

#### Error 401 (Unauthorized)
```typescript
// En src/domains/seguridades/infrastructure/auth/jwt.strategy.ts
console.log('JWT Payload:', payload);
console.log('Usuario encontrado:', usuario);
```

#### Error de validación (400)
```typescript
// En el controller
console.log('DTO recibido:', dto);
console.log('Errores de validación:', validationErrors);
```

#### Error de base de datos
```typescript
// En repository
console.log('Query ejecutado:', query);
console.log('Resultados:', results);
```

## 7. 🔄 Debug con Hot Reload

El modo debug mantiene hot reload:
- Cambios en código se reflejan automáticamente
- Breakpoints se mantienen
- Debugger se conecta automáticamente

## 8. 📊 Debug de Performance

### Ver tiempos de ejecución

```typescript
const start = Date.now();
// ... código ...
const end = Date.now();
console.log(`Tiempo: ${end - start}ms`);
```

### Profiling

```bash
node --prof dist/main
```

## 9. 🎯 Debug por Módulo

Puedes poner breakpoints en:

- **Controllers**: `src/domains/*/presentation/controllers/*.ts`
- **Services**: `src/domains/*/application/services/*.ts`
- **Repositories**: `src/domains/*/infrastructure/repositories/*.ts`
- **Interceptors**: `src/common/interceptors/*.ts`
- **Filters**: `src/common/filters/*.ts`

## 10. 🛠️ Debug de Base de Datos

### Ver queries SQL

En `.env`:
```env
DB_LOGGING=true
```

### Logging manual

```typescript
import { Logger } from '@nestjs/common';
const logger = new Logger('MyService');
logger.debug('Valor:', valor);
```

## 📌 Tips de Debug

1. **Siempre inicia en modo debug**: Mejor tener los breakpoints activos
2. **Usa console.log temporalmente**: Para debugging rápido
3. **Monitorea la consola**: NestJS imprime errores automáticamente
4. **Revisa el terminal**: Hay información importante ahí
5. **Usa Postman**: Para hacer requests y ver respuestas

## 🎬 Ejemplo de Debug Completo

### Escenario: Debug de Login

1. **Pon breakpoint** en `auth.service.ts` línea 28:
```typescript
const usuario = await this.usuarioRepository.findByEmail(loginDto.email);
```

2. **Inicia debug** en VS Code (F5)

3. **Haz request** en Postman:
```
POST http://localhost:3000/api/seguridades/login
```

4. **El debugger se detiene** en el breakpoint

5. **Inspecciona**:
   - `loginDto` - ver email y password
   - `usuario` - ver si existe
   - `isPasswordValid` - ver comparación

6. **Continúa** con F5 o F10

## ⚙️ Configuración Avanzada

### Cambiar puerto de debug

En `.vscode/launch.json`:
```json
{
  "port": 9229  // Puerto por defecto
}
```

### Debug en puerto específico

```bash
node --inspect=9229 dist/main
```

## 🐛 Troubleshooting

### Debug no se conecta
- Verifica que el puerto 9229 esté libre
- Reinicia VS Code
- Usa `Debug NestJS (Attach)` si es necesario

### No ve los logs
- Verifica que `DB_LOGGING=true` en `.env`
- Revisa la consola integrada de VS Code

### Breakpoints no funcionan
- Verifica que estés en modo debug
- Compila con `npm run build` si es necesario

---

**¡Listo para debuggear! 🎉**

