# 🌐 Endpoints Públicos vs Privados - Arquitectura

## ✅ La Aplicación YA Está Preparada

La arquitectura actual **SOPORTA** endpoints públicos y privados de forma correcta. Aquí te explico cómo funciona.

## 🔓 Endpoints Públicos (Sin Autenticación)

### Características
- **Sin `@UseGuards(JwtAuthGuard)`**
- **Pueden acceder a la BDD**
- **No requieren token**
- **Header Authorization opcional**

### Ejemplos Actuales

```typescript
@Controller('seguridades')
export class SeguridadesController {
  
  @Post('login')      // ✅ PÚBLICO - No tiene guard
  async login(@Body() loginDto: LoginDto) {
    // Accede a BDD sin problemas
    const usuario = await this.usuarioRepository.findByEmail(loginDto.email);
    // ...
  }

  @Post('register')   // ✅ PÚBLICO - No tiene guard
  async register(@Body() registerDto: RegisterDto) {
    // Accede a BDD sin problemas
    // ...
  }

  @Post('refresh-token')  // ✅ PÚBLICO - No tiene guard
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    // Accede a BDD sin problemas
    // ...
  }
}
```

## 🔒 Endpoints Privados (Con Autenticación)

### Características
- **Con `@UseGuards(JwtAuthGuard)`**
- **Requieren token en header**
- **Acceso a usuario autenticado**
- **Validación automática de permisos**

### Ejemplos Actuales

```typescript
@Controller('seguridades')
export class SeguridadesController {
  
  @Get('profile')
  @UseGuards(JwtAuthGuard)  // ✅ PRIVADO - Con guard
  async getProfile(@Request() req) {
    // El usuario viene del guard (req.user)
    // Accede a BDD sin problemas
    return this.usuarioService.getProfile(req.user.userId);
  }
}

@Controller('usuarios')
export class UsuarioController {
  
  @Get('me')
  @UseGuards(JwtAuthGuard)  // ✅ PRIVADO - Con guard
  async getCurrentUser(@Request() req) {
    // El usuario viene del guard
    return this.usuarioService.getProfile(req.user.userId);
  }
}
```

## 📊 Comparación

| Tipo | Guard | Token Requerido | Acceso BDD | Casos de Uso |
|------|-------|-----------------|------------|---------------|
| **Público** | ❌ No | ❌ No | ✅ Sí | Login, Register, Catálogos públicos |
| **Privado** | ✅ Sí | ✅ Sí | ✅ Sí | Perfil, Operaciones sensibles |

## 🏗️ Componentes Globales vs Selectivos

### Componentes Globales (Aplican a TODOS los endpoints)

```typescript
// 1. TransformResponseInterceptor
// Transforma todas las respuestas al formato estándar
// NO valida tokens ✅

// 2. HttpExceptionFilter
// Formatea todos los errores
// NO valida tokens ✅

// 3. MultiCompanyMiddleware
// Captura headers multiempresa
// NO valida tokens ✅
```

### Guard Selectivo (Solo donde se usa)

```typescript
// Solo se aplica con @UseGuards(JwtAuthGuard)
// NO es global ✅
```

## 🎯 Casos de Uso Reales

### 1. Catálogo Público de Productos

```typescript
@Controller('productos')
export class ProductosController {
  
  // PÚBLICO - Cualquiera puede ver productos
  @Get()
  async getAll() {
    return this.productosService.findAll();  // ✅ Accede a BDD
  }

  // PÚBLICO - Ver un producto específico
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.productosService.findOne(id);  // ✅ Accede a BDD
  }
}
```

### 2. Catálogo con Detalles Privados

```typescript
@Controller('productos')
export class ProductosController {
  
  // PÚBLICO - Ver productos
  @Get()
  async getAll() {
    return this.productosService.findAll();  // ✅ Accede a BDD
  }

  // PRIVADO - Crear producto (requiere login)
  @Post()
  @UseGuards(JwtAuthGuard)  // ✅ Requiere autenticación
  async create(@Body() data: CreateProductoDto, @Request() req) {
    // Puede usar req.user para asociar al usuario
    return this.productosService.create(data, req.user.userId);  // ✅ Accede a BDD
  }

  // PRIVADO - Editar producto
  @Put(':id')
  @UseGuards(JwtAuthGuard)  // ✅ Requiere autenticación
  async update(@Param('id') id: string, @Body() data: UpdateProductoDto) {
    return this.productosService.update(id, data);  // ✅ Accede a BDD
  }
}
```

### 3. Dashboard Público con Stats

