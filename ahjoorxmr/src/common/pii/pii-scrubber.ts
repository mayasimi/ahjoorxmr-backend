import * as crypto from 'crypto';
import { getSensitiveFields } from '../decorators/sensitive.decorator';

// Fallback field names that are always treated as sensitive regardless of decorator
const ALWAYS_SENSITIVE = [
  'nationalId',
  'dob',
  'address',
  'phone',
  'fullName',
  'password',
  'passwordHash',
  'refreshToken',
  'refreshTokenHash',
  'resetToken',
  'secretKey',
  'apiKey',
  'token',
  'secret',
];

/**
 * Scrubs PII from a plain object for use in logs.
 * Fields annotated with @Sensitive() or in the ALWAYS_SENSITIVE list
 * are replaced with '[REDACTED]'.
 *
 * @param payload  - The object to scrub (not mutated).
 * @param DtoClass - Optional DTO class to read @Sensitive() metadata from.
 */
export function scrubForLog(
  payload: Record<string, any>,
  DtoClass?: Function,
): Record<string, any> {
  if (!payload || typeof payload !== 'object') return payload;

  const decoratedFields = DtoClass ? getSensitiveFields(DtoClass) : [];
  const sensitiveFields = new Set([...ALWAYS_SENSITIVE, ...decoratedFields]);

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    result[key] = sensitiveFields.has(key) ? '[REDACTED]' : value;
  }
  return result;
}

/**
 * Scrubs PII from a plain object for audit storage.
 * Sensitive field values are replaced with their HMAC-SHA256 digest
 * (keyed by PII_HMAC_SECRET) so changes can still be detected without
 * storing raw PII.
 *
 * @param payload  - The object to scrub (not mutated).
 * @param secret   - HMAC secret from environment config.
 * @param DtoClass - Optional DTO class to read @Sensitive() metadata from.
 */
export function scrubForAudit(
  payload: Record<string, any>,
  secret: string,
  DtoClass?: Function,
): Record<string, any> {
  if (!payload || typeof payload !== 'object') return payload;

  const decoratedFields = DtoClass ? getSensitiveFields(DtoClass) : [];
  const sensitiveFields = new Set([...ALWAYS_SENSITIVE, ...decoratedFields]);

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (sensitiveFields.has(key) && value != null) {
      result[key] = hmac(String(value), secret);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function hmac(value: string, secret: string): string {
  return `hmac:${crypto.createHmac('sha256', secret).update(value).digest('hex')}`;
}
