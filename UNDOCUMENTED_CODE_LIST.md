# Exhaustive List of Undocumented Code

Generated: 2025-07-23T03:08:48.919Z

Total undocumented items: 172
Current coverage: 16.1%

## Summary by Type

- **variable**: 87 items
- **type**: 67 items
- **function**: 13 items
- **interface**: 3 items
- **class**: 2 items

## @collab-edit/client (26 items)

### Variables (14)

- **SecureTextArea** - `components/SecureTextArea.tsx:12`
- **useDocumentPermissions** - `hooks/useDocumentPermissions.ts:3`
- **createClientLogger** - `hooks/useLogger.ts:146`
- **LOG_LEVEL** - `hooks/useLogger.ts:1`
- **isDocumentData** - `hooks/useShareDB.ts:18`
- **authMachine** - `machines/auth.machine.ts:33`
- **router** - `routes.tsx:37`
- **authService** - `services/auth.service.ts:107`
- **cookieManager** - `utils/cookie-manager.ts:198`
- **sanitizeDocumentTitle** - `utils/input-sanitizer.ts:55`
- **sanitizeFileName** - `utils/input-sanitizer.ts:19`
- **sanitizeHtml** - `utils/input-sanitizer.ts:12`
- **sanitizeText** - `utils/input-sanitizer.ts:33`
- **tokenManager** - `utils/token-manager.ts:33`

### Functions (6)

- **DocumentEditor** - `components/DocumentEditor.tsx:90`
- **DocumentList** - `components/DocumentList.tsx:23`
- **AuthProvider** - `contexts/AuthContext.tsx:22`
- **useAuth** - `contexts/AuthContext.tsx:88`
- **useAuthFetch** - `hooks/useAuthFetch.ts:2`
- **useShareDB** - `hooks/useShareDB.ts:42`

### Types (5)

- **ClientLogger** - `hooks/useLogger.ts:12`
- **LogContext** - `hooks/useLogger.ts:11`
- **LogLevel** - `hooks/useLogger.ts:9`
- **AuthContext** - `machines/auth.machine.ts:8`
- **AuthEvent** - `machines/auth.machine.ts:15`

### Classs (1)

- **ErrorBoundary** - `components/ErrorBoundary.tsx:13`

## @collab-edit/server (69 items)

### Types (39)

- **Config** - `config/env-validator.ts:136`
- **AuthenticatedRequest** - `middleware/websocket-auth.ts:3`
- **ShareDBDocument** - `routes/doc.routes.ts:13`
- **Env** - `types/env.ts:6`
- **AddNumOp** - `types/sharedb.ts:30`
- **Agent** - `types/sharedb.ts:121`
- **CollectionName** - `types/sharedb.ts:24`
- **Connection** - `types/sharedb.ts:199`
- **Context** - `types/sharedb.ts:131`
- **Doc** - `types/sharedb.ts:177`
- **DocumentData** - `types/sharedb.ts:20`
- **DocumentID** - `types/sharedb.ts:23`
- **JSONArray** - `types/sharedb.ts:19`
- **JSONObject** - `types/sharedb.ts:18`
- **JSONValue** - `types/sharedb.ts:9`
- **Middleware** - `types/sharedb.ts:142`
- **MilestoneDBAdapter** - `types/sharedb.ts:119`
- **ObjectDeleteOp** - `types/sharedb.ts:40`
- **ObjectInsertOp** - `types/sharedb.ts:35`
- **ObjectReplaceOp** - `types/sharedb.ts:45`
- **Op** - `types/sharedb.ts:61`
- **OperationType** - `types/sharedb.ts:26`
- **Path** - `types/sharedb.ts:27`
- **PubSubAdapter** - `types/sharedb.ts:105`
- **Query** - `types/sharedb.ts:220`
- **RawOp** - `types/sharedb.ts:163`
- **ShareDB** - `types/sharedb.ts:229`
- **ShareDBAdapter** - `types/sharedb.ts:77`
- **ShareDBConstructor** - `types/sharedb.ts:247`
- **ShareDBMongoFactory** - `types/sharedb.ts:250`
- **ShareDBOptions** - `types/sharedb.ts:70`
- **Snapshot** - `types/sharedb.ts:148`
- **SnapshotMeta** - `types/sharedb.ts:157`
- **StringDeleteOp** - `types/sharedb.ts:56`
- **StringInsertOp** - `types/sharedb.ts:51`
- **VersionNumber** - `types/sharedb.ts:25`
- **WebSocketJSONStream** - `types/sharedb.ts:242`
- **WebSocketJSONStreamConstructor** - `types/sharedb.ts:251`
- **AuditEvent** - `utils/audit-logger.ts:8`

