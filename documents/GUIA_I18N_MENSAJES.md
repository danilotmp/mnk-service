# 🌍 Guía de Mensajes Multilenguaje (i18n)

## 📋 Descripción

Este documento explica cómo funciona el sistema de mensajes centralizados y multilenguaje implementado en el backend.

## 🎯 Objetivo

Centralizar todos los mensajes de la aplicación en un solo lugar, soportar múltiples idiomas y facilitar el mantenimiento.

## 📁 Estructura de Archivos

```
src/
├── common/
│   └── messages/
│       ├── i18n/
│       │   └── locales/
│       │       ├── es/
│       │       │   ├── errors.json      ← Mensajes de error en español
│       │       │   └── success.json     ← Mensajes de éxito en español
│       │       ├── en/
│       │       │   ├── errors.json      ← Mensajes de error en inglés
│       │       │   └── success.json     ← Mensajes de éxito en inglés
│       │       └── pt/
│       │           ├── errors.json      ← Mensajes de error en portugués
│       │           └── success.json     ← Mensajes de éxito en portugués
│       ├── message-codes.ts            ← Enum de códigos (Type-safe)
│       ├── message.service.ts          ← Servicio de mensajes
│       ├── response.helper.ts          ← Helper para respuestas
│       └── messages.module.ts          ← Módulo exportable
│
├── shared/
│   ├── validators/
│   │   ├── cedula.validator.ts        ← Validación de cédula
│   │   └── ruc.validator.ts           ← Validación de RUC
│   ├── calculators/
│   │   └── iva.calculator.ts          ← Cálculos de IVA
│   └── shared.module.ts               ← Módulo compartido
```

## 🏷️ Códigos de Mensaje (Type-Safe)

### Enumeración de Códigos

```typescript
import { MessageCode } from '@/common/messages/message-codes';

// Success codes
MessageCode.SUCCESS
MessageCode.LOGIN_SUCCESS
MessageCode.REGISTER_SUCCESS
MessageCode.USER_CREATED

// Error codes
MessageCode.INVALID_CREDENTIALS
MessageCode.USER_INACTIVE
MessageCode.TOKEN_EXPIRED
MessageCode.EMAIL_EXISTS
```

### Ventajas

✅ **Autocompletado** en IDE  
✅ **Type-safe**: No se pueden usar códigos inválidos  
✅ **Refactor seguro**: Cambiar código actualiza todas las referencias  
✅ **Documentación**: El código autodocumenta el mensaje

## 📝 Archivos de Traducción

### Estructura JSON

```json
{
  "CODIGO_MENSAJE": {
    "message": "Mensaje para mostrar al usuario",
    "type": "error|success|warning|info"
  }
}
```

### Ejemplo

```json
// es/errors.json
{
  "INVALID_CREDENTIALS": {
    "message": "Credenciales inválidas",
    "type": "error"
  }
}
```

```json
// en/errors.json
{
  "INVALID_CREDENTIALS": {
    "message": "Invalid credentials",
    "type": "error"
  }
}
```

```json
// pt/errors.json
{
  "INVALID_CREDENTIALS": {
    "message": "Credenciais inválidas",
    "type": "error"
  }
}
```

## 🚀 Uso en los Servicios

### Antes (Hardcoded)

```typescript
throw new UnauthorizedException(
  createErrorResponse('Credenciales inválidas', 'detalle', 401)
);
```

### Después (Con i18n)

```typescript
const errorResponse = await this.responseHelper.errorResponse(
  MessageCode.INVALID_CREDENTIALS,
  'es',  // Idioma
  'Detalle técnico',  // Detalles opcionales
  401
);
throw new UnauthorizedException(errorResponse);
```

### Ejemplo Completo en Service

```typescript
@Injectable()
export class AuthService {
  constructor(
    private usuarioRepository: UsuarioRepository,
    private responseHelper: ResponseHelper,  // ← Inyectar helper
  ) {}

  async login(loginDto: LoginDto, lang: string = 'es') {
    const usuario = await this.usuarioRepository.findByEmail(loginDto.email);
    
    if (!usuario) {
      // Error con código estandarizado
      const errorResponse = await this.responseHelper.errorResponse(
        MessageCode.INVALID_CREDENTIALS,  // ← Código
        lang,                                // ← Idioma
        'El email o contraseña son incorrectos',  // ← Detalles técnicos
        401
      );
      throw new UnauthorizedException(errorResponse);
    }

    // Validar contraseña...
    
    // Respuesta de éxito
    return await this.responseHelper.successResponse(
      { user, tokens },              // ← Datos
      MessageCode.LOGIN_SUCCESS,     // ← Código
      lang,                          // ← Idioma
      200                            // ← Status code
    );
  }
}
```

