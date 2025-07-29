[**collab-edit-demo**](../../README.md)

***

[collab-edit-demo](../../README.md) / auth/jwt

# auth/jwt

JWT token management utilities for authentication.

This module provides functions for creating, verifying, and decoding JWT tokens
used in the authentication system. It manages both access tokens (short-lived)
and refresh tokens (long-lived) with proper secret management.

## Since

1.0.0

## Functions

- [getAccessTokenSecret](functions/getAccessTokenSecret.md)
- [getRefreshTokenSecret](functions/getRefreshTokenSecret.md)
- [signAccessToken](functions/signAccessToken.md)
- [signRefreshToken](functions/signRefreshToken.md)
- [verifyAccessToken](functions/verifyAccessToken.md)
- [verifyRefreshToken](functions/verifyRefreshToken.md)
- [decodeToken](functions/decodeToken.md)

## References

### JwtPayload

Re-exports [JwtPayload](../schemas/type-aliases/JwtPayload.md)
