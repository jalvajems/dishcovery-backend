export interface IStripeWebhookPayload {
    id: string;
    object: string;
    api_version: string;
    created: number;
    data: {
        object: unknown; // Stripe objects can be complex, keeping as unknown for flexibility
    };
    livemode: boolean;
    pending_webhooks: number;
    request: {
        id: string;
        idempotency_key: string;
    };
    type: string;
}