## 🌍 Detección de Idioma

### Opción 1: Postman (Visual)

1. Abre tu colección de Postman
2. Selecciona la petición que quieres probar
3. Ve a la pestaña **Headers**
4. Agrega:
   - **Key**: `Accept-Language`
   - **Value**: `es` (español), `en` (inglés), o `pt` (portugués)
5. Envía la petición

**Ejemplo de headers en Postman:**
```
Authorization: Bearer eyJhbGc...
Content-Type: application/json
Accept-Language: en
```

### Opción 2: cURL (Terminal)

```bash
# Español (por defecto)
curl -X POST http://localhost:3000/api/seguridades/login \
  -H "Content-Type: application/json" \
  -H "Accept-Language: es" \
  -d '{"email": "admin@mnksolutions.com", "password": "Admin123!"}'

# Inglés
curl -X POST http://localhost:3000/api/seguridades/login \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en" \
  -d '{"email": "admin@mnksolutions.com", "password": "Admin123!"}'

# Portugués
curl -X POST http://localhost:3000/api/seguridades/login \
  -H "Content-Type: application/json" \
  -H "Accept-Language: pt" \
  -d '{"email": "admin@mnksolutions.com", "password": "Admin123!"}'
```

### Opción 3: React Native (JavaScript)

#### Con fetch nativo:
```typescript
// Ejemplo con fetch
const login = async (email: string, password: string, lang: string = 'es') => {
  const response = await fetch('http://localhost:3000/api/seguridades/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': lang, // 'es', 'en', o 'pt'
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  console.log(data.result.description); // Mensaje según el idioma
  return data;
};

// Uso
await login('admin@mnksolutions.com', 'Admin123!', 'en'); // Inglés
await login('admin@mnksolutions.com', 'Admin123!', 'es'); // Español
```

#### Con Axios:
```typescript
import axios from 'axios';

// Configurar idioma por defecto para todas las peticiones
axios.defaults.headers.common['Accept-Language'] = 'en';

// O configurar por instancia
const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'en', // Cambiar según necesites
  },
});

// Uso
const response = await apiClient.post('/api/seguridades/login', {
  email: 'admin@mnksolutions.com',
  password: 'Admin123!',
});

console.log(response.data.result.description); // "Login successful"
```

#### O por petición individual:
```typescript
const response = await axios.post(
  'http://localhost:3000/api/seguridades/login',
  { email: 'admin@mnksolutions.com', password: 'Admin123!' },
  { 
    headers: { 
      'Accept-Language': 'en' // Especifica el idioma por petición
    } 
  }
);
```

### Opción 4: Manual (Backend)

```typescript
// En el controller
@Get('productos')
async getProductos(@Request() req) {
  const lang = req.headers['accept-language'] || 'es';
  return this.service.findAll(lang);
}
```

### Respuestas según el Idioma

**Con `Accept-Language: es`:**
```json
{
  "data": { ... },
  "result": {
    "statusCode": 200,
    "description": "Inicio de sesión exitoso",
    "details": null
  }
}
```

**Con `Accept-Language: en`:**
```json
{
  "data": { ... },
  "result": {
    "statusCode": 200,
    "description": "Login successful",
    "details": null
  }
}
```

**Con `Accept-Language: pt`:**
```json
{
  "data": { ... },
  "result": {
    "statusCode": 200,
    "description": "Login bem-sucedido",
    "details": null
  }
}
```

### Nota Importante

- Si **no** envías el header `Accept-Language`, el sistema usará el idioma por defecto: **español (es)**
- Los valores aceptados son: `es`, `en`, `pt`
- Cualquier otro valor usará el idioma por defecto

## 📊 Tipos de Mensajes Disponibles

### Success

```typescript
MessageCode.SUCCESS
MessageCode.LOGIN_SUCCESS
MessageCode.REGISTER_SUCCESS
MessageCode.USER_CREATED
MessageCode.TOKEN_REFRESHED
MessageCode.PROFILE_UPDATED
MessageCode.LOGOUT_SUCCESS
```

