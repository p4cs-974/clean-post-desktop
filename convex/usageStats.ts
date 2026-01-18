import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Mutation to record a usage stat when a file is cleaned up
export const recordUsage = mutation({
  args: {
    fileName: v.string(),
    fileType: v.string(),
    mediaType: v.string(),
    fileSize: v.number(),
    processedSize: v.number(),
    hadExif: v.boolean(),
    hadGPS: v.boolean(),
    hadTimestamps: v.boolean(),
    privacyRiskScore: v.optional(v.number()),
    removedExif: v.boolean(),
    removedGPS: v.boolean(),
    removedTimestamps: v.boolean(),
    status: v.string(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const usageId = await ctx.db.insert("usageStats", {
      ...args,
      processedAt: Date.now(),
    });
    return usageId;
  },
});

// Query to get all usage stats
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("usageStats").collect();
  },
});

// Query to get usage stats by media type
export const getByMediaType = query({
  args: {
    mediaType: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("usageStats")
      .withIndex("by_mediaType", (q) => q.eq("mediaType", args.mediaType))
      .collect();
  },
});

// Query to get usage stats by status
export const getByStatus = query({
  args: {
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("usageStats")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Query to get recent usage stats (last N records)
export const getRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("usageStats")
      .withIndex("by_processedAt")
      .order("desc")
      .take(args.limit ?? 100);
    return stats;
  },
});

// Query to get aggregated statistics
export const getAggregatedStats = query({
  args: {},
  handler: async (ctx) => {
    const allStats = await ctx.db.query("usageStats").collect();

    const totalFiles = allStats.length;
    const completedFiles = allStats.filter((s) => s.status === "completed").length;
    const errorFiles = allStats.filter((s) => s.status === "error").length;

    const imageCount = allStats.filter((s) => s.mediaType === "image").length;
    const videoCount = allStats.filter((s) => s.mediaType === "video").length;

    const filesWithExif = allStats.filter((s) => s.hadExif).length;
    const filesWithGPS = allStats.filter((s) => s.hadGPS).length;
    const filesWithTimestamps = allStats.filter((s) => s.hadTimestamps).length;

    const removedExifCount = allStats.filter((s) => s.removedExif).length;
    const removedGPSCount = allStats.filter((s) => s.removedGPS).length;
    const removedTimestampsCount = allStats.filter((s) => s.removedTimestamps).length;

    const totalOriginalSize = allStats.reduce((sum, s) => sum + s.fileSize, 0);
    const totalProcessedSize = allStats.reduce((sum, s) => sum + s.processedSize, 0);
    const bytesSaved = totalOriginalSize - totalProcessedSize;

    return {
      totalFiles,
      completedFiles,
      errorFiles,
      imageCount,
      videoCount,
      filesWithExif,
      filesWithGPS,
      filesWithTimestamps,
      removedExifCount,
      removedGPSCount,
      removedTimestampsCount,
      totalOriginalSize,
      totalProcessedSize,
      bytesSaved,
      avgPrivacyRiskScore:
        allStats
          .filter((s) => s.privacyRiskScore !== undefined)
          .reduce((sum, s, _, arr) => sum + (s.privacyRiskScore ?? 0), 0) /
        allStats.filter((s) => s.privacyRiskScore !== undefined).length || 0,
    };
  },
});