### Variables (24)

- **validateEnvironment** - `config/env-validator.ts:19`
- **authenticate** - `middleware/passport.ts:40`
- **authenticateWebSocket** - `middleware/websocket-auth.ts:17`
- **apiLogger** - `services/logger.ts:7`
- **authLogger** - `services/logger.ts:5`
- **dbLogger** - `services/logger.ts:8`
- **logPerformance** - `services/logger.ts:26`
- **requestLogger** - `services/logger.ts:9`
- **serverLogger** - `services/logger.ts:2`
- **sharedbLogger** - `services/logger.ts:6`
- **getShareDB** - `services/sharedb.service.ts:257`
- **initializeShareDB** - `services/sharedb.service.ts:250`
- **logAuditEvent** - `utils/audit-logger.ts:18`
- **closeDatabaseConnection** - `utils/database.ts:36`
- **connectToDatabase** - `utils/database.ts:6`
- **disconnectFromDatabase** - `utils/database.ts:44`
- **getDatabase** - `utils/database.ts:55`
- **getUsersCollection** - `utils/database.ts:48`
- **documentEvents** - `utils/event-consistency.ts:146`
- **permissionCache** - `utils/permission-cache.ts:233`
- **canUserEditDocument** - `utils/permissions.ts:117`
- **canUserViewDocument** - `utils/permissions.ts:136`
- **checkDocumentPermission** - `utils/permissions.ts:5`
- **syncMonitor** - `utils/sync-monitoring.ts:371`

### Interfaces (3)

- **PermissionChangeEvent** - `utils/event-consistency.ts:24`
- **CacheMetrics** - `utils/permission-cache.ts:27`
- **SyncAlert** - `utils/sync-monitoring.ts:47`

### Functions (2)

- **configurePassport** - `middleware/passport.ts:6`
- **isValidEnv** - `types/env.ts:173`

### Classs (1)

- **AuthService** - `services/auth.service.ts:17`

## @collab-edit/shared (77 items)

### Variables (49)

- **decodeToken** - `auth/jwt.ts:60`
- **getAccessTokenSecret** - `auth/jwt.ts:4`
- **getRefreshTokenSecret** - `auth/jwt.ts:14`
- **signAccessToken** - `auth/jwt.ts:24`
- **signRefreshToken** - `auth/jwt.ts:33`
- **verifyAccessToken** - `auth/jwt.ts:42`
- **verifyRefreshToken** - `auth/jwt.ts:51`
- **hashPassword** - `auth/password.ts:5`
- **verifyPassword** - `auth/password.ts:9`
- **AuthResponseSchema** - `auth/schemas.ts:65`
- **CreateUserRequestSchema** - `auth/schemas.ts:39`
- **JwtPayloadSchema** - `auth/schemas.ts:85`
- **LoginRequestSchema** - `auth/schemas.ts:53`
- **PublicUserSchema** - `auth/schemas.ts:36`
- **RefreshTokenRequestSchema** - `auth/schemas.ts:77`
- **UserRoleSchema** - `auth/schemas.ts:1`
- **UserSchema** - `auth/schemas.ts:10`
- **isValidEmail** - `auth/validation.ts:57`
- **isValidUser** - `auth/validation.ts:65`
- **openApiSpec** - `openapi.ts:15`
- **CreateDocumentRequestSchema** - `schemas/api.ts:2`
- **CreateDocumentResponseSchema** - `schemas/api.ts:18`
- **ErrorResponseSchema** - `schemas/api.ts:23`
- **SuccessResponseSchema** - `schemas/api.ts:36`
- **UpdateDocumentRequestSchema** - `schemas/api.ts:45`
- **DocumentACLSchema** - `schemas/document.ts:1`
- **DocumentListSchema** - `schemas/document.ts:52`
- **DocumentSchema** - `schemas/document.ts:26`
- **DocumentUpdateSchema** - `schemas/document.ts:55`
- **PermissionsSchema** - `schemas/permissions.ts:1`
- **isValidACL** - `schemas/validation.ts:3`
- **isValidDocumentData** - `schemas/validation.ts:14`
- **createAppLogger** - `services/Logger.ts:66`
- **LOG_LEVEL** - `services/Logger.ts:2`
- **logger** - `services/Logger.ts:183`
- **LOGGING_CONFIG** - `services/Logger.ts:34`
- **sanitizeApiError** - `utils/error-sanitizer.ts:39`
- **sanitizeError** - `utils/error-sanitizer.ts:29`
- **validateAuthResponse** - `validation.ts:41`
- **validateCreateDocumentRequest** - `validation.ts:30`
- **validateCreateUserRequest** - `validation.ts:39`
- **validateDocument** - `validation.ts:27`
- **validateDocumentUpdate** - `validation.ts:29`
- **validateErrorResponse** - `validation.ts:36`
- **validateJwtPayload** - `validation.ts:45`
- **validateLoginRequest** - `validation.ts:40`
- **validateRefreshTokenRequest** - `validation.ts:42`
- **validateUpdateDocumentRequest** - `validation.ts:33`
- **validateUser** - `validation.ts:37`

