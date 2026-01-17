import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Example tables - you can customize these based on your needs
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
});
