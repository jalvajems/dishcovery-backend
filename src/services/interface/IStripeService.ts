import Stripe from 'stripe';

export interface IStripeService {
    createPaymentIntent(amount: number, metadata: Record<string, string>): Promise<Stripe.PaymentIntent>;
    constructEvent(payload: string | Buffer, header: string | string[], secret: string): Stripe.Event;
    createRefund(paymentIntentId: string): Promise<Stripe.Refund>;
}
