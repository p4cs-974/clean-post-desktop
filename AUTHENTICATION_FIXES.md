# Authentication Implementation Fixes

## Summary

Fixed the authentication flow to properly use Convex's `Authenticated`, `Unauthenticated`, and `AuthLoading` components instead of mixing mutations and queries incorrectly.

## Changes Made

### 1. Convex Backend (`convex/`)

#### `convex/users.ts`
- **Added**: `getCurrentUser` query - Returns the authenticated user's record without creating one
- **Kept**: `getOrCreateUser` mutation - Now only used when user doesn't exist
- **Added**: `createUserFromWebhook` mutation - Handles user creation from Clerk webhooks
- **Fixed**: `getOrCreateUser` to use `identity.email` directly instead of `.preview` or `.token`

#### `convex/schema.ts`
- **Added**: `email`, `name`, `imageUrl` fields to users table
- **Added**: `by_email` index for efficient email lookups
- **Changed**: All new fields are optional to maintain flexibility

#### `convex/http.ts`
- **Added**: Clerk webhook endpoint at `/clerk-webhook`
- **Implemented**: Svix signature verification for security
- **Handles**: Both `user.created` and `user.updated` events
- **Fixed**: Removed unused `request` parameter from `/ping` handler

### 2. Frontend Components (`src/components/`)

#### `src/components/AuthGuard.tsx`
**Before:**
```typescript
const user = useQuery(api.users.getOrCreateUser); // ❌ Using mutation as query
```

**After:**
```typescript
const user = useQuery(api.users.getCurrentUser); // ✅ Proper query
const ensureUser = useMutation(api.users.getOrCreateUser); // ✅ Mutation for side effects

// Ensure user exists when authenticated
useEffect(() => {
  if (user === undefined) return; // Still loading
  if (user === null) {
    ensureUser(); // Create user if doesn't exist
  }
}, [user, ensureUser]);
```

**Benefits:**
- Proper separation of queries and mutations
- Query returns `undefined` while loading, `null` if not found, or user object
- Effect creates user only when needed
- Follows Convex best practices

#### `src/components/SettingsModal.tsx`
- **Fixed**: Changed `useState(() => ...)` to `useEffect(() => ...)` on line 24
- **Removed**: Unused `isSubmitting` state variable
- **Added**: Save button functionality with `handleSave` function
- **Cleaned up**: Unused imports

#### `src/components/UsageConsentModal.tsx`
- **Removed**: Unused `AnimatePresence` import

#### `src/App.tsx`
- **Removed**: Unused `Shield` import

### 3. Dependencies

**Added:**
```bash
bun add svix
```

**Already installed:**
- `@clerk/backend` - For webhook types

### 4. Configuration

#### `.env.example`
```bash
# Clerk Webhook Secret
CLERK_WEBHOOK_SECRET=
```

## Authentication Flow

### Before (Broken)
```
User signs in → AuthGuard calls getOrCreateUser (mutation) as query → Error
```

### After (Fixed)
```
1. User visits app
   ↓
2. AuthLoading shows skeleton
   ↓
3. Unauthenticated shows sign-in screen (if not signed in)
   ↓
4. User signs in with Clerk
   ↓
5. Authenticated → getCurrentUser query runs
   ↓
6a. User exists → Show app
6b. User doesn't exist → getOrCreateUser mutation → Show app
```

## How It Works

### Query vs Mutation

**Queries (Read-only):**
- `getCurrentUser` - Just reads user data
- Returns: `undefined` (loading), `null` (not found), or user object
- Used with `useQuery` hook

**Mutations (Write operations):**
- `getOrCreateUser` - Creates user if doesn't exist
- `createUserFromWebhook` - Creates/updates user from webhook
- Used with `useMutation` hook or in HTTP actions

### AuthGuard Logic

```typescript
const user = useQuery(api.users.getCurrentUser); // Query
const ensureUser = useMutation(api.users.getOrCreateUser); // Mutation

useEffect(() => {
  if (user === undefined) return; // Still loading from query
  if (user === null) ensureUser(); // User not found, create them
}, [user, ensureUser]);
```

This pattern ensures:
1. Query runs first (fast, read-only)
2. Mutation only runs if needed (slower, write operation)
3. No race conditions or unnecessary mutations

## Testing

### Build Status
✅ TypeScript compilation successful
✅ All components properly typed
✅ No unused variables

### Test the Flow

1. **Start development server:**
   ```bash
   bunx convex dev
   bun run dev
   ```

2. **Test authentication:**
   - Open app in incognito
   - Should see sign-in screen
   - Sign in with Clerk
   - Should see main app

3. **Verify user creation:**
   ```bash
   bunx convex dashboard
   ```
   - Navigate to "Users" table
   - Verify user record exists with email, name, imageUrl

## Documentation

Created comprehensive guides:
- **CLERK_WEBHOOK_SETUP.md** - Detailed webhook setup instructions
- **WEBHOOK_QUICK_START.md** - Quick reference for common tasks
- **test-webhook.sh** - Automated verification script

## Security Improvements

1. **Webhook Signature Verification**: Uses Svix library to verify webhooks are from Clerk
2. **Environment Variables**: Sensitive data stored in `.env.local`
3. **Error Logging**: Errors logged without exposing sensitive data
4. **Proper Query/Mutation Separation**: Prevents data leaks and race conditions

## Next Steps

1. **Set up Clerk webhook** (see CLERK_WEBHOOK_SETUP.md):
   - Get Convex deployment URL
   - Create webhook in Clerk Dashboard
   - Add webhook secret to environment

2. **Test webhook**:
   - Create test user in Clerk
   - Verify user appears in Convex dashboard

3. **Deploy to production**:
   - Set production environment variables
   - Create production webhook in Clerk
   - Test end-to-end flow

## Files Modified

```
convex/
├── http.ts           # Added webhook endpoint
├── schema.ts         # Added email, name, imageUrl fields
└── users.ts          # Added getCurrentUser query, fixed mutations

src/components/
├── AuthGuard.tsx     # Fixed to use query + effect pattern
├── SettingsModal.tsx # Fixed useEffect, added save button
├── UsageConsentModal.tsx # Removed unused import
└── App.tsx           # Removed unused import

.env.example          # Added CLERK_WEBHOOK_SECRET
package.json          # Added svix dependency
```

## Key Takeaways

✅ **Queries are for reading** - Use `useQuery` for `getCurrentUser`
✅ **Mutations are for writing** - Use `useMutation` for `getOrCreateUser`
✅ **Use effects for side effects** - `useEffect` to call mutation when query returns null
✅ **Convex auth components** - `Authenticated`, `Unauthenticated`, `AuthLoading` for UI
✅ **Webhooks for sync** - Clerk webhook keeps Convex in sync with Clerk user data
