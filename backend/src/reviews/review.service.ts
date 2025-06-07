import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IReviewService } from './ireview.service';
import { UUID } from 'crypto';
import { CreateReviewDto } from './dtos/requests/create-review.dto';
import { Review } from './review.entity';
import { BookingService } from 'src/bookings/booking.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudUploaderService } from 'src/cloud-uploader/cloud-uploader.service';
import { FacilityService } from 'src/facilities/facility.service';
import { UpdateReviewDto } from './dtos/requests/update-review.dto';
import { BookingStatusEnum } from 'src/bookings/enums/booking-status.enum';

@Injectable()
export class ReviewService implements IReviewService {
  constructor(
    /**
     * inject BookingService
     */
    private readonly bookingService: BookingService,
    /**
     * inject ReviewRepository
     */
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    /**
     * inject CloudUploadService
     */
    private readonly cloudUploadService: CloudUploaderService,
    /**
     * inject FacilityService
     */
    private readonly facilityService: FacilityService,
  ) {}

  public async create(
    createReviewDto: CreateReviewDto,
    images: Express.Multer.File[],
    playerId: UUID,
  ): Promise<{ message: string }> {
    const booking = await this.bookingService.findOneByIdAndPlayer(
      createReviewDto.bookingId,
      playerId,
      ['bookingSlots.field', 'review', 'payment'],
    );

    if (booking.status !== BookingStatusEnum.COMPLETED) {
      throw new BadRequestException('The booking must be completed');
    }

    let isAccept = false;

    for (const bookingSlot of booking.bookingSlots) {
      const bookingDate = new Date(
        bookingSlot.date.toISOString().split('T')[0] + ' ' + booking.startTime,
      );
      if (bookingDate < new Date(new Date().toString())) {
        isAccept = true;

        break;
      }
    }

    if (!isAccept) {
      throw new BadRequestException('You cannot submit a review yet');
    }

    if (booking.review !== null) {
      throw new BadRequestException('You have reviewed this booking yet');
    }

    const imageUrl: string[] = [];
    for (const image of images) {
      if (!image.mimetype.includes('image')) {
        throw new BadRequestException('You only submit an image type');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { secure_url } = await this.cloudUploadService.upload(image);

      imageUrl.push(String(secure_url));
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      imageUrl,
      booking,
    });

    try {
      await this.reviewRepository.save(review);

      await this.facilityService.addRating(
        booking.bookingSlots[0].field.id,
        createReviewDto.rating,
      );
    } catch {
      throw new BadRequestException('An error occurred when create review');
    }

    return {
      message: 'create review successful',
    };
  }

  public async delete(
    reviewId: number,
    playerId: UUID,
  ): Promise<{ message: string }> {
    const review = await this.reviewRepository
      .findOneOrFail({
        where: {
          id: reviewId,
          booking: {
            player: {
              id: playerId,
            },
          },
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the reivew');
      });

    try {
      await this.reviewRepository.remove(review);
    } catch {
      throw new BadRequestException('An error occurred when delete review');
    }

    return {
      message: 'Delete review successful',
    };
  }

  public async feedback(
    message: string,
    ownerId: UUID,
    reviewId: number,
  ): Promise<{ message: string }> {
    const review = await this.reviewRepository
      .findOneOrFail({
        where: {
          id: reviewId,
          booking: {
            bookingSlots: {
              field: {
                fieldGroup: {
                  facility: {
                    owner: {
                      id: ownerId,
                    },
                  },
                },
              },
            },
          },
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the review');
      });

    review.feedback = message;

    try {
      await this.reviewRepository.save(review);
    } catch {
      throw new BadRequestException('An error occurred when feedback');
    }

    return {
      message: 'Feedback review successful',
    };
  }

  public async getManyByFacility(facilityId: UUID): Promise<Review[]> {
    return await this.reviewRepository.find({
      relations: {
        booking: {
          bookingSlots: true,
          additionalServices: true,
          player: true,
        },
      },
      where: {
        booking: {
          bookingSlots: {
            field: {
              fieldGroup: {
                facility: {
                  id: facilityId,
                },
              },
            },
          },
        },
      },
    });
  }

  public async getById(reviewId: number): Promise<Review> {
    return this.reviewRepository
      .findOneOrFail({
        relations: {
          booking: {
            bookingSlots: {
              field: true,
            },
            additionalServices: {
              service: true,
            },
          },
        },
        where: {
          id: reviewId,
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the review');
      });
  }

  public async updateReview(
    updateReviewDto: UpdateReviewDto,
    playerId: UUID,
  ): Promise<{ message: string }> {
    const review = await this.reviewRepository
      .findOneOrFail({
        where: {
          id: updateReviewDto.reviewId,
          booking: {
            player: {
              id: playerId,
            },
          },
        },
      })
      .catch(() => {
        throw new BadRequestException('Not found the review');
      });

    if (review.feedback) {
      throw new BadRequestException('The review has been feedbacked');
    }

    if (updateReviewDto.rating) review.rating = updateReviewDto.rating;

    if (updateReviewDto.comment) review.comment = updateReviewDto.comment;

    review.imageUrl = updateReviewDto.imageUrl;

    try {
      await this.reviewRepository.save(review);
    } catch {
      throw new BadRequestException('An error occurred when update reivew');
    }

    return {
      message: 'Update review successful',
    };
  }
}
