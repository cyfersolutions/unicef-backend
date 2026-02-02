# JWT Token Invalidation Implementation

## Overview
This document explains how JWT token invalidation (logout) works in the backend. Since JWTs are stateless by design, we use a **Redis-based token blacklist** to invalidate tokens when users log out.

## How It Works

### 1. **Token Blacklist Storage (Redis)**
- When a user logs out, their JWT token is added to a Redis blacklist
- The token is stored with a TTL (Time To Live) equal to the token's remaining expiration time
- Format: `jwt:blacklist:{token}` → `"1"` (with TTL)

### 2. **Token Validation**
- Every time a JWT is validated (via `JwtStrategy` or `JwtUserStrategy`), the system checks if the token exists in the blacklist
- If the token is blacklisted, authentication fails with `401 Unauthorized`
- This happens **before** any database queries or business logic

### 3. **Logout Flow**

#### For Users (Vaccinators/Supervisors):
```
POST /auth/logout
Headers: Authorization: Bearer {token}
```

**What happens:**
1. Extract token from `Authorization` header
2. Decode token to get expiration time (`exp` claim)
3. Add token to Redis blacklist with TTL = remaining expiration time
4. Delete NEIR token from Redis
5. Return success message

#### For Admins:
```
POST /auth/admin/logout
Headers: Authorization: Bearer {token}
```

**What happens:**
1. Extract token from `Authorization` header
2. Decode token to get expiration time (`exp` claim)
3. Add token to Redis blacklist with TTL = remaining expiration time
4. Return success message

## Implementation Details

### Redis Service Methods

```typescript
// Add token to blacklist
async addTokenToBlacklist(token: string, expirationTime: number): Promise<void>

// Check if token is blacklisted
async isTokenBlacklisted(token: string): Promise<boolean>

// Remove token from blacklist (optional, for manual cleanup)
async removeTokenFromBlacklist(token: string): Promise<void>
```

### JWT Strategy Updates

Both `JwtStrategy` and `JwtUserStrategy` now:
1. Accept `passReqToCallback: true` to access the request object
2. Extract the token from the Authorization header
3. Check Redis blacklist before validating the token
4. Throw `UnauthorizedException` if token is blacklisted

## Testing the Logout

### Step 1: Login and Get Token
```bash
# Login as user
POST /auth/neir/callback
Body: { "session_id": "...", "neir_token": "..." }

# Response includes accessToken
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Step 2: Use Token for Authenticated Request
```bash
# Get profile (should work)
GET /auth/profile
Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Logout
```bash
# Logout
POST /auth/logout
Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Response
{
  "message": "Logged out successfully"
}
```

### Step 4: Verify Token is Invalidated
```bash
# Try to use the same token (should fail)
GET /auth/profile
Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Response: 401 Unauthorized
{
  "statusCode": 401,
  "message": "Token has been revoked"
}
```

## Redis Key Structure

```
jwt:blacklist:{full_jwt_token} → "1" (with TTL)
```

Example:
```
jwt:blacklist:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c → "1"
```

## Benefits

1. **Immediate Invalidation**: Tokens are invalidated immediately upon logout
2. **Automatic Cleanup**: Redis TTL automatically removes expired tokens from blacklist
3. **Scalable**: Redis handles high-volume token checks efficiently
4. **Secure**: Even if someone steals a token, it can be invalidated

## Important Notes

- **Token Expiration**: Tokens still expire naturally based on their `exp` claim
- **Blacklist TTL**: Blacklisted tokens are stored with TTL equal to remaining expiration time
- **Performance**: Each authenticated request checks Redis (minimal overhead)
- **Redis Dependency**: Logout functionality requires Redis to be running

## Frontend Integration

The frontend should:
1. Call `/auth/logout` endpoint with the current token
2. Remove token from SecureStore/localStorage
3. Invalidate all RTK Query cache
4. Redirect to login screen

Example:
```typescript
const handleLogout = async () => {
  try {
    await logout().unwrap();
    await SecureStore.deleteItemAsync('auth_token');
    // Invalidate all queries
    dispatch(authApi.util.invalidateTags(['Auth', 'Me', ...]));
    router.replace('/signin');
  } catch (error) {
    // Handle error
  }
};
```

