import {
  forwardRef,
  Inject,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { BadRequestFilter } from './filters/bad-request.filter';
import { UnauthorizedFilter } from './filters/unauthorized.filter';
import { Server, Socket } from 'socket.io';
import { UUID } from 'crypto';
import { AuthService } from 'src/auths/auth.service';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dtos/send-message.dto';
import { SendImagesDto } from './dtos/send-images.dto';
import { SeenMessageDto } from './dtos/seen-message.dto';
import { Conversation } from './entities/conversation.entity';
import { Participant } from './entities/participant.entity';

@WebSocketGateway({
  namespace: 'ws/message',
  cors: {
    origin: [
      'https://capstoneprojectclient.vercel.app',
      'https://capstoneprojectadmin.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    credentials: true,
  },
})
@UseFilters(BadRequestFilter, UnauthorizedFilter)
@UsePipes(new ValidationPipe())
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  connectedUsers: Map<string, UUID> = new Map<string, UUID>();

  constructor(
    /**
     * inject AuthService
     */
    private readonly authService: AuthService,
    /**
     * inject ChatService
     */
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server) {
    console.log('Socket server start');
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authorization!;

    try {
      const payload = await this.authService.verifyAccessToken(token);

      this.connectedUsers.set(client.id, payload.sub);

      this.emitConnectedUsers();

      const conversations = await this.chatService.getInfoConversation(
        payload.sub,
      );

      for (const conversation of conversations) {
        await client.join(conversation.id);
      }
    } catch (error) {
      this.emitException(client, String(error));

      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);

    this.emitConnectedUsers();
  }

  emitConnectedUsers() {
    const result = new Set(this.connectedUsers.values());

    this.server.emit('connected-users', Array.from(result));
  }

  emitException(client: Socket, error: string) {
    client.emit('exception', error);
  }

  @SubscribeMessage('send-message')
  async onSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() sendMessageDto: SendMessageDto,
  ) {
    const personId = this.connectedUsers.get(client.id)!;

    try {
      const message = await this.chatService.sendMessage(
        sendMessageDto,
        personId,
      );

      this.server
        .to(sendMessageDto.conversationId)
        .emit('receive-message', message);
    } catch (error) {
      this.emitException(client, String(error));
    }
  }

  @SubscribeMessage('send-images')
  async onSendImages(
    @ConnectedSocket() client: Socket,
    @MessageBody() sendImagesDto: SendImagesDto,
  ) {
    const personId = this.connectedUsers.get(client.id)!;

    try {
      const message = await this.chatService.sendImages(
        sendImagesDto,
        personId,
      );

      this.server
        .to(sendImagesDto.conversationId)
        .emit('receive-message', message);
    } catch (error) {
      this.emitException(client, String(error));
    }
  }

  @SubscribeMessage('seen-message')
  async onSeenMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() seenMessageDto: SeenMessageDto,
  ) {
    const personId = this.connectedUsers.get(client.id)!;

    try {
      const participant = await this.chatService.seenMessage(
        seenMessageDto,
        personId,
      );

      this.server
        .to(seenMessageDto.conversationId)
        .emit('seen-message', participant);
    } catch (error) {
      this.emitException(client, String(error));
    }
  }

  emitJoinConversation(conversation: Conversation) {
    for (const participant of conversation.participants) {
      const socketId = [...this.connectedUsers.entries()].filter(
        ([, value]) => value === participant.personId,
      );

      if (socketId.length > 0) {
        this.server.to(socketId[0][0]).socketsJoin(conversation.id);
      }
    }

    this.server.to(conversation.id).emit('join-conversation', conversation);
  }

  emitAddPerson(conversation: Conversation, participant: Participant) {
    this.server.to(conversation.id).emit('add-person-notificate', participant);

    const socketId = [...this.connectedUsers.entries()].filter(
      ([, value]) => value === participant.personId,
    );

    if (socketId.length > 0) {
      this.server.to(socketId[0][0]).socketsJoin(conversation.id);

      this.server.to(socketId[0][0]).emit('add-person', conversation);
    }
  }
}
