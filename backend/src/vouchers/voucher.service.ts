import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IVoucherService } from './ivoucher.service';
import { UUID } from 'crypto';
import { CreateVoucherDto } from './dtos/requests/create-voucher.dto';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Voucher } from './voucher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FacilityService } from 'src/facilities/facility.service';
import { VoucherTypeEnum } from './enums/voucher-type.enum';
import { UpdateVoucherDto } from './dtos/requests/update-voucher.dto';

@Injectable()
export class VoucherService implements IVoucherService {
  constructor(
    /**
     * inject VoucherRepository
     */
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    /**
     * inject FacilityService
     */
    private readonly facilityService: FacilityService,
  ) {}
  public async create(
    createVoucherDto: CreateVoucherDto,
    facilityId: UUID,
    ownerId: UUID,
  ): Promise<{ message: string }> {
    /**
     * assign maxDiscount equal discount when voucherType is CASH
     */
    if (createVoucherDto.voucherType === VoucherTypeEnum.CASH) {
      createVoucherDto.maxDiscount = createVoucherDto.discount;
    }

    const facility = await this.facilityService.findOneByIdAndOwnerId(
      facilityId,
      ownerId,
    );

    try {
      const voucher = this.voucherRepository.create({
        ...createVoucherDto,
        facility,
        remain: createVoucherDto.amount,
      });

      await this.voucherRepository.save(voucher);
    } catch {
      throw new BadRequestException(
        'An error occurred when create the voucher',
      );
    }

    return {
      message: 'Create voucher successful',
    };
  }

  public async delete(
    voucherId: number,
    ownerId: UUID,
  ): Promise<{ message: string }> {
    const voucher = await this.findOneByIdAndOwner(voucherId, ownerId);

    try {
      await this.voucherRepository.remove(voucher);
    } catch {
      throw new BadRequestException(
        'An error occurred when delete the voucher',
      );
    }

    return {
      message: 'Delete voucher successful',
    };
  }

  public async findOneByIdAndOwner(
    voucherId: number,
    ownerId: UUID,
  ): Promise<Voucher> {
    return this.voucherRepository
      .findOneOrFail({
        where: {
          id: voucherId,
          facility: {
            owner: {
              id: ownerId,
            },
          },
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the voucher');
      });
  }

  public async update(
    updateVoucherDto: UpdateVoucherDto,
    ownerId: UUID,
  ): Promise<{ message: string }> {
    const voucher = await this.findOneByIdAndOwner(
      updateVoucherDto.id,
      ownerId,
    );

    if (updateVoucherDto.name) voucher.name = updateVoucherDto.name;

    if (updateVoucherDto.voucherType)
      voucher.voucherType = updateVoucherDto.voucherType;

    if (updateVoucherDto.amount) {
      const remain = voucher.remain + updateVoucherDto.amount - voucher.amount;
      voucher.amount = updateVoucherDto.amount;
      voucher.remain = remain;
    }

    if (updateVoucherDto.startDate)
      voucher.startDate = updateVoucherDto.startDate;

    if (updateVoucherDto.endDate) voucher.endDate = updateVoucherDto.endDate;

    if (updateVoucherDto.discount) voucher.discount = updateVoucherDto.discount;

    if (updateVoucherDto.minPrice) voucher.minPrice = updateVoucherDto.minPrice;

    if (updateVoucherDto.maxDiscount)
      voucher.maxDiscount = updateVoucherDto.maxDiscount;

    try {
      await this.voucherRepository.save(voucher);
    } catch {
      throw new BadRequestException('An error occurrd when update the voucher');
    }

    return {
      message: 'Update voucher successful',
    };
  }

  public async getByFacility(facilityId: UUID): Promise<Voucher[]> {
    return await this.voucherRepository.find({
      where: {
        facility: {
          id: facilityId,
        },
      },
      order: {
        endDate: 'DESC',
      },
    });
  }

  public async findOneById(
    voucherId: number,
    relations?: string[],
  ): Promise<Voucher> {
    return this.voucherRepository
      .findOneOrFail({
        relations,
        where: {
          id: voucherId,
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the voucher');
      });
  }

  public async getSixVouchers(): Promise<Voucher[]> {
    const now = new Date();

    const sixVouchers = await this.voucherRepository.find({
      relations: {
        facility: true,
      },
      where: {
        endDate: MoreThanOrEqual(now),
      },
      order: {
        startDate: 'ASC',
      },
      take: 6,
    });

    return sixVouchers;
  }
}
