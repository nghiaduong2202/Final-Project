import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IServiceService } from './iservice.service';
import { UUID } from 'crypto';
import { CreateManyServicesDto } from './dtos/requests/create-many-services.dto';
import {
  DataSource,
  EntityManager,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { FacilityService } from 'src/facilities/facility.service';
import { Facility } from 'src/facilities/facility.entity';
import { CreateServiceDto } from './dtos/requests/create-service.dto';
import { Service } from './service.entity';
import { SportService } from 'src/sports/sport.service';
import { FacilityStatusEnum } from 'src/facilities/enums/facility-status.enum';
import { LicenseService } from 'src/licenses/license.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateServiceDto } from './dtos/requests/update-service.dto';
import { BookingService } from 'src/bookings/booking.service';
import { AdditionalServiceService } from 'src/additional-services/additional-service.service';
import { GetAvailableServiceInFacilityResponseDto } from './dtos/responses/get-available-service-in-facility-response.dto.ts';

@Injectable()
export class ServiceService implements IServiceService {
  constructor(
    /**
     * inject DataSource
     */
    private readonly dataSource: DataSource,
    /**
     * inject FacilityService
     */
    private readonly facilityService: FacilityService,
    /**
     * inject SportService
     */
    private readonly sportService: SportService,
    /**
     * inject LicenseServicce
     */
    private readonly licenseService: LicenseService,
    /**
     * inject ServiceRepository
     */
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    /**
     * inject BookingService
     */
    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,
    /**
     * inject AdditionalServiceService
     */
    private readonly additionalServiceService: AdditionalServiceService,
  ) {}

  public async createMany(
    createManyServicesDto: CreateManyServicesDto,
    ownerId: UUID,
  ): Promise<{ message: string }> {
    const facility = await this.facilityService.findOneByIdAndOwnerId(
      createManyServicesDto.facilityId,
      ownerId,
    );

    if (facility.status !== FacilityStatusEnum.ACTIVE) {
      throw new BadRequestException('The facility must be active');
    }

    await this.dataSource.transaction(async (manager) => {
      for (const service of createManyServicesDto.services) {
        await this.createWithTransaction(service, facility, manager);
      }
    });

    return {
      message: 'Create many services successful',
    };
  }

  public async createWithTransaction(
    createServiceDto: CreateServiceDto,
    facility: Facility,
    manager: EntityManager,
  ): Promise<Service> {
    const sport = await this.sportService.findOneByIdWithTransaction(
      createServiceDto.sportId,
      manager,
    );

    // facility must be active
    if (facility.status !== FacilityStatusEnum.ACTIVE) {
      throw new BadRequestException(
        `The facility ${facility.name} must be active`,
      );
    }

    // facility must license for this sport
    const license = await this.licenseService.findOneByIdWithTransaction(
      facility.id,
      createServiceDto.sportId,
      manager,
    );

    // license must be verified
    if (!license.verified) {
      throw new BadRequestException(
        "The license for this sport hasn't been verified yet.",
      );
    }

    const service = manager.create(Service, {
      ...createServiceDto,
      sport,
      facility,
    });

    return await manager.save(service);
  }

  public async findOneByIdAndOwner(
    serviceId: number,
    ownerId: UUID,
    relations?: string[],
  ): Promise<Service> {
    return await this.serviceRepository
      .findOneOrFail({
        where: {
          id: serviceId,
          facility: {
            owner: {
              id: ownerId,
            },
          },
        },
        relations,
      })
      .catch(() => {
        throw new NotFoundException('Not found the service');
      });
  }

  public async update(
    updateServiceDto: UpdateServiceDto,
    serviceId: number,
    ownerId: UUID,
  ): Promise<{ message: string }> {
    const service = await this.findOneByIdAndOwner(serviceId, ownerId, [
      'facility',
    ]);

    if (updateServiceDto.name) service.name = updateServiceDto.name;
    if (updateServiceDto.amount) service.amount = updateServiceDto.amount;
    if (updateServiceDto.description)
      service.description = updateServiceDto.description;
    if (updateServiceDto.price) service.price = updateServiceDto.price;

    if (updateServiceDto.unit) service.unit = updateServiceDto.unit;

    try {
      await this.serviceRepository.save(service);
    } catch {
      throw new BadRequestException('An error occurred when update service');
    }

    return {
      message: 'Update service successful',
    };
  }

  public async delete(
    serviceId: number,
    ownerId: UUID,
  ): Promise<{ message: string }> {
    const now = new Date();

    const service = await this.serviceRepository.findOne({
      where: {
        id: serviceId,
        facility: {
          owner: {
            id: ownerId,
          },
        },
        additionalServices: {
          booking: {
            bookingSlots: {
              date: MoreThanOrEqual(now),
            },
          },
        },
      },
    });

    if (service) {
      throw new BadRequestException(
        'The service have many booking in the future',
      );
    }
    // must be check booking before delete, later

    try {
      await this.serviceRepository.delete(serviceId);
    } catch {
      throw new BadRequestException(
        'An error occurred when delete the service',
      );
    }

    return {
      message: 'Delete service successful',
    };
  }

  public async getByFacility(facilityId: UUID): Promise<any[]> {
    const services = await this.serviceRepository.find({
      where: {
        facility: {
          id: facilityId,
        },
      },
      relations: {
        sport: true,
        // additionalServices: {
        //   booking: {
        //     bookingSlots: true,
        //   },
        // },
      },
      order: {
        name: 'DESC',
      },
    });

    // const now = new Date(new Date().toString().split('T')[0]);

    // return services.map(({ additionalServices, ...service }) => ({
    //   ...service,
    //   bookedCountOnDate: additionalServices.filter((additionalService) =>
    //     additionalService.booking.bookingSlots
    //       .flat()
    //       .filter((bookingSlot) => bookingSlot.date === now),
    //   ).length,
    // }));

    return services.map((service) => ({
      ...service,
      bookedCount: 0,
    }));
  }

  public async findOneByIdWithTransaction(
    serviceId: number,
    manager: EntityManager,
    relations?: string[],
  ): Promise<Service> {
    return await manager
      .findOneOrFail(Service, {
        relations,
        where: {
          id: serviceId,
        },
      })
      .catch(() => {
        throw new NotFoundException(`Not found service by id: ${serviceId}`);
      });
  }

  public async getAvailableServiceInFacility(
    facilityId: UUID,
    bookingId: UUID,
  ): Promise<any> {
    const booking = await this.bookingService.findOneById(bookingId, [
      'sport',
      'bookingSlots',
    ]);

    const services = await this.serviceRepository.find({
      where: {
        facility: {
          id: facilityId,
        },
        sport: {
          id: booking.sport.id,
        },
      },
    });

    const dates = booking.bookingSlots.map((bookingSlot) => bookingSlot.date);

    const result: GetAvailableServiceInFacilityResponseDto[] = [];

    for (const service of services) {
      const quantity: number[] = [];

      for (const date of dates) {
        const rentedAdditionalService =
          await this.additionalServiceService.findManyByServiceIdAndDate(
            service.id,
            date,
            booking.startTime,
            booking.endTime,
          );

        quantity.push(
          service.amount -
            rentedAdditionalService.reduce(
              (prev, curr) => prev + curr.quantity,
              0,
            ),
        );
      }

      result.push({
        ...service,
        remain: Math.min(...quantity),
      } as GetAvailableServiceInFacilityResponseDto);
    }

    return result;
  }

  public async addBookedCount(bookingId: UUID): Promise<any> {
    const booking = await this.bookingService.findOneById(bookingId, [
      'bookingSlots',
      'additionalServices.service',
    ]);

    const time = booking.bookingSlots.length;

    for (const additionalService of booking.additionalServices) {
      const service = additionalService.service;
      service.bookedCount += additionalService.quantity * time;

      await this.serviceRepository.save(service);
    }
  }
}
