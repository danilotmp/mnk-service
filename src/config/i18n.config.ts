import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

/**
 * Configuración de i18n
 */
export const i18nConfig = {
  fallbackLanguage: 'es',
  fallbacks: {
    'es-*': 'es',
    'en-*': 'en',
    'pt-*': 'pt',
  },
  loaderOptions: {
    path: join(__dirname, '../common/messages/i18n/locales'),
    watch: true,
  },
};

