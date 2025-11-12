/**
 * Enum para estados de registro
 * Aplicable a TODAS las entidades del sistema
 */
export enum RecordStatus {
  DELETED = -1,   // Eliminado (soft delete)
  INACTIVE = 0,   // Inactivo
  ACTIVE = 1,     // Activo
  PENDING = 2,    // Pendiente (ej: aprobación)
  SUSPENDED = 3,  // Suspendido (temporal)
}

