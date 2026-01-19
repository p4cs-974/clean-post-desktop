import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Example tables - you can customize these based on your needs
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),

  // Users table for consent and usage tracking
  users: defineTable({
    // Clerk user identifier
    clerkId: v.string(),
    // User profile information
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    // Consent tracking
    hasAcceptedConsent: v.boolean(),
    consentAcceptedAt: v.optional(v.number()), // timestamp
    // Usage counters
    totalFilesProcessed: v.number(),
    gpsRemovalsCount: v.number(),
    cameraInfoRemovalsCount: v.number(),
    timestampRemovalsCount: v.number(),
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Usage stats table for tracking individual removal tasks
  usageStats: defineTable({
    // Reference to user who performed the action
    userId: v.id("users"),
    // Type of metadata removed
    removalType: v.string(), // "gps", "cameraInfo", "timestamp"
    // Timestamp of when the removal occurred
    timestamp: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_timestamp", ["timestamp"]),
});
