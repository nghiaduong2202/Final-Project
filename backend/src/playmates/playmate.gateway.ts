import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { BadRequestFilter } from 'src/chats/filters/bad-request.filter';
import { Playmate } from './entities/playmate.entity';

@WebSocketGateway({
  namespace: 'ws/playmate',
  cors: {
    origin: '*', // Allows all origins
    methods: ['GET', 'POST'],
    credentials: true, 
  },
})
@UseFilters(BadRequestFilter)
@UsePipes(new ValidationPipe())
export class PlaymateGateway {
  @WebSocketServer()
  server: Server;

  public emitNewPlaymante(playmate: Playmate) {
    this.server.emit('new-playmate', playmate);
  }

  public emitUpdatePlaymate(playmate: Playmate) {
    this.server.emit('update-playmate', playmate);
  }
}