### Types (23)

- **AuthResponse** - `auth/schemas.ts:75`
- **CreateUserRequest** - `auth/schemas.ts:51`
- **JwtPayload** - `auth/schemas.ts:97`
- **LoginRequest** - `auth/schemas.ts:63`
- **PublicUser** - `auth/schemas.ts:38`
- **RefreshTokenRequest** - `auth/schemas.ts:83`
- **User** - `auth/schemas.ts:34`
- **UserRole** - `auth/schemas.ts:8`
- **CreateDocumentRequest** - `schemas/api.ts:16`
- **CreateDocumentResponse** - `schemas/api.ts:20`
- **ErrorResponse** - `schemas/api.ts:34`
- **SuccessResponse** - `schemas/api.ts:43`
- **UpdateDocumentRequest** - `schemas/api.ts:53`
- **Document** - `schemas/document.ts:50`
- **DocumentACL** - `schemas/document.ts:24`
- **DocumentList** - `schemas/document.ts:54`
- **DocumentUpdate** - `schemas/document.ts:65`
- **Permissions** - `schemas/permissions.ts:7`
- **AppLogger** - `services/Logger.ts:24`
- **LogContext** - `services/Logger.ts:12`
- **LoggerConfig** - `services/Logger.ts:14`
- **LogLevel** - `services/Logger.ts:10`
- **ValidationError** - `validation.ts:46`

### Functions (5)

- **isCreateUserRequest** - `auth/validation.ts:81`
- **isLoginRequest** - `auth/validation.ts:87`
- **isRefreshTokenRequest** - `auth/validation.ts:91`
- **getValidationErrors** - `validation.ts:51`
- **validateOrThrow** - `validation.ts:62`

## Priority Files to Document

- **apps/server/src/types/sharedb.ts** (34 undocumented exports)
- **packages/shared/src/auth/schemas.ts** (16 undocumented exports)
- **packages/shared/src/validation.ts** (14 undocumented exports)
- **packages/shared/src/schemas/api.ts** (10 undocumented exports)
- **packages/shared/src/schemas/document.ts** (8 undocumented exports)
- **packages/shared/src/services/Logger.ts** (8 undocumented exports)
- **apps/server/src/services/logger.ts** (7 undocumented exports)
- **packages/shared/src/auth/jwt.ts** (7 undocumented exports)
- **apps/client/src/hooks/useLogger.ts** (5 undocumented exports)
- **apps/server/src/utils/database.ts** (5 undocumented exports)
- **packages/shared/src/auth/validation.ts** (5 undocumented exports)
- **apps/client/src/utils/input-sanitizer.ts** (4 undocumented exports)
- **apps/client/src/machines/auth.machine.ts** (3 undocumented exports)
- **apps/server/src/utils/permissions.ts** (3 undocumented exports)
- **apps/client/src/contexts/AuthContext.tsx** (2 undocumented exports)
- **apps/client/src/hooks/useShareDB.ts** (2 undocumented exports)
- **apps/server/src/config/env-validator.ts** (2 undocumented exports)
- **apps/server/src/middleware/passport.ts** (2 undocumented exports)
- **apps/server/src/middleware/websocket-auth.ts** (2 undocumented exports)
- **apps/server/src/services/sharedb.service.ts** (2 undocumented exports)
