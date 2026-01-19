import { injectable } from 'inversify';
import Stripe from 'stripe';
import { IStripeService } from '../interface/IStripeService';
import { stripe } from '../../config/stripe.config';

@injectable()
export class StripeService implements IStripeService {
    async createPaymentIntent(amount: number, metadata: Record<string, string>): Promise<Stripe.PaymentIntent> {
        return await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // convert to cents/paise
            currency: 'inr',
            metadata,
            payment_method_types: ['card'],
        });
    }

    constructEvent(payload: string | Buffer, header: string | string[], secret: string): Stripe.Event {
        return stripe.webhooks.constructEvent(payload, header as string, secret);
    }
}
