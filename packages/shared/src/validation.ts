import type { ErrorObject, ValidateFunction } from 'ajv';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {
  AuthResponseSchema,
  CreateUserRequestSchema,
  JwtPayloadSchema,
  LoginRequestSchema,
  RefreshTokenRequestSchema,
  UserSchema,
} from './auth';
import {
  CreateDocumentRequestSchema,
  DocumentSchema,
  DocumentUpdateSchema,
  ErrorResponseSchema,
  UpdateDocumentRequestSchema,
} from './schemas';

const ajv = new Ajv({
  allErrors: true,
  removeAdditional: 'all',
  useDefaults: true,
  coerceTypes: true,
});

addFormats(ajv);

export const validateDocument = ajv.compile(DocumentSchema);
export const validateDocumentUpdate = ajv.compile(DocumentUpdateSchema);
export const validateCreateDocumentRequest = ajv.compile(
  CreateDocumentRequestSchema,
);
export const validateUpdateDocumentRequest = ajv.compile(
  UpdateDocumentRequestSchema,
);
export const validateErrorResponse = ajv.compile(ErrorResponseSchema);

export const validateUser = ajv.compile(UserSchema);
export const validateCreateUserRequest = ajv.compile(CreateUserRequestSchema);
export const validateLoginRequest = ajv.compile(LoginRequestSchema);
export const validateAuthResponse = ajv.compile(AuthResponseSchema);
export const validateRefreshTokenRequest = ajv.compile(
  RefreshTokenRequestSchema,
);
export const validateJwtPayload = ajv.compile(JwtPayloadSchema);

export type ValidationError = {
  field: string;
  message: string;
};

export function getValidationErrors(
  validator: ValidateFunction,
): ValidationError[] {
  if (!validator.errors) return [];

  return validator.errors.map((error: ErrorObject) => ({
    field: error.instancePath || error.schemaPath,
    message: error.message || 'Validation failed',
  }));
}

export function validateOrThrow<T>(
  data: unknown,
  validator: ValidateFunction<T>,
  errorMessage = 'Validation failed',
): T {
  if (!validator(data)) {
    const errors = getValidationErrors(validator);
    const error = new Error(errorMessage) as Error & {
      validationErrors: ValidationError[];
    };
    error.validationErrors = errors;
    throw error;
  }
  return data as T;
}
