import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Example tables - you can customize these based on your needs
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),

  // Metadata removal usage statistics
  usageStats: defineTable({
    // File information
    fileName: v.string(),
    fileType: v.string(), // MIME type (e.g., 'image/jpeg', 'video/mp4')
    mediaType: v.string(), // 'image' or 'video'
    fileSize: v.number(), // Original file size in bytes
    processedSize: v.number(), // Processed file size in bytes

    // Metadata detection results
    hadExif: v.boolean(),
    hadGPS: v.boolean(),
    hadTimestamps: v.boolean(),
    privacyRiskScore: v.optional(v.number()), // 1-10 score

    // Removal options applied
    removedExif: v.boolean(),
    removedGPS: v.boolean(),
    removedTimestamps: v.boolean(),

    // Processing result
    status: v.string(), // 'completed' or 'error'
    errorMessage: v.optional(v.string()),

    // Timestamp
    processedAt: v.number(), // Unix timestamp in milliseconds
  })
    .index("by_processedAt", ["processedAt"])
    .index("by_mediaType", ["mediaType"])
    .index("by_status", ["status"]),
});
