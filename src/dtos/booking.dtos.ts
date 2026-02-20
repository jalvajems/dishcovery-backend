export interface IStripeWebhookPayload {
    id: string;
    object: string;
    api_version: string;
    created: number;
    data: {
        object: any; // Stripe objects can be complex, keeping as any for flexibility or typing properly if Stripe types available
    };
    livemode: boolean;
    pending_webhooks: number;
    request: {
        id: string;
        idempotency_key: string;
    };
    type: string;
}
