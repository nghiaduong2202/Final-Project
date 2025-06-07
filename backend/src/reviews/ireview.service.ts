import { UUID } from 'crypto';
import { CreateReviewDto } from './dtos/requests/create-review.dto';
import { Review } from './review.entity';
import { UpdateReviewDto } from './dtos/requests/update-review.dto';

export interface IReviewService {
  create(
    createReviewDto: CreateReviewDto,
    images: Express.Multer.File[],
    playerId: UUID,
  ): Promise<{ message: string }>;

  delete(reviewId: number, playerId: UUID): Promise<{ message: string }>;

  feedback(
    message: string,
    ownerId: UUID,
    reviewId: number,
  ): Promise<{ message: string }>;

  getManyByFacility(facilityId: UUID): Promise<Review[]>;

  getById(reviewId: number): Promise<Review>;

  updateReview(
    updateReviewDto: UpdateReviewDto,
    playerId: UUID,
  ): Promise<{ message: string }>;
}