### Errors

```typescript
MessageCode.INTERNAL_ERROR
MessageCode.UNAUTHORIZED
MessageCode.FORBIDDEN
MessageCode.NOT_FOUND
MessageCode.VALIDATION_ERROR
MessageCode.INVALID_CREDENTIALS
MessageCode.USER_INACTIVE
MessageCode.TOKEN_EXPIRED
MessageCode.TOKEN_INVALID
MessageCode.EMAIL_EXISTS
MessageCode.INVALID_EMAIL
MessageCode.INVALID_PASSWORD
MessageCode.PASSWORD_TOO_SHORT
MessageCode.USER_NOT_FOUND
MessageCode.COMPANY_NOT_FOUND
MessageCode.BRANCH_NOT_FOUND
```

## 🔧 Agregar Nuevo Código de Mensaje

### 1. Agregar al Enum

```typescript
// src/common/messages/message-codes.ts
export enum MessageCode {
  // ... existentes
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',  // ← Nuevo
}
```

### 2. Agregar Traducción en cada Idioma

```json
// src/common/messages/i18n/locales/es/errors.json
{
  "PRODUCT_NOT_FOUND": {
    "message": "Producto no encontrado",
    "type": "error"
  }
}
```

```json
// src/common/messages/i18n/locales/en/errors.json
{
  "PRODUCT_NOT_FOUND": {
    "message": "Product not found",
    "type": "error"
  }
}
```

### 3. Usar en el Servicio

```typescript
if (!producto) {
  const errorResponse = await this.responseHelper.errorResponse(
    MessageCode.PRODUCT_NOT_FOUND,  // ← Nuevo código
    lang
  );
  throw new NotFoundException(errorResponse);
}
```

## 🛠️ Validaciones Comunes (Shared Module)

### Validar Cédula

```typescript
import { CedulaValidator } from '@/shared/validators/cedula.validator';

@Injectable()
export class MiService {
  constructor(
    private cedulaValidator: CedulaValidator,
    private responseHelper: ResponseHelper,
  ) {}

  async validateCedula(cedula: string, lang: string) {
    const formattedCedula = this.cedulaValidator.format(cedula);
    
    if (!this.cedulaValidator.validate(formattedCedula)) {
      return await this.responseHelper.errorResponse(
        MessageCode.INVALID_CEDULA,
        lang
      );
    }
    
    // Cédula válida, continuar...
  }
}
```

### Calcular IVA

```typescript
import { IvaCalculator } from '@/shared/calculators/iva.calculator';

@Injectable()
export class MiService {
  constructor(
    private ivaCalculator: IvaCalculator,
  ) {}

  async calculatePrice(subtotal: number, companyCode: string) {
    // Obtener IVA de configuración
    const ivaPercentage = this.ivaCalculator.getIVAPercentage(companyCode);
    
    // Calcular IVA
    const iva = this.ivaCalculator.calculateIVA(subtotal, companyCode);
    
    // Calcular total
    const total = this.ivaCalculator.calculateTotalWithIVA(subtotal, companyCode);
    
    return { subtotal, iva, total };
  }
}
```

## 🎯 Ejemplos de Uso

### Ejemplo 1: Endpoint Público

```typescript
@Get('productos')
async getProductos(@Request() req) {
  const lang = req.headers['accept-language'] || 'es';
  
  const productos = await this.repository.findAll();
  
  return await this.responseHelper.successResponse(
    productos,
    MessageCode.SUCCESS,
    lang
  );
}
```

### Ejemplo 2: Endpoint Privado

```typescript
@Post('productos')
@UseGuards(JwtAuthGuard)
async createProducto(@Body() dto: CreateProductoDto, @Request() req) {
  const lang = req.headers['accept-language'] || 'es';
  
  const producto = await this.service.create(dto);
  
  return await this.responseHelper.successResponse(
    producto,
    MessageCode.SUCCESS,
    lang,
    201  // Created
  );
}
```

### Ejemplo 3: Error con Validación

```typescript
async validateBusinessRule(data: any, lang: string) {
  if (!this.validateRule(data)) {
    const errorResponse = await this.responseHelper.errorResponse(
      MessageCode.BUSINESS_RULE_VIOLATION,
      lang,
      'La regla de negocio no se cumple',
      400
    );
    throw new BadRequestException(errorResponse);
  }
}
```

### Ejemplo 4: Usando Validadores del Shared Module

