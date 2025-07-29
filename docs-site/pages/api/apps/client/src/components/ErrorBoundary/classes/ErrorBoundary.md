[**collab-edit-demo**](../../../../../../README.md)

***

[collab-edit-demo](../../../../../../README.md) / [apps/client/src/components/ErrorBoundary](../README.md) / ErrorBoundary

# Class: ErrorBoundary

Defined in: [apps/client/src/components/ErrorBoundary.tsx:19](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/components/ErrorBoundary.tsx#L19)

Error class for boundary errors.

## Since

1.0.0

## Extends

- `Component`\<`Props`, `State`\>

## Constructors

### Constructor

> **new ErrorBoundary**(`props`): `ErrorBoundary`

Defined in: [apps/client/src/components/ErrorBoundary.tsx:20](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/components/ErrorBoundary.tsx#L20)

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

Defined in: [apps/client/src/components/ErrorBoundary.tsx:25](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/components/ErrorBoundary.tsx#L25)

#### Parameters

##### error

`Error`

#### Returns

`State`

***

### componentDidCatch()

> **componentDidCatch**(`error`, `errorInfo`): `void`

Defined in: [apps/client/src/components/ErrorBoundary.tsx:29](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/components/ErrorBoundary.tsx#L29)

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

Defined in: [apps/client/src/components/ErrorBoundary.tsx:48](https://github.com/austyle-io/pub-sub-demo/blob/00b2f1e9b947d5e964db5c3be9502513c4374263/apps/client/src/components/ErrorBoundary.tsx#L48)

#### Returns

`undefined` \| `null` \| `string` \| `number` \| `bigint` \| `boolean` \| `Iterable`\<`ReactNode`, `any`, `any`\> \| `Promise`\<`AwaitedReactNode`\> \| `Element`

#### Overrides

`Component.render`
