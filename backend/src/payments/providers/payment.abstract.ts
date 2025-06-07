import { UUID } from 'crypto';

export abstract class PaymentAbstract {
  abstract payment(paymentId: UUID): Promise<any>;

  abstract ipn(req: Request): Promise<any>;
}
