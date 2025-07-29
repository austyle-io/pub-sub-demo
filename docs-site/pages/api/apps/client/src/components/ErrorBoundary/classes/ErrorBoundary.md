[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/client/src/components/ErrorBoundary](../README.md) / ErrorBoundary

# Class: ErrorBoundary

Defined in: [apps/client/src/components/ErrorBoundary.tsx:15](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/client/src/components/ErrorBoundary.tsx#L15)

## Extends

- `Component`\<`Props`, `State`\>

## Constructors

### Constructor

> **new ErrorBoundary**(`props`): `ErrorBoundary`

Defined in: [apps/client/src/components/ErrorBoundary.tsx:16](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/client/src/components/ErrorBoundary.tsx#L16)

#### Parameters

##### props

`Props`

#### Returns

`ErrorBoundary`

#### Overrides

`Component<Props, State>.constructor`

## Methods

### getDerivedStateFromError()

> `static` **getDerivedStateFromError**(`error`): `State`

Defined in: [apps/client/src/components/ErrorBoundary.tsx:21](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/client/src/components/ErrorBoundary.tsx#L21)

#### Parameters

##### error

`Error`

#### Returns

`State`

***

### componentDidCatch()

> **componentDidCatch**(`error`, `errorInfo`): `void`

Defined in: [apps/client/src/components/ErrorBoundary.tsx:25](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/client/src/components/ErrorBoundary.tsx#L25)

Catches exceptions generated in descendant components. Unhandled exceptions will cause
the entire component tree to unmount.

#### Parameters

##### error

`Error`

##### errorInfo

`ErrorInfo`

#### Returns

`void`

#### Overrides

`Component.componentDidCatch`

***

### render()

> **render**(): `undefined` \| `null` \| `string` \| `number` \| `bigint` \| `boolean` \| `Iterable`\<`ReactNode`, `any`, `any`\> \| `Promise`\<`AwaitedReactNode`\> \| `Element`

Defined in: [apps/client/src/components/ErrorBoundary.tsx:44](https://github.com/austyle-io/pub-sub-demo/blob/facd25f09850fc4e78e94ce267c52e173d869933/apps/client/src/components/ErrorBoundary.tsx#L44)

#### Returns

`undefined` \| `null` \| `string` \| `number` \| `bigint` \| `boolean` \| `Iterable`\<`ReactNode`, `any`, `any`\> \| `Promise`\<`AwaitedReactNode`\> \| `Element`

#### Overrides

`Component.render`
