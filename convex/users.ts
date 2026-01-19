import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create user from Clerk webhook
 * Called when a user is created in Clerk
 */
export const createUserFromWebhook = mutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user's profile info if provided
      if (args.email || args.name || args.imageUrl) {
        await ctx.db.patch(existingUser._id, {
          ...(args.email && { email: args.email }),
          ...(args.name && { name: args.name }),
          ...(args.imageUrl && { imageUrl: args.imageUrl }),
          updatedAt: Date.now(),
        });
      }
      return existingUser;
    }

    // Create new user
    const now = Date.now();
    const newUserId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      hasAcceptedConsent: false,
      consentAcceptedAt: undefined,
      totalFilesProcessed: 0,
      gpsRemovalsCount: 0,
      cameraInfoRemovalsCount: 0,
      timestampRemovalsCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(newUserId);
  },
});

/**
 * Get or create user record (MUTATION version)
 * Finds user by Clerk ID, creates new user if not exists
 * Use this for the first access when you need to ensure user exists
 */
export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    // Extract Clerk user ID from subject
    const clerkId = identity.subject;

    // Try to find existing user
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (existingUser) {
      return existingUser;
    }

    // Create new user with defaults
    const now = Date.now();
    const newUserId = await ctx.db.insert("users", {
      clerkId,
      email: identity.email,
      name: identity.name,
      imageUrl: identity.pictureUrl,
      hasAcceptedConsent: false,
      consentAcceptedAt: undefined,
      totalFilesProcessed: 0,
      gpsRemovalsCount: 0,
      cameraInfoRemovalsCount: 0,
      timestampRemovalsCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(newUserId);
  },
});

/**
 * Get current user (QUERY version - read only)
 * Returns the authenticated user's record without creating
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const clerkId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    return user;
  },
});

/**
 * Accept usage tracking consent
 * Updates user's consent status
 */
export const acceptConsent = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = identity.subject;

    // Find user
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Update consent status
    await ctx.db.patch(existingUser._id, {
      hasAcceptedConsent: true,
      consentAcceptedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return existingUser._id;
  },
});

/**
 * Decline usage tracking consent
 * Updates user's consent status to declined
 */
export const declineConsent = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = identity.subject;

    // Find user
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Update consent status (explicitly declined)
    await ctx.db.patch(existingUser._id, {
      hasAcceptedConsent: false,
      consentAcceptedAt: undefined,
      updatedAt: Date.now(),
    });

    return existingUser._id;
  },
});
