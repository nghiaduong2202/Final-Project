import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MessageGateway } from './message.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { Participant } from './entities/participant.entity';
import { PersonModule } from 'src/people/person.module';
import { AuthModule } from 'src/auths/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, Participant]),
    PersonModule,
    AuthModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, MessageGateway],
})
export class ChatModule {}
