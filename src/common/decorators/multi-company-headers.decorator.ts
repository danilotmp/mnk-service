import { SetMetadata } from '@nestjs/common';

/**
 * Decorador para marcar endpoints que requieren headers multiempresa
 */
export const REQUIRE_MULTI_COMPANY_HEADERS = 'require_multi_company_headers';
export const RequireMultiCompanyHeaders = () => SetMetadata(REQUIRE_MULTI_COMPANY_HEADERS, true);

/**
 * Interface para los headers multiempresa
 */
export interface MultiCompanyHeaders {
  'company-code': string;
  'user-id'?: string;
  'app-source'?: string; // legacy, mobile, web, etc.
  'client-ip'?: string;
}

