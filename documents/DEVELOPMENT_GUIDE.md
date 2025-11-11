# Guía de Desarrollo - MNK Service

**Para Desarrolladores que Extenderán el Sistema**  
**Versión**: 1.2.0  
**Última Actualización**: 10 de Noviembre, 2025

---

## Índice

1. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
2. [Agregar un Nuevo Dominio](#agregar-un-nuevo-dominio)
3. [Agregar un Nuevo Endpoint](#agregar-un-nuevo-endpoint)
4. [Sistema de Permisos](#sistema-de-permisos)
5. [Internacionalización](#internacionalización)
6. [Testing](#testing)
7. [Buenas Prácticas](#buenas-prácticas)

---

## Arquitectura del Proyecto

### Estructura por Capas (Hexagonal + DDD)

```
src/
├── common/                    # Código compartido entre dominios
│   ├── decorators/           # Decoradores reutilizables
│   ├── dto/                  # DTOs globales (pagination, response)
│   ├── filters/              # Exception filters
│   ├── helpers/              # Helpers globales
│   ├── interceptors/         # Interceptors globales
│   ├── messages/             # Sistema de i18n
│   ├── middleware/           # Middlewares globales
│   └── types/                # Type definitions
├── config/                    # Configuración global
│   ├── database.config.ts    # Config de base de datos
│   ├── env.config.ts         # Variables de entorno
│   └── i18n.config.ts        # Config de i18n
├── database/                  # Seeders y migrations
│   └── seed.ts               # Datos iniciales
└── domains/                   # ⭐ Dominios de negocio
    └── [nombre-dominio]/     # Cada dominio es independiente
        ├── application/      # 📦 Capa de Aplicación
        │   └── services/     # Lógica de negocio
        ├── infrastructure/   # 🔌 Capa de Infraestructura
        │   ├── auth/         # Estrategias de autenticación
        │   ├── decorators/   # Decoradores del dominio
        │   ├── entities/     # Entidades de TypeORM
        │   ├── guards/       # Guards de autorización
        │   └── repositories/ # Repositorios (acceso a datos)
        ├── presentation/     # 🎨 Capa de Presentación
        │   ├── controllers/  # Controllers REST
        │   └── dto/          # Data Transfer Objects
        └── [dominio].module.ts  # Módulo de NestJS
```

### Principios Arquitectónicos

#### 1. **Separación de Responsabilidades**
- **Presentation**: Solo recibe requests y devuelve responses
- **Application**: Contiene la lógica de negocio
- **Infrastructure**: Maneja persistencia y servicios externos

#### 2. **Inversión de Dependencias**
- Las capas internas NO dependen de las externas
- Se usan interfaces/abstracciones para el desacoplamiento

#### 3. **Un Dominio = Un Módulo Completo**
- Cada dominio tiene su propio módulo de NestJS
- Puede tener sus propios guards, decorators, etc.

---

## Agregar un Nuevo Dominio

### Paso 1: Crear la Estructura de Carpetas

```bash
src/domains/
└── inventario/                    # Nuevo dominio
    ├── application/
    │   └── services/
    │       └── producto.service.ts
    ├── infrastructure/
    │   ├── entities/
    │   │   └── producto.entity.ts
    │   └── repositories/
    │       └── producto.repository.ts
    ├── presentation/
    │   ├── controllers/
    │   │   └── inventario.controller.ts
    │   └── dto/
    │       ├── create-producto.dto.ts
    │       └── update-producto.dto.ts
    └── inventario.module.ts
```

### Paso 2: Crear la Entidad

```typescript
// infrastructure/entities/producto.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('productos')
export class ProductoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  codigo: string;

  @Column()
  nombre: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column({ name: 'company_id' })
  companyId: string;  // ⭐ Multiempresa: SIEMPRE incluir companyId

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
```

### Paso 3: Crear el Repositorio

```typescript
// infrastructure/repositories/producto.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoEntity } from '../entities/producto.entity';

@Injectable()
export class ProductoRepository {
  constructor(
    @InjectRepository(ProductoEntity)
    private readonly repository: Repository<ProductoEntity>,
  ) {}

  async findAll(companyId: string): Promise<ProductoEntity[]> {
    return this.repository.find({
      where: { companyId, isActive: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<ProductoEntity | null> {
    return this.repository.findOne({
      where: { id, companyId },
    });
  }

  async create(producto: Partial<ProductoEntity>): Promise<ProductoEntity> {
    const newProducto = this.repository.create(producto);
    return this.repository.save(newProducto);
  }

  async update(id: string, updates: Partial<ProductoEntity>): Promise<ProductoEntity> {
    await this.repository.update(id, updates);
    return this.findOne(id, updates.companyId);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
```

### Paso 4: Crear DTOs

```typescript
// presentation/dto/create-producto.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsUUID, IsOptional } from 'class-validator';

export class CreateProductoDto {
  @ApiProperty({ description: 'Código del producto', example: 'PROD001' })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({ description: 'Nombre del producto', example: 'Laptop Dell' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Precio del producto', example: 1200.50 })
  @IsNumber()
  @IsNotEmpty()
  precio: number;

  @ApiProperty({ description: 'ID de la empresa', example: 'uuid' })
  @IsUUID('4')
  @IsNotEmpty()
  companyId: string;
}
```

```typescript
// presentation/dto/update-producto.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateProductoDto } from './create-producto.dto';

export class UpdateProductoDto extends PartialType(CreateProductoDto) {}
```

### Paso 5: Crear el Service

```typescript
// application/services/producto.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductoRepository } from '../../infrastructure/repositories/producto.repository';
import { ResponseHelper } from '@/common/messages/response.helper';
import { MessageCode } from '@/common/messages/message-codes';
import { CreateProductoDto } from '../../presentation/dto/create-producto.dto';
import { UpdateProductoDto } from '../../presentation/dto/update-producto.dto';

@Injectable()
export class ProductoService {
  constructor(
    private readonly productoRepository: ProductoRepository,
    private readonly responseHelper: ResponseHelper,
  ) {}

  async findAll(companyId: string, lang: string = 'es') {
    const productos = await this.productoRepository.findAll(companyId);
    
    return this.responseHelper.successResponse(
      productos,
      MessageCode.SUCCESS,
      lang,
    );
  }

  async findOne(id: string, companyId: string, lang: string = 'es') {
    const producto = await this.productoRepository.findOne(id, companyId);
    
    if (!producto) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.RESOURCE_NOT_FOUND,
          lang,
          { error: 'PRODUCTO_NOT_FOUND', productoId: id },
          404,
        ),
      );
    }

    return this.responseHelper.successResponse(
      producto,
      MessageCode.SUCCESS,
      lang,
    );
  }

  async create(createProductoDto: CreateProductoDto, lang: string = 'es') {
    const producto = await this.productoRepository.create(createProductoDto);
    
    return this.responseHelper.successResponse(
      producto,
      MessageCode.RESOURCE_CREATED,
      lang,
      201,
    );
  }

  async update(id: string, updateProductoDto: UpdateProductoDto, lang: string = 'es') {
    const producto = await this.productoRepository.findOne(id, updateProductoDto.companyId);
    
    if (!producto) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.RESOURCE_NOT_FOUND,
          lang,
          { error: 'PRODUCTO_NOT_FOUND', productoId: id },
          404,
        ),
      );
    }

    const updated = await this.productoRepository.update(id, updateProductoDto);
    
    return this.responseHelper.successResponse(
      updated,
      MessageCode.RESOURCE_UPDATED,
      lang,
    );
  }

  async remove(id: string, companyId: string, lang: string = 'es') {
    const producto = await this.productoRepository.findOne(id, companyId);
    
    if (!producto) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.RESOURCE_NOT_FOUND,
          lang,
          { error: 'PRODUCTO_NOT_FOUND', productoId: id },
          404,
        ),
      );
    }

    await this.productoRepository.remove(id);
    
    return this.responseHelper.successResponse(
      { id, message: 'Producto eliminado exitosamente' },
      MessageCode.SUCCESS,
      lang,
    );
  }
}
```

### Paso 6: Crear el Controller

```typescript
// presentation/controllers/inventario.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/domains/seguridades/infrastructure/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/domains/seguridades/infrastructure/guards/permissions.guard';
import { Permissions } from '@/domains/seguridades/infrastructure/decorators/permissions.decorator';
import { ProductoService } from '../../application/services/producto.service';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';

@ApiTags('Inventario')
@Controller('inventario')
@UseGuards(JwtAuthGuard)  // ⭐ Proteger con autenticación
@ApiBearerAuth()
export class InventarioController {
  constructor(private readonly productoService: ProductoService) {}

  @Get('productos')
  @UseGuards(PermissionsGuard)
  @Permissions(['productos.view'])  // ⭐ Requerir permiso
  @ApiOperation({ summary: 'Obtener todos los productos' })
  async getProductos(@Query('companyId') companyId: string, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.productoService.findAll(companyId, lang);
  }

  @Get('productos/:id')
  @UseGuards(PermissionsGuard)
  @Permissions(['productos.view'])
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  async getProducto(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Request() req,
  ) {
    const lang = req.headers['accept-language'] || 'es';
    return this.productoService.findOne(id, companyId, lang);
  }

  @Post('productos')
  @UseGuards(PermissionsGuard)
  @Permissions(['productos.create'])
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  async createProducto(@Body() createProductoDto: CreateProductoDto, @Request() req) {
    const lang = req.headers['accept-language'] || 'es';
    return this.productoService.create(createProductoDto, lang);
  }

  @Put('productos/:id')
  @UseGuards(PermissionsGuard)
  @Permissions(['productos.edit'])
  @ApiOperation({ summary: 'Actualizar un producto' })
  async updateProducto(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
    @Request() req,
  ) {
    const lang = req.headers['accept-language'] || 'es';
    return this.productoService.update(id, updateProductoDto, lang);
  }

  @Delete('productos/:id')
  @UseGuards(PermissionsGuard)
  @Permissions(['productos.delete'])
  @ApiOperation({ summary: 'Eliminar un producto' })
  async removeProducto(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Request() req,
  ) {
    const lang = req.headers['accept-language'] || 'es';
    return this.productoService.remove(id, companyId, lang);
  }
}
```

### Paso 7: Crear el Módulo

```typescript
// inventario.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoEntity } from './infrastructure/entities/producto.entity';
import { ProductoRepository } from './infrastructure/repositories/producto.repository';
import { ProductoService } from './application/services/producto.service';
import { InventarioController } from './presentation/controllers/inventario.controller';
import { MessagesModule } from '@/common/messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductoEntity]),
    MessagesModule,  // ⭐ Para i18n
  ],
  controllers: [InventarioController],
  providers: [
    ProductoService,
    ProductoRepository,
  ],
  exports: [ProductoService],  // Exportar si otros módulos lo necesitan
})
export class InventarioModule {}
```

### Paso 8: Registrar el Módulo en App

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { InventarioModule } from './domains/inventario/inventario.module';

@Module({
  imports: [
    // ... otros módulos
    InventarioModule,  // ⭐ Agregar el nuevo módulo
  ],
})
export class AppModule {}
```

---

## Agregar un Nuevo Endpoint

### Flujo Simplificado

1. **Agregar método al Repository** (si necesita nueva query)
2. **Agregar método al Service** (lógica de negocio)
3. **Agregar método al Controller** (endpoint REST)

### Ejemplo: Endpoint de Búsqueda

```typescript
// 1. Repository
async searchProductos(companyId: string, searchTerm: string): Promise<ProductoEntity[]> {
  return this.repository
    .createQueryBuilder('producto')
    .where('producto.companyId = :companyId', { companyId })
    .andWhere(
      '(producto.nombre LIKE :searchTerm OR producto.codigo LIKE :searchTerm)',
      { searchTerm: `%${searchTerm}%` }
    )
    .orderBy('producto.nombre', 'ASC')
    .getMany();
}

// 2. Service
async search(companyId: string, searchTerm: string, lang: string = 'es') {
  const productos = await this.productoRepository.searchProductos(companyId, searchTerm);
  
  return this.responseHelper.successResponse(
    productos,
    MessageCode.SUCCESS,
    lang,
  );
}

// 3. Controller
@Get('productos/search')
@UseGuards(PermissionsGuard)
@Permissions(['productos.view'])
@ApiOperation({ summary: 'Buscar productos' })
async searchProductos(
  @Query('companyId') companyId: string,
  @Query('q') searchTerm: string,
  @Request() req,
) {
  const lang = req.headers['accept-language'] || 'es';
  return this.productoService.search(companyId, searchTerm, lang);
}
```

---

## Sistema de Permisos

### Crear Nuevos Permisos

#### 1. Agregar al Seed

```typescript
// database/seed.ts
const permissions = [
  // ... permisos existentes
  
  // Nuevos permisos para Inventario
  {
    code: 'productos.view',
    name: 'Ver Productos',
    description: 'Permite ver la lista de productos',
    category: 'inventario',
    isSystem: true,
  },
  {
    code: 'productos.create',
    name: 'Crear Productos',
    description: 'Permite crear nuevos productos',
    category: 'inventario',
    isSystem: true,
  },
  {
    code: 'productos.edit',
    name: 'Editar Productos',
    description: 'Permite editar productos existentes',
    category: 'inventario',
    isSystem: true,
  },
  {
    code: 'productos.delete',
    name: 'Eliminar Productos',
    description: 'Permite eliminar productos',
    category: 'inventario',
    isSystem: true,
  },
];
```

#### 2. Ejecutar Seed

```bash
npm run seed
```

#### 3. Asignar Permisos a Roles

Puedes hacerlo:
- **Manualmente** en la base de datos
- **Por API** usando el endpoint de asignación de permisos
- **En el seed** agregándolos a roles predefinidos

### Usar Permisos en Endpoints

```typescript
// Opción 1: Un solo permiso
@Permissions(['productos.view'])

// Opción 2: Múltiples permisos (requiere TODOS)
@Permissions(['productos.view', 'productos.edit'])

// Opción 3: Sin permisos (solo autenticación)
@UseGuards(JwtAuthGuard)  // Sin PermissionsGuard
```

---

## Internacionalización

### Agregar Nuevos Mensajes

#### 1. Definir el Código

```typescript
// common/messages/message-codes.ts
export enum MessageCode {
  // ... códigos existentes
  
  // Nuevos para Inventario
  PRODUCTO_CREATED = 'PRODUCTO_CREATED',
  PRODUCTO_NOT_FOUND = 'PRODUCTO_NOT_FOUND',
  PRODUCTO_DUPLICADO = 'PRODUCTO_DUPLICADO',
}
```

#### 2. Agregar Traducciones

```json
// common/messages/i18n/locales/es/success.json
{
  "PRODUCTO_CREATED": "Producto creado exitosamente"
}

// common/messages/i18n/locales/es/errors.json
{
  "PRODUCTO_NOT_FOUND": "Producto no encontrado",
  "PRODUCTO_DUPLICADO": "Ya existe un producto con ese código"
}
```

```json
// common/messages/i18n/locales/en/success.json
{
  "PRODUCTO_CREATED": "Product created successfully"
}

// common/messages/i18n/locales/en/errors.json
{
  "PRODUCTO_NOT_FOUND": "Product not found",
  "PRODUCTO_DUPLICADO": "A product with that code already exists"
}
```

#### 3. Usar en el Código

```typescript
return this.responseHelper.successResponse(
  producto,
  MessageCode.PRODUCTO_CREATED,  // ⭐ Usar el nuevo código
  lang,
  201,
);
```

---

## Testing

### Test Unitario del Service

```typescript
// application/services/producto.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ProductoService } from './producto.service';
import { ProductoRepository } from '../../infrastructure/repositories/producto.repository';
import { ResponseHelper } from '@/common/messages/response.helper';

describe('ProductoService', () => {
  let service: ProductoService;
  let repository: ProductoRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoService,
        {
          provide: ProductoRepository,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: ResponseHelper,
          useValue: {
            successResponse: jest.fn(),
            errorResponse: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
    repository = module.get<ProductoRepository>(ProductoRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of productos', async () => {
      const mockProductos = [
        { id: '1', codigo: 'PROD001', nombre: 'Laptop', precio: 1200 },
      ];

      jest.spyOn(repository, 'findAll').mockResolvedValue(mockProductos);

      const result = await service.findAll('company-id', 'es');

      expect(repository.findAll).toHaveBeenCalledWith('company-id');
      expect(result).toBeDefined();
    });
  });
});
```

### Test E2E del Endpoint

```typescript
// test/inventario.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('InventarioController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login para obtener token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/seguridades/auth/login')
      .send({
        email: 'admin@mnksolutions.com',
        password: 'Admin123!',
      });

    accessToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/inventario/productos (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/inventario/productos')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ companyId: 'test-company-id' })
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
      });
  });

  it('/api/inventario/productos (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/inventario/productos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        codigo: 'TEST001',
        nombre: 'Producto de Prueba',
        precio: 100,
        companyId: 'test-company-id',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.codigo).toBe('TEST001');
      });
  });
});
```

---

## Buenas Prácticas

### 1. Siempre Usar DTOs

```typescript
// ❌ INCORRECTO
async createProducto(@Body() body: any) { ... }