```typescript
@Controller('dashboard')
export class DashboardController {
  
  // PÚBLICO - Estadísticas generales
  @Get('stats')
  async getStats() {
    // ✅ Accede a BDD para obtener stats
    const totalUsuarios = await this.usuarioRepository.count();
    const totalProductos = await this.productosRepository.count();
    return { totalUsuarios, totalProductos };
  }

  // PRIVADO - Dashboard del usuario
  @Get('me')
  @UseGuards(JwtAuthGuard)  // ✅ Requiere autenticación
  async getMyDashboard(@Request() req) {
    // ✅ Accede a BDD con datos del usuario
    return this.dashboardService.getMyDashboard(req.user.userId);
  }
}
```

## 🔧 Cómo Crear Endpoints Públicos

### Paso 1: Crear el Controller

```typescript
@Controller('catalogo')
export class CatalogoController {
  constructor(private catalogoService: CatalogoService) {}

  // PÚBLICO - No necesita guard
  @Get('productos')
  async getProductos() {
    return this.catalogoService.findAll();
  }

  // PÚBLICO - No necesita guard
  @Get('categorias')
  async getCategorias() {
    return this.catalogoService.findAllCategorias();
  }
}
```

### Paso 2: Registrar en el Módulo

```typescript
@Module({
  controllers: [CatalogoController],  // Sin guards adicionales
  providers: [CatalogoService],
})
export class CatalogoModule {}
```

### Paso 3: Listo! 🎉

```bash
# Endpoint público accesible sin token
GET http://localhost:3000/api/catalogo/productos
```

## 🔧 Cómo Crear Endpoints Privados

### Paso 1: Importar el Guard

```typescript
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
```

### Paso 2: Usar el Decorator

```typescript
@Get('mi-perfil')
@UseGuards(JwtAuthGuard)  // ← Agregar este decorator
async getMiPerfil(@Request() req) {
  // req.user viene del JWT guard
  return this.service.getProfile(req.user.userId);
}
```

### Paso 3: Obtener Usuario Autenticado

```typescript
@Get('mis-productos')
@UseGuards(JwtAuthGuard)
async getMisProductos(@Request() req) {
  // El guard inyecta el usuario en req.user
  const userId = req.user.userId;
  return this.service.findByUser(userId);
}
```

## 📋 Checklist para Nuevos Endpoints

### Endpoint Público
- [ ] NO agregar `@UseGuards(JwtAuthGuard)`
- [ ] Puede acceder a repositorios
- [ ] Puede consultar BDD
- [ ] Headers multiempresa opcionales

### Endpoint Privado
- [ ] Agregar `@UseGuards(JwtAuthGuard)`
- [ ] Obtener usuario de `@Request() req`
- [ ] Usar `req.user.userId` para filtros
- [ ] Validar permisos si es necesario

## 🎯 Mejores Prácticas

### 1. Prefijo por Security Level

```typescript
// Públicos
@Controller('public')
export class PublicController { }

// Privados
@Controller('private')
export class PrivateController { }
```

### 2. Documentación Clara en Swagger

```typescript
@ApiResponse({ status: 200, description: 'Público - No requiere token' })
@Get('productos')
async getProductos() { }

@ApiResponse({ status: 401, description: 'Requiere autenticación' })
@Get('mi-perfil')
@UseGuards(JwtAuthGuard)
async getMiPerfil() { }
```

### 3. Validación de Permisos en Privados

```typescript
@Get('eliminar/:id')
@UseGuards(JwtAuthGuard)
async eliminar(@Param('id') id: string, @Request() req) {
  // Verificar que el usuario tenga permisos
  if (!req.user.permissions.includes('productos.delete')) {
    throw new ForbiddenException('Sin permisos');
  }
  return this.service.delete(id);
}
```

## 🚨 Problemas Potenciales

### ❌ ERROR: Guard Global

```typescript
// NO HACER ESTO
@Global()
@Module({
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard }  // ❌ TODOS requerirían token
  ]
})
```

### ✅ CORRECTO: Guard Selectivo

```typescript
// HACER ESTO
@Module({
  controllers: [MyController],
  providers: []
})

// Y usar en cada endpoint que lo necesite
@UseGuards(JwtAuthGuard)
```

## 📝 Resumen

### ✅ SÍ Puede:
- Crear endpoints públicos sin token
- Crear endpoints privados con token
- Acceder a BDD desde endpoints públicos
- Combinar ambos en el mismo controller
- Consultar información general sin autenticación

### ❌ NO Puede:
- Acceder a datos privados sin token
- Usar `req.user` sin guard
- Violar reglas de negocio sin permisos

## 🎉 Conclusión

La arquitectura actual está **100% preparada** para:
1. ✅ Endpoints públicos que consulten BDD
2. ✅ Endpoints privados que requieran autenticación
3. ✅ Combinación de ambos en el mismo módulo
4. ✅ Headers multiempresa en todos los casos

**Solo asegúrate de agregar `@UseGuards(JwtAuthGuard)` donde NECESITES autenticación.**

---

**¿Listo para implementar tus endpoints? La arquitectura ya está preparada! 🚀**

