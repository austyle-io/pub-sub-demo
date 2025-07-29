# Database Schema

This document outlines the MongoDB database schema for the application. The schema is defined using TypeBox and enforced at runtime with Ajv.

## Collections

### `users`

Stores user account information.

```typescript
const UserSchema = Type.Object({
  _id: Type.String(),
  email: Type.String({ format: 'email' }),
  password: Type.String(),
  createdAt: Type.Date(),
});
```

- **`_id`**: The user's unique ID.
- **`email`**: The user's email address (used for login).
- **`password`**: The user's hashed password.
- **`createdAt`**: The timestamp of when the user account was created.

### `documents`

Stores the snapshot of each document.

```typescript
const DocumentSchema = Type.Object({
  _id: Type.String(),
  title: Type.String(),
  content: Type.Any(), // Will be a Tiptap JSON object in Phase 9
  ownerId: Type.String(),
  collaborators: Type.Array(Type.String()),
  createdAt: Type.Date(),
  updatedAt: Type.Date(),
});
```

- **`_id`**: The document's unique ID.
- **`title`**: The title of the document.
- **`content`**: The content of the document.
- **`ownerId`**: The ID of the user who owns the document.
- **`collaborators`**: An array of user IDs who have access to the document.
- **`createdAt`**: The timestamp of when the document was created.
- **`updatedAt`**: The timestamp of the last update.

### `ops`

Stores the operational transformation (OT) operations for each document. This collection is managed by ShareDB.

- **`d`**: The document ID.
- **`v`**: The version number of the operation.
- **`op`**: The operation itself.
- **`src`**: The source of the operation.
- **`seq`**: The sequence number of the operation.

## Data Integrity

- **Validation**: All data is validated against the TypeBox schemas before being persisted to the database.
- **Relationships**: Relationships between collections are maintained via IDs (e.g., `ownerId` in the `documents` collection).
