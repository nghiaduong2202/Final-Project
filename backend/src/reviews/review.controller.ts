import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation } from '@nestjs/swagger';
import { CreateReviewInterceptor } from './interceptors/create-review.interceptor';
import { CreateReviewDto } from './dtos/requests/create-review.dto';
import { ActivePerson } from 'src/auths/decorators/active-person.decorator';
import { UUID } from 'crypto';
import { ReviewService } from './review.service';
import { AuthRoles } from 'src/auths/decorators/auth-role.decorator';
import { AuthRoleEnum } from 'src/auths/enums/auth-role.enum';
import { UpdateReviewDto } from './dtos/requests/update-review.dto';

@Controller('review')
export class ReviewController {
  constructor(
    /**
     * inject ReviewService
     */
    private readonly reviewService: ReviewService,
  ) {}

  @ApiOperation({
    summary: 'create rating (role: player)',
  })
  @UseInterceptors(FilesInterceptor('images'), CreateReviewInterceptor)
  @Post()
  @AuthRoles(AuthRoleEnum.PLAYER)
  public create(
    @Body() createReviewDto: CreateReviewDto,
    @UploadedFiles() images: Express.Multer.File[],
    @ActivePerson('sub') playerId: UUID,
  ) {
    return this.reviewService.create(createReviewDto, images, playerId);
  }

  // @ApiOperation({
  //   summary: 'delete review (role: player)',
  // })
  // @Delete(':reviewId')
  // @AuthRoles(AuthRoleEnum.PLAYER)
  // public delete(
  //   @Param('reviewId', ParseIntPipe) reviewId: number,
  //   @ActivePerson('sub') playerId: UUID,
  // ) {
  //   return this.reviewService.delete(reviewId, playerId);
  // }

  @ApiOperation({
    summary: 'update reivew by id (role: player)',
  })
  @Put('update-review')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public updateReview(
    @Body() updateReviewDto: UpdateReviewDto,
    @ActivePerson('sub') playerId: UUID,
  ) {
    return this.reviewService.updateReview(updateReviewDto, playerId);
  }

  @ApiOperation({
    summary: 'feedback review of player (role: owner)',
  })
  @Put(':reviewId/feedback')
  @AuthRoles(AuthRoleEnum.OWNER)
  public feedback(
    @Body('feedback') message: string,
    @ActivePerson('sub') ownerId: UUID,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    return this.reviewService.feedback(message, ownerId, reviewId);
  }

  @ApiOperation({
    summary: 'get many review by facility (role: none)',
  })
  @Get('facility/:facilityId')
  @AuthRoles(AuthRoleEnum.NONE)
  public getManyByFacility(
    @Param('facilityId', ParseUUIDPipe) facilityId: UUID,
  ) {
    return this.reviewService.getManyByFacility(facilityId);
  }

  @ApiOperation({
    summary: 'get reviery by id (role: none)',
  })
  @Get(':reviewId')
  @AuthRoles(AuthRoleEnum.NONE)
  public getById(@Param('reviewId', ParseIntPipe) reviewId: number) {
    return this.reviewService.getById(reviewId);
  }
}
