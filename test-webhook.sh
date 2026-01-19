#!/bin/bash

# Test script to verify Clerk webhook setup
echo "🔍 Testing Clerk Webhook Setup"
echo "================================"
echo ""

# Check if required dependencies are installed
echo "📦 Checking dependencies..."
if bun pm ls | grep -q "svix"; then
    echo "✅ svix is installed"
else
    echo "❌ svix is NOT installed"
    echo "   Run: bun add svix"
    exit 1
fi

if bun pm ls | grep -q "@clerk/backend"; then
    echo "✅ @clerk/backend is installed"
else
    echo "❌ @clerk/backend is NOT installed"
    exit 1
fi

echo ""
echo "📝 Checking Convex files..."

# Check if webhook handler exists
if [ -f "convex/http.ts" ]; then
    if grep -q "clerkWebhook" convex/http.ts; then
        echo "✅ Webhook handler found in convex/http.ts"
    else
        echo "❌ Webhook handler NOT found in convex/http.ts"
        exit 1
    fi
else
    echo "❌ convex/http.ts does not exist"
    exit 1
fi

# Check if user mutation exists
if [ -f "convex/users.ts" ]; then
    if grep -q "createUserFromWebhook" convex/users.ts; then
        echo "✅ User mutation found in convex/users.ts"
    else
        echo "❌ User mutation NOT found in convex/users.ts"
        exit 1
    fi
else
    echo "❌ convex/users.ts does not exist"
    exit 1
fi

# Check if schema is updated
if [ -f "convex/schema.ts" ]; then
    if grep -q "email" convex/schema.ts && grep -q "name" convex/schema.ts && grep -q "imageUrl" convex/schema.ts; then
        echo "✅ User schema includes email, name, and imageUrl fields"
    else
        echo "❌ User schema is missing required fields"
        exit 1
    fi
else
    echo "❌ convex/schema.ts does not exist"
    exit 1
fi

echo ""
echo "🔐 Checking environment variables..."

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file exists"

    # Check for CLERK_WEBHOOK_SECRET (but don't show the value)
    if grep -q "^CLERK_WEBHOOK_SECRET=" .env.local; then
        echo "✅ CLERK_WEBHOOK_SECRET is set (hidden for security)"
    else
        echo "⚠️  CLERK_WEBHOOK_SECRET is NOT set"
        echo "   Add it to .env.local: CLERK_WEBHOOK_SECRET=whsec_..."
    fi
else
    echo "⚠️  .env.local file does not exist"
    echo "   Create it with: CLERK_WEBHOOK_SECRET=whsec_..."
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "Next steps:"
echo "1. Get your Convex deployment URL: bunx convex dev"
echo "2. Create a webhook in Clerk Dashboard"
echo "3. Add the webhook URL: https://your-convex-url.convex.cloud/clerk-webhook"
echo "4. Copy the webhook secret to .env.local"
echo "5. Restart the dev server"
echo ""
echo "For detailed instructions, see CLERK_WEBHOOK_SETUP.md"
