import { UUID } from 'crypto';
import { CreateVoucherDto } from './dtos/requests/create-voucher.dto';
import { Voucher } from './voucher.entity';
import { UpdateVoucherDto } from './dtos/requests/update-voucher.dto';

export interface IVoucherService {
  create(
    createVoucherDto: CreateVoucherDto,
    facilityId: UUID,
    ownerId: UUID,
  ): Promise<{ message: string }>;

  delete(voucherId: number, ownerId: UUID): Promise<{ message: string }>;

  findOneByIdAndOwner(voucherId: number, ownerId: UUID): Promise<Voucher>;

  update(
    updateVoucherDto: UpdateVoucherDto,
    ownerId: UUID,
  ): Promise<{ message: string }>;

  getByFacility(facilityId: UUID): Promise<Voucher[]>;

  findOneById(voucherId: number, relations?: string[]): Promise<Voucher>;

  getSixVouchers(): Promise<Voucher[]>;
}