// ✅ CORRECTO
async createProducto(@Body() createProductoDto: CreateProductoDto) { ... }
```

### 2. Validar en DTOs

```typescript
// ✅ CORRECTO
export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  nombre: string;

  @IsNumber()
  @Min(0)
  precio: number;
}
```

### 3. Usar ResponseHelper

```typescript
// ❌ INCORRECTO
return { data: productos };

// ✅ CORRECTO
return this.responseHelper.successResponse(
  productos,
  MessageCode.SUCCESS,
  lang,
);
```

### 4. Manejar Errores Consistentemente

```typescript
// ✅ CORRECTO
if (!producto) {
  throw new NotFoundException(
    await this.responseHelper.errorResponse(
      MessageCode.PRODUCTO_NOT_FOUND,
      lang,
      { productoId: id },
      404,
    ),
  );
}
```

### 5. Multiempresa Obligatorio

```typescript
// ✅ CORRECTO: Siempre filtrar por companyId
async findAll(companyId: string) {
  return this.repository.find({ where: { companyId } });
}

// ❌ INCORRECTO: No filtrar por companyId
async findAll() {
  return this.repository.find();  // Retorna datos de TODAS las empresas
}
```

### 6. Documentar con Swagger

```typescript
// ✅ CORRECTO
@ApiTags('Inventario')
@ApiOperation({ summary: 'Crear un nuevo producto' })
@ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
@ApiResponse({ status: 400, description: 'Datos inválidos' })
@Post('productos')
async createProducto(@Body() dto: CreateProductoDto) { ... }
```

### 7. Usar Transacciones para Operaciones Complejas

```typescript
// ✅ CORRECTO
import { DataSource } from 'typeorm';

