import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { 
  DocumentSchema, 
  DocumentUpdateSchema,
  CreateDocumentRequestSchema,
  ErrorResponseSchema
} from './schemas'
import {
  UserSchema,
  CreateUserRequestSchema,
  LoginRequestSchema,
  AuthResponseSchema,
  RefreshTokenRequestSchema,
  JwtPayloadSchema
} from './auth'

const ajv = new Ajv({ 
  allErrors: true,
  removeAdditional: 'all',
  useDefaults: true,
  coerceTypes: true
})

addFormats(ajv)

export const validateDocument = ajv.compile(DocumentSchema)
export const validateDocumentUpdate = ajv.compile(DocumentUpdateSchema)
export const validateCreateDocumentRequest = ajv.compile(CreateDocumentRequestSchema)
export const validateErrorResponse = ajv.compile(ErrorResponseSchema)

export const validateUser = ajv.compile(UserSchema)
export const validateCreateUserRequest = ajv.compile(CreateUserRequestSchema)
export const validateLoginRequest = ajv.compile(LoginRequestSchema)
export const validateAuthResponse = ajv.compile(AuthResponseSchema)
export const validateRefreshTokenRequest = ajv.compile(RefreshTokenRequestSchema)
export const validateJwtPayload = ajv.compile(JwtPayloadSchema)

export type ValidationError = {
  field: string
  message: string
}

export function getValidationErrors(validator: any): ValidationError[] {
  if (!validator.errors) return []
  
  return validator.errors.map((error: any) => ({
    field: error.instancePath || error.schemaPath,
    message: error.message || 'Validation failed'
  }))
}

export function validateOrThrow<T>(
  data: unknown, 
  validator: any,
  errorMessage = 'Validation failed'
): T {
  if (!validator(data)) {
    const errors = getValidationErrors(validator)
    const error = new Error(errorMessage)
    ;(error as any).validationErrors = errors
    throw error
  }
  return data as T
}