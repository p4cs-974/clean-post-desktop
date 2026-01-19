# Clerk Webhook Quick Start

## What Was Implemented

✅ Clerk webhook endpoint for user creation and updates
✅ Automatic sync of user data from Clerk to Convex
✅ Webhook signature verification using Svix
✅ Support for both `user.created` and `user.updated` events

## Files Modified

1. **convex/http.ts** - Added webhook endpoint at `/clerk-webhook`
2. **convex/users.ts** - Added `createUserFromWebhook` mutation
3. **convex/schema.ts** - Added `email`, `name`, `imageUrl` fields to users table
4. **package.json** - Added `svix` dependency

## Setup Steps

### 1. Start Convex Dev Server

```bash
bunx convex dev
```

Copy the deployment URL from the output (e.g., `https://giant-moth-123.convex.cloud`)

### 2. Create Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks** → **Add endpoint**
3. Set endpoint URL: `https://your-convex-url.convex.cloud/clerk-webhook`
4. Subscribe to events:
   - `user.created`
   - `user.updated`
5. Click **Create**
6. Copy the **Signing Secret** (starts with `whsec_`)

### 3. Configure Environment Variable

Add to `.env.local`:

```bash
CLERK_WEBHOOK_SECRET=whsec_your_secret_here
```

### 4. Restart Convex Server

```bash
# Stop current server (Ctrl+C)
bunx convex dev
```

### 5. Test

Option A - Test from Clerk Dashboard:
- Go to Webhooks → Your webhook → Test → Send test webhook

Option B - Test with real signup:
- Open app in incognito
- Sign up as new user
- Check Convex dashboard: `bunx convex dashboard`

## How It Works

```
User signs up in Clerk
    ↓
Clerk sends webhook event
    ↓
Convex receives webhook at /clerk-webhook
    ↓
Webhook signature verified with Svix
    ↓
User record created/updated in Convex
    ↓
User data synced (email, name, avatar)
```

## User Data Synced

When a user is created/updated in Clerk, the webhook stores:
- `clerkId` - Clerk user ID
- `email` - Primary email address
- `name` - Full name
- `imageUrl` - Profile picture URL
- Plus all existing fields (consent, usage stats, etc.)

## Webhook URL Format

**Development:**
```
http://localhost:8000/clerk-webhook
```

**Production:**
```
https://your-convex-deployment.convex.cloud/clerk-webhook
```

## Testing Script

Run the verification script:

```bash
bash test-webhook.sh
```

This checks:
- ✅ Dependencies installed (svix, @clerk/backend)
- ✅ Webhook handler exists
- ✅ User mutation exists
- ✅ Schema updated correctly
- ✅ Environment variable configured

## Troubleshooting

**Webhook returns 400:**
- Check `CLERK_WEBHOOK_SECRET` is correct
- Verify secret starts with `whsec_`
- Restart Convex dev server

**Webhook returns 500:**
- Ensure `CLERK_WEBHOOK_SECRET` is set
- Check Convex logs: `bunx convex logs`

**User not created:**
- Check webhook logs in Clerk Dashboard
- Verify Convex deployment URL
- Check for errors in Convex logs

## Documentation

See [CLERK_WEBHOOK_SETUP.md](./CLERK_WEBHOOK_SETUP.md) for detailed setup instructions with screenshots and troubleshooting.

## Security

- ✅ Webhook signature verification using Svix
- ✅ Environment variable for secret storage
- ✅ Error logging without exposing sensitive data
- ✅ Only accepts requests from Clerk

## Monitoring

View webhook activity:
```bash
# Convex function logs
bunx convex logs

# Clerk webhook logs
# Clerk Dashboard > Webhooks > Your webhook > Logs
```
