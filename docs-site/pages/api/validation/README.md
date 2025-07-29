[**collab-edit-demo**](../README.md)

***

[collab-edit-demo](../README.md) / validation

# validation

Runtime validation utilities using AJV (Another JSON Schema Validator).

This module provides compiled validators for all schema types in the application,
along with utility functions for error handling and validation enforcement.
All validators are pre-compiled for optimal performance.

## Since

1.0.0

## Type Aliases

- [ValidationError](type-aliases/ValidationError.md)

## Variables

- [validateDocument](variables/validateDocument.md)
- [validateDocumentUpdate](variables/validateDocumentUpdate.md)
- [validateCreateDocumentRequest](variables/validateCreateDocumentRequest.md)
- [validateUpdateDocumentRequest](variables/validateUpdateDocumentRequest.md)
- [validateErrorResponse](variables/validateErrorResponse.md)
- [validateUser](variables/validateUser.md)
- [validateCreateUserRequest](variables/validateCreateUserRequest.md)
- [validateLoginRequest](variables/validateLoginRequest.md)
- [validateAuthResponse](variables/validateAuthResponse.md)
- [validateRefreshTokenRequest](variables/validateRefreshTokenRequest.md)
- [validateJwtPayload](variables/validateJwtPayload.md)

## Functions

- [getValidationErrors](functions/getValidationErrors.md)
- [validateOrThrow](functions/validateOrThrow.md)
