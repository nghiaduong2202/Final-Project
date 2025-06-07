import { ArgumentsHost, Catch, UnauthorizedException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(UnauthorizedException)
export class UnauthorizedFilter extends BaseWsExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const error = exception.getResponse();

    super.catch(new WsException(error), host);
  }
}
