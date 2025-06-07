import { UUID } from 'crypto';
import { CreateConversationDto } from './dtos/create-conversation.dto';
import { CreateGroupConversationDto } from './dtos/create-group-conversation.dto';
import { Message } from './entities/message.entity';
import { SendMessageDto } from './dtos/send-message.dto';
import { Conversation } from './entities/conversation.entity';
import { SendImagesDto } from './dtos/send-images.dto';
import { SeenMessageDto } from './dtos/seen-message.dto';
import { Participant } from './entities/participant.entity';
import { AddPersonDto } from './dtos/add-person.dto';

export interface IChatService {
  getManyConversations(personId: UUID): Promise<any[]>;

  createConverastion(
    createConversationDto: CreateConversationDto,
    personId: UUID,
  ): Promise<{ message: string }>;

  createGroupConversation(
    createGroupConversationDto: CreateGroupConversationDto,
    personId: UUID,
  ): Promise<{ message: string }>;

  sendMessage(sendMessageDto: SendMessageDto, personId: UUID): Promise<Message>;

  getInfoConversation(personId: UUID): Promise<Conversation[]>;

  sendImages(sendImagesDto: SendImagesDto, personId: UUID): Promise<Message>;

  seenMessage(
    seenMessageDto: SeenMessageDto,
    personId: UUID,
  ): Promise<Participant>;

  addPerson(
    addPersonDto: AddPersonDto,
    personId: UUID,
  ): Promise<{ message: string }>;
}
