# Usage Stats Tracking Implementation

## Summary

Added a new `usageStats` table to track individual metadata removal tasks with user association. Each removal operation now creates a record that links to the user who performed it.

## What Was Added

### New Table: `usageStats`

**Schema:**
```typescript
usageStats: defineTable({
  // Reference to user who performed the action
  userId: v.id("users"),
  // Type of metadata removed
  removalType: v.string(), // "gps", "cameraInfo", "timestamp"
  // Timestamp of when the removal occurred
  timestamp: v.number(),
})
  .index("by_user_id", ["userId"])
  .index("by_timestamp", ["timestamp"])
```

**Purpose:**
- Track each individual removal operation
- Associate removals with specific users
- Enable analytics and audit trails
- Allow querying removal history by user or time

## Updated Mutations

### 1. `trackGPSRemoval`
- **Before**: Only incremented counter on user record
- **After**: Creates usage stats entry + increments counter

### 2. `trackCameraInfoRemoval`
- **Before**: Only incremented counter on user record
- **After**: Creates usage stats entry + increments counter

### 3. `trackTimestampRemoval`
- **Before**: Only incremented counter on user record
- **After**: Creates usage stats entry + increments counter

### 4. `trackUsageBatch`
- **Before**: Only incremented counters on user record
- **After**: Creates multiple usage stats entries + increments counters

## Example Records

When a user processes a file with GPS and EXIF removal, the following records are created:

**users table:**
```json
{
  "_id": "12345",
  "clerkId": "user_abc123",
  "email": "user@example.com",
  "totalFilesProcessed": 1,
  "gpsRemovalsCount": 1,
  "cameraInfoRemovalsCount": 1,
  "timestampRemovalsCount": 0
}
```

**usageStats table:**
```json
[
  {
    "_id": "stat_1",
    "userId": "12345",
    "removalType": "gps",
    "timestamp": 1705687200000
  },
  {
    "_id": "stat_2",
    "userId": "12345",
    "removalType": "cameraInfo",
    "timestamp": 1705687200000
  }
]
```

## Query Examples

### Get all removals for a specific user

```typescript
import { query } from "./_generated/server";

export const getUserRemovals = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("usageStats")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    return stats;
  },
});
```

### Get removals by type

```typescript
import { query } from "./_generated/server";

export const getRemovalsByType = query({
  args: { userId: v.id("users"), removalType: v.string() },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("usageStats")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("removalType"), args.removalType))
      .collect();

    return stats;
  },
});
```

### Get recent removals across all users

```typescript
import { query } from "./_generated/server";

export const getRecentRemovals = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("usageStats")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit ?? 100);

    // Enrich with user data
    const enriched = await Promise.all(
      stats.map(async (stat) => {
        const user = await ctx.db.get(stat.userId);
        return {
          ...stat,
          user: {
            email: user?.email,
            name: user?.name,
          },
        };
      })
    );

    return enriched;
  },
});
```

## Benefits

✅ **Audit Trail**: Complete history of all removal operations
✅ **User Association**: Each removal is linked to the user who performed it
✅ **Analytics**: Enable per-user and aggregate statistics
✅ **Debugging**: Track down issues with specific user operations
✅ **Compliance**: Maintain records for data processing compliance

## Data Flow

```
User processes file
    ↓
File processed with GPS + EXIF removal
    ↓
App calls trackUsageBatch({
  gpsRemovals: 1,
  cameraInfoRemovals: 1
})
    ↓
Mutation:
  1. Creates 2 usageStats entries
     - Entry 1: userId, removalType: "gps", timestamp
     - Entry 2: userId, removalType: "cameraInfo", timestamp
  2. Increments user counters
     - gpsRemovalsCount + 1
     - cameraInfoRemovalsCount + 1
```

## Migration Notes

### Existing Data

The `usageStats` table is new, so existing data won't have usage stats entries. The user counters will still be accurate.

### Backfill (Optional)

If you want to backfill usage stats for historical data:

```typescript
// Run once in Convex dashboard or as a migration
import { mutation } from "./_generated/server";

export const backfillUsageStats = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      // Create GPS removal entries
      for (let i = 0; i < user.gpsRemovalsCount; i++) {
        await ctx.db.insert("usageStats", {
          userId: user._id,
          removalType: "gps",
          timestamp: user.createdAt, // Approximate
        });
      }

      // Create camera info removal entries
      for (let i = 0; i < user.cameraInfoRemovalsCount; i++) {
        await ctx.db.insert("usageStats", {
          userId: user._id,
          removalType: "cameraInfo",
          timestamp: user.createdAt,
        });
      }

      // Create timestamp removal entries
      for (let i = 0; i < user.timestampRemovalsCount; i++) {
        await ctx.db.insert("usageStats", {
          userId: user._id,
          removalType: "timestamp",
          timestamp: user.createdAt,
        });
      }
    }
  },
});
```

## Files Modified

```
convex/
├── schema.ts    # Added usageStats table
└── usage.ts     # Updated all tracking mutations to create usageStats entries
```

## Next Steps

1. **Deploy schema changes**:
   ```bash
   bunx convex deploy
   ```

2. **Verify in dashboard**:
   ```bash
   bunx convex dashboard
   ```
   Navigate to "Usage Stats" table to see entries being created

3. **Optional: Add queries** for frontend usage stats display
4. **Optional: Backfill** historical data if needed

## Performance Considerations

- **Indexing**: Both `userId` and `timestamp` are indexed for efficient queries
- **Batch Operations**: The batch mutation handles multiple inserts efficiently
- **Storage**: Each removal operation creates one record. Monitor storage usage in production.

## Future Enhancements

Possible additions to the `usageStats` schema:

```typescript
usageStats: defineTable({
  userId: v.id("users"),
  removalType: v.string(),
  timestamp: v.number(),

  // Optional: Additional context
  fileName: v.optional(v.string()),      // Name of file processed
  fileSize: v.optional(v.number()),       // Size in bytes
  fileType: v.optional(v.string()),       // "image" or "video"
  processingTime: v.optional(v.number()), // Time taken to process
})
```

This would enable even more detailed analytics and debugging.
