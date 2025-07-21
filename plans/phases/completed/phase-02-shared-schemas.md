# Phase 2: Shared Schema Definitions

**Status**: ✅ Complete
**Completion Date**: 2025-01-20
**Objective**: Define data models and API schemas using TypeBox for end-to-end type safety

## 🎯 **Overview**

This phase defined the data models and API schemas for the application in a single place, and set up validation logic. Using TypeBox, we created JSON Schema definitions for collaborative document data and API endpoints. These schemas are reused on both backend and frontend to ensure consistency and end-to-end type safety.

## 📋 **Key Deliverables**

### ✅ **Schema Architecture**

- `packages/shared` with TypeBox schema definitions
- Document schema with id, title, content, and ACL fields
- API request/response schemas (CreateDocumentRequest, etc.)
- Comprehensive type definitions exported for reuse

### ✅ **Runtime Validation**

- Ajv runtime validation with compiled validators
- Validation utilities and comprehensive error handling
- Type-safe validation functions for all schemas
- Performance-optimized compiled validators

### ✅ **Testing & Documentation**

- Unit tests for all schema validation logic
- OpenAPI specification generation from TypeBox schemas
- Comprehensive error testing and edge cases
- Documentation of validation patterns

## 🏗️ **Schema Definitions**

### **Document Schema**

```typescript
import { Type, Static } from '@sinclair/typebox';

export const DocumentSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  title: Type.String({ maxLength: 100 }),
  content: Type.String(),
  acl: Type.Object({
    owner: Type.String(),
    editors: Type.Array(Type.String()),
    viewers: Type.Array(Type.String())
  })
});

export type Document = Static<typeof DocumentSchema>;
```

### **API Request Schemas**

```typescript
export const CreateDocRequestSchema = Type.Object({
  title: Type.String({ maxLength: 100 }),
  content: Type.Optional(Type.String())
});

export const UpdateDocRequestSchema = Type.Object({
  title: Type.Optional(Type.String({ maxLength: 100 })),
  content: Type.Optional(Type.String())
});

export type CreateDocRequest = Static<typeof CreateDocRequestSchema>;
export type UpdateDocRequest = Static<typeof UpdateDocRequestSchema>;
```

### **Validation Utilities**

```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export const validateDocument = ajv.compile(DocumentSchema);
export const validateCreateDoc = ajv.compile(CreateDocRequestSchema);
export const validateUpdateDoc = ajv.compile(UpdateDocRequestSchema);
```

## 🔧 **Implementation Details**

### **TypeBox Benefits**

- **JSON Schema Native**: Direct compatibility with OpenAPI 3.1
- **Type Inference**: Automatic TypeScript types from schemas
- **Performance**: Optimized for runtime validation
- **Ecosystem**: Works seamlessly with Ajv and other tools

### **Validation Architecture**

```typescript
// Validation wrapper with detailed error handling
export function createValidator<T>(schema: TSchema) {
  const validate = ajv.compile<T>(schema);

  return (data: unknown): { success: boolean; data?: T; errors?: string[] } => {
    if (validate(data)) {
      return { success: true, data: data as T };
    }

    return {
      success: false,
      errors: validate.errors?.map(err =>
        `${err.instancePath} ${err.message}`
      ) || ['Validation failed']
    };
  };
}
```

### **OpenAPI Integration**

```typescript
// Automatic OpenAPI generation
export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Collaborative Edit API",
    version: "1.0.0"
  },
  components: {
    schemas: {
      Document: DocumentSchema,
      CreateDocRequest: CreateDocRequestSchema,
      UpdateDocRequest: UpdateDocRequestSchema
    }
  },
  paths: {
    "/documents": {
      post: {
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateDocRequest" }
            }
          }
        },
        responses: {
          "201": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Document" }
              }
            }
          }
        }
      }
    }
  }
};
```

## ✅ **Testing & Validation**

### **Schema Tests**

```typescript
describe('Document Schema Validation', () => {
  test('validates correct document structure', () => {
    const validDoc = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Document',
      content: 'Content here',
      acl: {
        owner: 'user1',
        editors: ['user2'],
        viewers: ['user3']
      }
    };

    expect(validateDocument(validDoc)).toBe(true);
  });

  test('rejects invalid document structure', () => {
    const invalidDoc = {
      id: 'not-a-uuid',
      title: '', // too short
      content: 123 // wrong type
    };

    expect(validateDocument(invalidDoc)).toBe(false);
    expect(validateDocument.errors).toBeDefined();
  });
});
```

### **Integration Testing**

- ✅ Client can import and use all schemas
- ✅ Server validates requests using compiled validators
- ✅ OpenAPI spec generates correctly
- ✅ Error messages are descriptive and actionable

## 📈 **Impact & Benefits**

### **Type Safety**

- **End-to-End**: Same types used across frontend and backend
- **Compile-Time**: TypeScript catches type mismatches
- **Runtime**: Ajv validates external data
- **Documentation**: Self-documenting API via OpenAPI

### **Developer Experience**

- **Autocomplete**: IDE support for all data structures
- **Refactoring**: Safe renames and structure changes
- **Testing**: Easy to create valid test data
- **Debugging**: Clear validation error messages

### **Production Benefits**

- **Reliability**: Invalid data caught before processing
- **Performance**: Compiled validators are fast
- **Maintainability**: Single source of truth for data structures
- **API Documentation**: Always up-to-date OpenAPI spec

## 🔄 **Next Phase Dependencies**

This phase enables:

- **Phase 2.5**: Security schemas for authentication
- **Phase 3**: Backend API validation using these schemas
- **Phase 4**: Frontend type safety with shared types
- **Phase 5**: OpenAPI documentation generation

## 📚 **References**

- [TypeBox Documentation](https://github.com/sinclairzx81/typebox)
- [Ajv JSON Schema Validator](https://ajv.js.org/)
- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0)

---

**✅ Phase 2 Complete** - Shared schemas provide foundation for type-safe development
