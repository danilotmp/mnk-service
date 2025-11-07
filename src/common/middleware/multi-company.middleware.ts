import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para capturar y validar headers multiempresa
 *
 * Headers esperados:
 * - company-code: Código de la empresa (requerido en algunas rutas)
 * - user-id: ID del usuario (opcional)
 * - app-source: Origen de la aplicación (opcional)
 * - client-ip: IP del cliente (extraído automáticamente)
 */
@Injectable()
export class MultiCompanyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extraer IP del cliente
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown';
    req['clientIp'] = clientIp;

    // Extraer headers multiempresa
    const companyCode = req.headers['company-code'] as string;
    const userId = req.headers['user-id'] as string;
    const appSource = (req.headers['app-source'] as string) || 'unknown';

    // Adjuntar información multiempresa al request
    req['multiCompany'] = {
      companyCode,
      userId,
      appSource,
      clientIp,
    };

    next();
  }
}

