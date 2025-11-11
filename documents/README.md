# 📚 Documentación MNK Service API

**Versión**: 1.2.0  
**Última Actualización**: 10 de Noviembre, 2025

---

## 🎯 Inicio Rápido

¿Nuevo en el proyecto? Empieza por aquí:

1. **Levantar el proyecto**: Ver [INSTRUCCIONES_INICIO.md](./INSTRUCCIONES_INICIO.md)
2. **Entender la arquitectura**: Ver [ADR.md](#-adr-architecture-decision-records)
3. **Consumir la API**: Ver [INTEGRATION_GUIDE.md](#-integration_guidemd)
4. **Probar endpoints**: Ver [MNK_Service_API.postman_collection.json](#-postman-collection)

---

## 📖 Documentos Principales

### 📋 [ADR.md](./ADR.md) - Architecture Decision Records

**Para**: Arquitectos, Tech Leads, Desarrolladores Senior

Documenta todas las decisiones arquitectónicas importantes del proyecto:

- ✅ ADR-001: Arquitectura DDD + Hexagonal
- ✅ ADR-002: Sistema de Autorización Basado en Permisos
- ✅ ADR-003: Internacionalización (i18n)
- ✅ ADR-004: Arquitectura Multiempresa
- ✅ ADR-005: Endpoints TODO-EN-UNO
- ✅ ADR-006: Inclusión de Relaciones en Respuestas

**Cuándo leerlo**:
- Antes de tomar decisiones arquitectónicas importantes
- Para entender el "por qué" detrás del diseño
- Al evaluar alternativas de implementación

---

### 🔧 [API_SPECIFICATION.md](./API_SPECIFICATION.md) - Especificación de la API

**Para**: Desarrolladores Frontend, QA, Integradores

Especificación técnica completa de todos los endpoints:

- ✅ Autenticación (Login, Register, Refresh Token)
- ✅ Gestión de Usuarios (CRUD completo)
- ✅ Gestión de Roles y Permisos
- ✅ Gestión de Empresas y Sucursales
- ✅ Menú Dinámico
- ✅ Estructuras de Datos
- ✅ Códigos de Error

**Cuándo leerlo**:
- Para conocer qué endpoints están disponibles
- Para entender request/response de cada endpoint
- Como referencia durante desarrollo frontend
- Para debugging de APIs

---

### 🚀 [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Guía de Integración

**Para**: Desarrolladores Frontend, Mobile, Clientes de la API

Guía práctica con ejemplos de código para consumir la API:

- ✅ Configuración inicial del cliente HTTP
- ✅ Implementación de autenticación
- ✅ Gestión de usuarios con ejemplos completos
- ✅ Sistema de permisos y componentes protegidos
- ✅ Contexto multiempresa
- ✅ Manejo de errores
- ✅ Ejemplos completos en React Native
- ✅ Mejores prácticas

**Cuándo leerlo**:
- Al integrar el frontend con la API
- Para copiar ejemplos de código
- Para entender patrones de consumo
- Para implementar buenas prácticas

---

### 🏗️ [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Guía de Desarrollo

**Para**: Desarrolladores Backend que extenderán el sistema

Guía completa para desarrolladores que agregarán nuevos módulos:

- ✅ Entender la arquitectura del proyecto
- ✅ Agregar un nuevo dominio (paso a paso)
- ✅ Agregar nuevos endpoints
- ✅ Sistema de permisos
- ✅ Internacionalización
- ✅ Testing (Unitario y E2E)
- ✅ Buenas prácticas
- ✅ Checklist de desarrollo

**Cuándo leerlo**:
- Antes de agregar un nuevo módulo/dominio
- Para entender la estructura del código
- Para mantener consistencia arquitectónica
- Como referencia durante desarrollo

---

### 📮 [MNK_Service_API.postman_collection.json](./MNK_Service_API.postman_collection.json) - Postman Collection

**Para**: Todos (Desarrolladores, QA, PM)

Colección completa de Postman con:

- ✅ Todos los endpoints documentados
- ✅ Ejemplos de request/response
- ✅ Variables de entorno pre-configuradas
- ✅ Scripts de test automáticos
- ✅ Flujos completos de autenticación

**Cómo usar**:
1. Importar en Postman: `File > Import > Choose File`
2. Ejecutar `Login` para obtener token
3. Las variables se capturan automáticamente
4. Probar cualquier endpoint

---

## 🗂️ Documentos de Apoyo

### [INSTRUCCIONES_INICIO.md](./INSTRUCCIONES_INICIO.md)
Cómo levantar el proyecto por primera vez.

### [SEED_INSTRUCCIONES.md](./SEED_INSTRUCCIONES.md)
Cómo ejecutar el seed para poblar la base de datos inicial.

### [DEBUG_INSTRUCCIONES.md](./DEBUG_INSTRUCCIONES.md)
Guía de debugging y solución de problemas comunes.

### [INDEX.md](./INDEX.md)
Índice alternativo de la documentación (si existe).

---

## 🏛️ Arquitectura del Proyecto

```
MNK Service API
│
├── Arquitectura: DDD + Hexagonal
├── Framework: NestJS + TypeORM
├── Base de Datos: SQLite (dev) / PostgreSQL (prod)
├── Autenticación: JWT
├── Autorización: Basada en Permisos
├── Multiempresa: Sí
└── i18n: ES, EN, PT
```

### Estructura de Dominios

```
src/domains/
└── seguridades/          # Dominio de Seguridades
    ├── application/      # Lógica de negocio
    ├── infrastructure/   # Persistencia, guards, etc.
    └── presentation/     # Controllers y DTOs
```

---

## 🔑 Conceptos Clave

### Multiempresa
- Cada registro tiene `companyId`
- Los datos están aislados por empresa
- Los usuarios pertenecen a una empresa

### Permisos
```
Usuario → Roles → Permisos
```
- Los permisos son la unidad atómica
- Los roles agrupan permisos
- Los usuarios tienen roles

### i18n (Internacionalización)
- Soporte para ES, EN, PT
- Header: `Accept-Language: es|en|pt`
- Mensajes traducidos automáticamente

---

## 🚀 Flujo de Trabajo Típico

### Para Frontend Developer

1. Leer [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
2. Importar Postman Collection
3. Probar endpoints en Postman
4. Copiar ejemplos de código
5. Implementar en tu app
6. Consultar [API_SPECIFICATION.md](./API_SPECIFICATION.md) si hay dudas

### Para Backend Developer

1. Leer [ADR.md](./ADR.md) - Entender decisiones
2. Leer [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Entender estructura
3. Seguir guía paso a paso para agregar nuevo dominio
4. Escribir tests
5. Actualizar [API_SPECIFICATION.md](./API_SPECIFICATION.md)
6. Actualizar Postman Collection

---

## 📊 Estado del Proyecto

### Versión Actual: 1.2.0

**Últimas Mejoras**:
- ✅ Campo `phone` agregado a usuarios
- ✅ Roles incluidos automáticamente en respuestas
- ✅ Endpoint TODO-EN-UNO para creación/actualización
- ✅ Documentación reorganizada y consolidada

**Próximas Features** (Ver ADR.md - Decisiones Pendientes):
- Caché con Redis
- Migración a PostgreSQL
- Rate Limiting

---

## 🆘 Soporte

### Problemas Comunes

#### ¿No puedo levantar el proyecto?
→ Ver [INSTRUCCIONES_INICIO.md](./INSTRUCCIONES_INICIO.md)

#### ¿No sé qué endpoint usar?
→ Ver [API_SPECIFICATION.md](./API_SPECIFICATION.md)

#### ¿Cómo consumo la API desde el frontend?
→ Ver [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

#### ¿Cómo agrego un nuevo módulo?
→ Ver [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)

#### ¿Por qué se tomó esta decisión arquitectónica?
→ Ver [ADR.md](./ADR.md)

---

## 📝 Actualizaciones de Documentación

Si agregas features nuevas, actualiza:

1. ✅ [ADR.md](./ADR.md) - Si es una decisión arquitectónica
2. ✅ [API_SPECIFICATION.md](./API_SPECIFICATION.md) - Si agregas endpoints
3. ✅ [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Si hay nuevos ejemplos de uso
4. ✅ [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Si hay nuevos patrones
5. ✅ Postman Collection - Si hay nuevos endpoints
6. ✅ Este README - Si es un cambio mayor

---

## 🎓 Recursos Adicionales

- **NestJS**: https://docs.nestjs.com
- **TypeORM**: https://typeorm.io
- **DDD**: https://martinfowler.com/bliki/DomainDrivenDesign.html
- **Hexagonal Architecture**: https://alistair.cockburn.us/hexagonal-architecture/

---

## 📜 Licencia

[Tu Licencia Aquí]

---

## 👥 Equipo

- **Arquitecto**: [Nombre]
- **Tech Lead**: [Nombre]
- **Desarrolladores**: [Nombres]

---

**¿Listo para comenzar?** 🚀

→ Desarrollador Frontend: Empieza con [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)  
→ Desarrollador Backend: Empieza con [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)  
→ Arquitecto/PM: Empieza con [ADR.md](./ADR.md)  
→ QA/Tester: Importa el [Postman Collection](./MNK_Service_API.postman_collection.json)

