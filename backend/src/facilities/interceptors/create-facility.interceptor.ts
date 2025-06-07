/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class CreateFacilityInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    try {
      request.body = {
        ...request.body,

        facilityInfo: { ...JSON.parse(request.body.facilityInfo) },
        sportLicenses: { ...JSON.parse(request.body.sportLicenses) },
      };
    } catch (error) {
      throw new BadRequestException('Invalid data', {
        description: String(error),
      });
    }

    return next.handle();
  }
}
