# Clerk Webhook Setup Guide

This guide explains how to set up Clerk webhooks to automatically create and sync user records in your Convex database when users sign up or update their profile.

## Overview

The webhook implementation handles:
- **user.created**: Automatically creates a user record in Convex when someone signs up via Clerk
- **user.updated**: Updates user profile information (name, email, image) when changed in Clerk

## Prerequisites

- Clerk account with an application configured
- Convex deployment (local or production)
- Project dependencies installed (run `bun install`)

## Step 1: Get Your Convex Deployment URL

If you haven't already deployed to Convex:

```bash
# Start Convex dev server (for local development)
bunx convex dev

# Or deploy to production
bunx convex deploy
```

Copy your Convex deployment URL from the output. It should look like:
```
https://giant-moth-123.convex.cloud
```

## Step 2: Configure Environment Variables

1. Open your `.env.local` file (create it if it doesn't exist)
2. Add the following variable:

```bash
# Clerk Webhook Secret (we'll get this in the next step)
CLERK_WEBHOOK_SECRET=your_webhook_secret_here
```

## Step 3: Create Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks** in the left sidebar
4. Click **Add endpoint**

### Configure the webhook:

**Endpoint URL:**
```
https://your-convex-deployment-url.convex.cloud/clerk-webhook
```

For local development with the Convex dev server:
```
http://localhost:8000/clerk-webhook
```

**Events to subscribe:**
- user.created
- user.updated

**Description:** `CleanPost Desktop - User Sync`

### Create the webhook:

1. Click **Create**
2. Copy the **Signing Secret** (starts with `whsec_`)
3. Add it to your `.env.local` file:

```bash
CLERK_WEBHOOK_SECRET=whsec_your_secret_here
```

## Step 4: Restart Convex Dev Server

After adding the environment variable, restart your Convex dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
bunx convex dev
```

## Step 5: Test the Webhook

### Option A: Test with Clerk Dashboard

1. In Clerk Dashboard, go to **Webhooks**
2. Click on your webhook endpoint
3. Click the **Test** button
4. Select **user.created** event
5. Click **Send test webhook**
6. Check the console logs for success message

### Option B: Test by Creating a Real User

1. Open your app in incognito/private mode
2. Click "Sign In"
3. Create a new account
4. Check Convex dashboard to verify user was created:

```bash
bunx convex dashboard
```

Navigate to **Users** table and verify the record exists.

## Step 6: Production Deployment

For production, you'll need to:

1. Set up environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Create a new webhook in Clerk Dashboard with your production Convex URL
3. Keep the test webhook for development

### Vercel Example:

```bash
# Add environment variable via CLI
vercel env add CLERK_WEBHOOK_SECRET production

# Or via dashboard: vercel.com > Project > Settings > Environment Variables
```

## Troubleshooting

### Webhook returns 400 error

**Issue**: Invalid webhook signature

**Solution**:
- Verify `CLERK_WEBHOOK_SECRET` is set correctly in `.env.local`
- Make sure you copied the entire secret (starts with `whsec_`)
- Restart Convex dev server after updating env vars

### Webhook returns 500 error

**Issue**: Missing environment variable

**Solution**:
```bash
# Check if CLERK_WEBHOOK_SECRET is set
echo $CLERK_WEBHOOK_SECRET

# If empty, add it to .env.local and restart server
```

### User not created in Convex

**Issue**: Webhook not being called

**Solution**:
1. Check Clerk Dashboard > Webhooks > Your webhook > Logs
2. Look for error messages in webhook logs
3. Verify Convex deployment URL is correct
4. Check Convex function logs: `bunx convex logs`

### "Missing CLERK_WEBHOOK_SECRET" in console

**Issue**: Environment variable not loaded

**Solution**:
- Ensure `.env.local` is in project root
- Restart Convex dev server
- Check for typos in variable name

## Webhook Implementation Details

### Files Modified

1. **convex/http.ts** - Webhook endpoint and verification
2. **convex/users.ts** - User creation mutation
3. **convex/schema.ts** - User schema with email, name, imageUrl fields

### Webhook Flow

```
Clerk Event → Webhook Endpoint → Verify Signature → Create/Update User → Convex Database
```

### User Data Stored

When a user is created/updated in Clerk, the webhook stores:
- `clerkId` - Clerk user ID (primary identifier)
- `email` - Primary email address
- `name` - Full name (first + last)
- `imageUrl` - Profile picture URL
- `hasAcceptedConsent` - false (new users)
- `totalFilesProcessed` - 0 (new users)
- Usage counters - all 0 (new users)
- `createdAt` / `updatedAt` - Timestamps

## Security

The webhook implementation includes several security measures:

1. **Svix Verification**: Uses Svix library to verify webhook signatures
2. **Header Validation**: Checks for required Svix headers
3. **Environment Variable**: Secret stored securely in environment
4. **Error Logging**: Logs errors without exposing sensitive data

## Monitoring

### View Webhook Logs

```bash
# Convex function logs
bunx convex logs

# Clerk webhook logs
# Clerk Dashboard > Webhooks > Your webhook > Logs
```

### Monitor User Creation

```bash
# Open Convex dashboard
bunx convex dashboard

# Navigate to "Users" table
# View real-time user records
```

## Additional Resources

- [Clerk Webhooks Documentation](https://clerk.com/docs/webhooks/sync-data)
- [Convex HTTP Actions](https://docs.convex.dev/http-actions)
- [Svix Webhook Verification](https://github.com/svix/svix-webhooks)

## Example Webhook Payload

```json
{
  "type": "user.created",
  "data": {
    "id": "user_1234567890",
    "email_addresses": [{
      "email_address": "user@example.com",
      "id": "idn_1234567890"
    }],
    "first_name": "John",
    "last_name": "Doe",
    "image_url": "https://example.com/avatar.png"
  }
}
```

This will create a user in Convex with:
- clerkId: "user_1234567890"
- email: "user@example.com"
- name: "John Doe"
- imageUrl: "https://example.com/avatar.png"
