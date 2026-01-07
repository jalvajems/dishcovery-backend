import { inject, injectable } from "inversify";
import { IPaymentService } from "../interface/IPaymentService";
import TYPES from "../../DI/types";

@injectable()
export class PaymentService implements IPaymentService{
    constructor(){}

    async createPaymentIntent(
  bookingId: string,
  userId: string,
  amount: number,
  currency: string
) {
  return {
    intentId: `pi_${Date.now()}`,
  };
}

  async confirmPayment(intentId: string) {
    return;
  }

  async refundPayment(intentId: string) {
    return;
  }


}