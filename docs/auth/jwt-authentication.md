# JWT Authentication System

## Overview

The authentication system has been updated to use JWT (JSON Web Tokens) for API authentication while maintaining the PASSKEY system for initial server connection validation.

## Architecture

### Two-tier Authentication

1. **Initial Server Connection**: Uses PASSKEY authentication to validate server access
2. **API Requests**: Uses JWT tokens for subsequent API calls

### Backend Implementation

#### Guards

- **PasskeyGuard**: Validates PASSKEY for initial server connection (`/check-server` endpoint)
- **JwtAuthGuard**: Validates JWT tokens for protected API endpoints

#### Flow

1. Client connects to server with PASSKEY via `/check-server`
2. Server validates PASSKEY and returns JWT token
3. Client stores JWT token in localStorage
4. Client includes JWT token in Authorization header for API requests

#### Protected Endpoints

All API endpoints except `/check-server` now require JWT authentication:

- `GET /users`
- `GET /users/:id`
- `POST /posts`
- `PATCH /posts/:id`
- `DELETE /posts/:id`
- `POST /posts/:id/like`

### Frontend Implementation

#### Login Flow

1. User enters server URL and PASSKEY
2. App validates server connection via `/check-server`
3. JWT token is stored in localStorage upon successful validation
4. User proceeds with Twitter OAuth
5. All subsequent API requests include JWT token

#### API Client

The `ApiClient` automatically includes JWT token in Authorization header:

```typescript
Authorization: `Bearer ${token}`
```

## Configuration

### Backend Environment Variables

```env
JWT_SECRET=your-super-secret-jwt-key-here-make-sure-to-change-in-production
PASSKEY=keyword string
```

### Token Configuration

- **Expiration**: 7 days
- **Algorithm**: HS256
- **Storage**: Client-side localStorage

## Security Considerations

1. JWT tokens expire after 7 days
2. PASSKEY validation is only required for initial server connection
3. JWT secret should be changed in production
4. Tokens are stored in localStorage (consider httpOnly cookies for production)

## Migration Notes

- Existing PASSKEY functionality is preserved for initial connection
- All existing API endpoints now require JWT authentication
- Frontend automatically handles token inclusion in requests
- No breaking changes to existing frontend components