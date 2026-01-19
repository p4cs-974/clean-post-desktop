import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/backend";

const http = httpRouter();

http.route({
  path: "/ping",
  method: "GET",
  handler: httpAction(async () => {
    return new Response("pong", {
      status: 200,
    });
  }),
});

/**
 * Clerk Webhook Handler
 * Handles user creation events from Clerk
 */
const clerkWebhook = httpAction(async (ctx, request) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return new Response("Error occurred -- no webhook secret", {
      status: 500,
    });
  }

  // Get Svix headers
  const svix_id = request.headers.get("svix-id");
  const svix_signature = request.headers.get("svix-signature");
  const svix_timestamp = request.headers.get("svix-timestamp");

  if (!svix_id || !svix_signature || !svix_timestamp) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get payload
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Verify webhook
  const wh = new Webhook(webhookSecret);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred -- invalid signature", { status: 400 });
  }

  const eventType = evt.type;

  // Handle user creation
  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Get primary email
    const email = email_addresses[0]?.email_address;

    // Build name from first and last name
    const name = `${first_name || ""} ${last_name || ""}`.trim() || email || "User";

    try {
      await ctx.runMutation(api.users.createUserFromWebhook, {
        clerkId: id,
        email,
        name,
        imageUrl: image_url,
      });

      console.log(`Successfully ${eventType === "user.created" ? "created" : "updated"} user: ${id}`);
    } catch (error) {
      console.error(`Error ${eventType === "user.created" ? "creating" : "updating"} user:`, error);
      return new Response(`Error ${eventType === "user.created" ? "creating" : "updating"} user`, { status: 500 });
    }
  }

  return new Response("Webhook processed successfully", { status: 200 });
});

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: clerkWebhook,
});

export default http;
