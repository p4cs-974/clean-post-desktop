import { mutation } from "./_generated/server";
import { v } from "convex/values";
/**
 * Track file processing event
 * Increments total files processed counter
 */
export const trackFileProcessed = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return; // Silently fail if not authenticated
    }

    const clerkId = identity.subject;

    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user || !user.hasAcceptedConsent) {
      return; // Only track if user has consented
    }

    // Increment counter
    await ctx.db.patch(user._id, {
      totalFilesProcessed: user.totalFilesProcessed + 1,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Track GPS metadata removal
 * Increments GPS removals counter and creates usage stats entry
 */
export const trackGPSRemoval = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return;
    }

    const clerkId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user || !user.hasAcceptedConsent) {
      return;
    }

    // Create usage stats entry
    const now = Date.now();
    await ctx.db.insert("usageStats", {
      userId: user._id,
      removalType: "gps",
      timestamp: now,
    });

    // Increment counter
    await ctx.db.patch(user._id, {
      gpsRemovalsCount: user.gpsRemovalsCount + 1,
      updatedAt: now,
    });
  },
});

/**
 * Track camera info/EXIF removal
 * Increments camera info removals counter and creates usage stats entry
 */
export const trackCameraInfoRemoval = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return;
    }

    const clerkId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user || !user.hasAcceptedConsent) {
      return;
    }

    // Create usage stats entry
    const now = Date.now();
    await ctx.db.insert("usageStats", {
      userId: user._id,
      removalType: "cameraInfo",
      timestamp: now,
    });

    // Increment counter
    await ctx.db.patch(user._id, {
      cameraInfoRemovalsCount: user.cameraInfoRemovalsCount + 1,
      updatedAt: now,
    });
  },
});

/**
 * Track timestamp removal
 * Increments timestamp removals counter and creates usage stats entry
 */
export const trackTimestampRemoval = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return;
    }

    const clerkId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user || !user.hasAcceptedConsent) {
      return;
    }

    // Create usage stats entry
    const now = Date.now();
    await ctx.db.insert("usageStats", {
      userId: user._id,
      removalType: "timestamp",
      timestamp: now,
    });

    // Increment counter
    await ctx.db.patch(user._id, {
      timestampRemovalsCount: user.timestampRemovalsCount + 1,
      updatedAt: now,
    });
  },
});

/**
 * Track multiple usage events at once
 * More efficient than calling individual mutations
 * Creates usage stats entries for each removal type
 */
export const trackUsageBatch = mutation({
  args: {
    totalFiles: v.optional(v.number()),
    gpsRemovals: v.optional(v.number()),
    cameraInfoRemovals: v.optional(v.number()),
    timestampRemovals: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return;
    }

    const clerkId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user || !user.hasAcceptedConsent) {
      return;
    }

    const now = Date.now();

    // Create usage stats entries for each removal type
    if (args.gpsRemovals !== undefined && args.gpsRemovals > 0) {
      for (let i = 0; i < args.gpsRemovals; i++) {
        await ctx.db.insert("usageStats", {
          userId: user._id,
          removalType: "gps",
          timestamp: now,
        });
      }
    }

    if (args.cameraInfoRemovals !== undefined && args.cameraInfoRemovals > 0) {
      for (let i = 0; i < args.cameraInfoRemovals; i++) {
        await ctx.db.insert("usageStats", {
          userId: user._id,
          removalType: "cameraInfo",
          timestamp: now,
        });
      }
    }

    if (args.timestampRemovals !== undefined && args.timestampRemovals > 0) {
      for (let i = 0; i < args.timestampRemovals; i++) {
        await ctx.db.insert("usageStats", {
          userId: user._id,
          removalType: "timestamp",
          timestamp: now,
        });
      }
    }

    // Build update object with only provided values
    const updates: Record<string, any> = {
      updatedAt: now,
    };

    if (args.totalFiles !== undefined) {
      updates.totalFilesProcessed = user.totalFilesProcessed + args.totalFiles;
    }
    if (args.gpsRemovals !== undefined) {
      updates.gpsRemovalsCount = user.gpsRemovalsCount + args.gpsRemovals;
    }
    if (args.cameraInfoRemovals !== undefined) {
      updates.cameraInfoRemovalsCount =
        user.cameraInfoRemovalsCount + args.cameraInfoRemovals;
    }
    if (args.timestampRemovals !== undefined) {
      updates.timestampRemovalsCount =
        user.timestampRemovalsCount + args.timestampRemovals;
    }

    await ctx.db.patch(user._id, updates);
  },
});