constructor(private dataSource: DataSource) {}

async createWithDetails(data: any) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Operaciones múltiples
    const producto = await queryRunner.manager.save(ProductoEntity, data);
    await queryRunner.manager.save(DetalleEntity, { productoId: producto.id });

    await queryRunner.commitTransaction();
    return producto;
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
```

---

## Checklist para Nuevo Dominio

- [ ] Crear estructura de carpetas
- [ ] Crear entidades con companyId
- [ ] Crear repositorios
- [ ] Crear DTOs con validaciones
- [ ] Crear services con lógica de negocio
- [ ] Crear controllers con guards y permisos
- [ ] Crear módulo y registrarlo en AppModule
- [ ] Crear permisos en el seed
- [ ] Agregar mensajes i18n
- [ ] Documentar en Swagger
- [ ] Escribir tests unitarios
- [ ] Escribir tests E2E
- [ ] Actualizar Postman collection
- [ ] Documentar en API_SPECIFICATION.md

---

## Comandos Útiles

```bash
# Desarrollo
npm run start:dev

# Build
npm run build

# Tests
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e

# Lint
npm run lint
npm run lint:fix

# Seed
npm run seed

# TypeORM
npm run typeorm migration:create -- -n MigrationName
npm run typeorm migration:run
npm run typeorm migration:revert
```

---

## Recursos Adicionales

- **ADR**: Ver `ADR.md` para decisiones arquitectónicas
- **API Spec**: Ver `API_SPECIFICATION.md` para especificación completa
- **Integration**: Ver `INTEGRATION_GUIDE.md` para consumir la API
- **NestJS Docs**: https://docs.nestjs.com
- **TypeORM Docs**: https://typeorm.io

---

## Contacto

Para preguntas o sugerencias sobre la arquitectura, consulta con el equipo de arquitectura o abre un issue en el repositorio.

