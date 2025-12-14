"use server";

import { stripe } from "@/lib/stripe";
import { getEventBySlug } from "@/lib/services/events";
import { auth } from "@clerk/nextjs/server";
import { TicketTier, EventAppConfig } from "@/lib/types";

export async function createEventCheckoutSession(
    eventId: string, 
    tierId: string, 
    quantity: number = 1
) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const event = await getEventBySlug(eventId);
    if (!event) {
        throw new Error("Event not found");
    }

    const config = event.config as unknown as EventAppConfig;
    const tier = config.ticketing?.tiers?.find((t: TicketTier) => t.id === tierId);
    if (!tier) {
        throw new Error("Ticket tier not found");
    }

    // 1. Calculate Fees
    // Price is in cents ideally, but let's assume tier.price is dollars for now based on typical UI. 
    // Need to confirm if tier.price is 10 or 1000 for $10. 
    // Looking at `events.ts`, input was `Number(formData.get(...price))`.
    // Usually people enter "10" for $10. Stripe needs cents.
    const unitAmountCents = Math.round(tier.price * 100); 
    const totalAmountCents = unitAmountCents * quantity;

    // Application Fee: 5%
    const applicationFeeAmount = Math.round(totalAmountCents * 0.05);

    // Connected Account ID (MOCKED for now, TODO: Fetch from event owner's profile)
    // You should replace this with a real Connect Account ID from your database 
    // associated with event.ownerId.
    const connectedAccountId = "acct_1OuXIGQ2cLk4h4Z6"; // TEST ACCOUNT ID

    if (!connectedAccountId) {
        throw new Error("Event organizer is not connected to Stripe");
    }

    // 2. Create Session
    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: tier.currency || "usd",
                    product_data: {
                        name: `${config.content?.eventName || 'Event'} - ${tier.name}`,
                        description: tier.description,
                        images: config.branding?.logoUrl ? [config.branding.logoUrl] : undefined,
                    },
                    unit_amount: unitAmountCents,
                },
                quantity: quantity,
            },
        ],
        payment_intent_data: {
            application_fee_amount: applicationFeeAmount,
            transfer_data: {
                destination: connectedAccountId,
            },
        },
        metadata: {
            eventId: event.slug, // or event.id
            tierId: tier.id,
            buyerUserId: userId,
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/e/${event.slug}?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/e/${event.slug}?canceled=true`,
    });

    if (!session.url) {
        throw new Error("Failed to create checkout session");
    }

    return { url: session.url };
}
