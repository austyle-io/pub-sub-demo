[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [packages/shared/src/services/Logger](../README.md) / LOGGING\_CONFIG

# Variable: LOGGING\_CONFIG

> `const` **LOGGING\_CONFIG**: `object`

Defined in: [packages/shared/src/services/Logger.ts:37](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/packages/shared/src/services/Logger.ts#L37)

## Type declaration

### development

> `readonly` **development**: `object`

#### development.level

> `readonly` **level**: `"debug"` = `LOG_LEVEL.DEBUG`

#### development.enableConsole

> `readonly` **enableConsole**: `true` = `true`

#### development.enableFile

> `readonly` **enableFile**: `false` = `false`

#### development.enableExternal

> `readonly` **enableExternal**: `false` = `false`

#### development.pretty

> `readonly` **pretty**: `true` = `true`

### production

> `readonly` **production**: `object`

#### production.level

> `readonly` **level**: `"info"` = `LOG_LEVEL.INFO`

#### production.enableConsole

> `readonly` **enableConsole**: `true` = `true`

#### production.enableFile

> `readonly` **enableFile**: `true` = `true`

#### production.filePath

> `readonly` **filePath**: `".logs/production.log"` = `'.logs/production.log'`

#### production.enableExternal

> `readonly` **enableExternal**: `false` = `false`

#### production.pretty

> `readonly` **pretty**: `false` = `false`

### test

> `readonly` **test**: `object`

#### test.level

> `readonly` **level**: `"error"` = `LOG_LEVEL.ERROR`

#### test.enableConsole

> `readonly` **enableConsole**: `false` = `false`

#### test.enableFile

> `readonly` **enableFile**: `false` = `false`

#### test.enableExternal

> `readonly` **enableExternal**: `false` = `false`

#### test.pretty

> `readonly` **pretty**: `false` = `false`
