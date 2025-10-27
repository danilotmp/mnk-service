import { Request } from 'express';

/**
 * Extensión de la interfaz Request de Express
 * para incluir propiedades personalizadas de la aplicación
 */
declare module 'express' {
  interface Request {
    /**
     * Información multiempresa extraída de headers
     */
    multiCompany?: {
      companyCode?: string;
      userId?: string;
      appSource?: string;
      clientIp?: string;
    };

    /**
     * IP del cliente
     */
    clientIp?: string;

    /**
     * Usuario autenticado (insertado por JwtAuthGuard)
     */
    user?: {
      userId: string;
      email: string;
      companyId: string;
    };
  }
}