```typescript
import { CedulaValidator } from '@/shared/validators/cedula.validator';

async validateData(data: UserData, lang: string) {
  // Validar cédula
  if (!this.cedulaValidator.validate(data.cedula)) {
    return await this.responseHelper.errorResponse(
      MessageCode.INVALID_CEDULA,
      lang
    );
  }
  
  // Validar RUC
  if (!this.rucValidator.validate(data.ruc)) {
    return await this.responseHelper.errorResponse(
      MessageCode.INVALID_RUC,
      lang
    );
  }
  
  // Todo válido
  return await this.responseHelper.successResponse(
    data,
    MessageCode.SUCCESS,
    lang
  );
}
```

## 📋 Tabla de Códigos por Tipo

| Tipo | Códigos | Uso |
|------|---------|-----|
| **Success** | `SUCCESS`, `LOGIN_SUCCESS`, `REGISTER_SUCCESS`, `USER_CREATED`, `TOKEN_REFRESHED`, `PROFILE_UPDATED`, `LOGOUT_SUCCESS` | Operaciones exitosas |
| **Error General** | `INTERNAL_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR` | Errores generales |
| **Auth Error** | `INVALID_CREDENTIALS`, `USER_INACTIVE`, `TOKEN_EXPIRED`, `TOKEN_INVALID` | Errores de autenticación |
| **Validation Error** | `EMAIL_EXISTS`, `INVALID_EMAIL`, `INVALID_PASSWORD`, `PASSWORD_TOO_SHORT` | Errores de validación |
| **Business Error** | `USER_NOT_FOUND`, `COMPANY_NOT_FOUND`, `BRANCH_NOT_FOUND` | Reglas de negocio |

## 🌐 Idiomas Soportados

| Código | Idioma | Estado |
|--------|--------|--------|
| `es` | Español | ✅ Completo |
| `en` | Inglés | ✅ Completo |
| `pt` | Portugués | ✅ Completo |

## 🔧 Configuración

### Variables de Entorno

```env
# Idioma por defecto
DEFAULT_LANGUAGE=es

# IVA por defecto (%)
DEFAULT_IVA=12
```

### Uso en el Código

```typescript
// Detectar idioma automáticamente
const lang = req.headers['accept-language'] || 'es';

// O usar el config
const defaultLang = this.configService.get('defaultLanguage', 'es');

// O pasar explícitamente
await this.responseHelper.successResponse(data, MessageCode.SUCCESS, 'en');
```

## 📊 Comparación: Antes vs Después

### Antes ❌

```typescript
return createSuccessResponse(data, 'Usuario creado exitosamente');
throw new UnauthorizedException(
  createErrorResponse('Credenciales inválidas', 'detalle', 401)
);
```

**Problemas:**
- Mensajes hardcoded
- No hay multilenguaje
- Difícil de mantener
- No escalable

### Después ✅

```typescript
return await this.responseHelper.successResponse(
  data,
  MessageCode.REGISTER_SUCCESS,
  lang
);
throw new UnauthorizedException(
  await this.responseHelper.errorResponse(
    MessageCode.INVALID_CREDENTIALS,
    lang,
    'detalle',
    401
  )
);
```

**Ventajas:**
- Mensajes centralizados
- Multilenguaje automático
- Type-safe
- Escalable

## 🎨 Flujo Completo

```
1. Request con Accept-Language: en
   ↓
2. Controller extrae el idioma
   ↓
3. Service usa ResponseHelper
   ↓
4. ResponseHelper usa MessageService
   ↓
5. MessageService obtiene traducción
   ↓
6. Retorna mensaje en el idioma correcto
```

## 📝 Resumen

### Cómo usar:

1. **Inyectar dependencias:**
   ```typescript
   constructor(
     private responseHelper: ResponseHelper,
   ) {}
   ```

2. **Usar en servicios:**
   ```typescript
   return await this.responseHelper.successResponse(
     data,
     MessageCode.SUCCESS,
     lang
   );
   ```

3. **Agregar código nuevo:**
   - Agregar al enum `MessageCode`
   - Agregar traducciones en JSON
   - Usar en el código

### Beneficios:

✅ Centralización de mensajes  
✅ Multilenguaje automático  
✅ Type-safe con enums  
✅ Escalable y mantenible  
✅ Validaciones reutilizables  

---

**¡Sistema listo para usar! 🎉**

