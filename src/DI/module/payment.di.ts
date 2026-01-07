import { Container } from "inversify";
import { IPaymentService } from "../../services/interface/IPaymentService";
import TYPES from "../types";
import { PaymentService } from "../../services/implementation/payment.service";

export function paymentModule(container:Container){
    container.bind<IPaymentService>(TYPES.IPaymentService).to(PaymentService)
}