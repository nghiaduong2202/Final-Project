import { ArgumentsHost, BadRequestException, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(BadRequestException)
export class BadRequestFilter extends BaseWsExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const error = exception.getResponse();

    super.catch(new WsException(error), host);
  }
}
