export interface IPaymentService{
    createPaymentIntent(
    bookingId: string,
    userId: string,
    amount: number,
    currency: string
  ): Promise<{ intentId: string }>;

  confirmPayment(intentId: string): Promise<void>;
  refundPayment(intentId: string): Promise<void>;
}