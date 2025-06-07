import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { IChatService } from './ichat.service';
import { UUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Participant } from './entities/participant.entity';
import { CreateConversationDto } from './dtos/create-conversation.dto';
import { CreateGroupConversationDto } from './dtos/create-group-conversation.dto';
import { SendMessageDto } from './dtos/send-message.dto';
import { PersonService } from 'src/people/person.service';
import { SendImagesDto } from './dtos/send-images.dto';
import { SeenMessageDto } from './dtos/seen-message.dto';
import { MessageGateway } from './message.gateway';
import { AddPersonDto } from './dtos/add-person.dto';

@Injectable()
export class ChatService implements IChatService {
  constructor(
    /**
     * inject ConversationRepository
     */
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    /**
     * inject MessageRepository
     */
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    /**
     * inject ParticipantRepository
     */
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    /**
     * inject DataSource
     */
    private readonly dataSource: DataSource,
    /**
     * inject PersonService
     */
    private readonly personService: PersonService,
    /**
     * inject MessageGateway
     */
    @Inject(forwardRef(() => MessageGateway))
    private readonly messageGateway: MessageGateway,
  ) {}

  public async getManyConversations(personId: UUID): Promise<any[]> {
    const conversations = await this.conversationRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.messages', 'allMessages')
      .leftJoinAndSelect('allMessages.sender', 'sender')
      .innerJoin('c.participants', 'p')
      .leftJoinAndSelect('c.participants', 'allParticipants')
      .leftJoinAndSelect('allParticipants.person', 'person')
      .leftJoinAndSelect('allParticipants.seen', 'seen')
      .where('p.personId = :personId', { personId })
      .orderBy('allParticipants.updatedAt', 'DESC')
      .orderBy('allMessages.createdAt', 'ASC')
      .getMany();

    const result = conversations.map((conversation) => {
      const seen = conversation.participants.find(
        (participant) => participant.personId === personId,
      )!.seen;

      let unreadMessageCount: number;
      if (!seen) {
        unreadMessageCount = conversation.messages.length;
      } else {
        unreadMessageCount = conversation.messages.filter(
          (message) => message.createdAt > seen.createdAt,
        ).length;
      }
      return {
        ...conversation,
        unreadMessageCount,
      };
    });
    return result;
  }

  public async createConverastion(
    createConversationDto: CreateConversationDto,
    personId: UUID,
  ): Promise<{ message: string }> {
    const existingConversation = await this.conversationRepository
      .createQueryBuilder('c')
      .innerJoin('c.participants', 'p')
      .where('c.isGroup = :isGroup', { isGroup: false })
      .andWhere('p.personId In (:...personIds)', {
        personIds: [personId, createConversationDto.personId],
      })
      .groupBy('c.id')
      .having('COUNT(DISTINCT p.personId) = 2')
      .getOne();

    if (existingConversation) {
      throw new BadRequestException('The conversation is existing');
    }

    await this.dataSource.transaction(async (manager) => {
      const conversation = manager.create(Conversation, {
        isGroup: false,
      });

      await manager.save(conversation);

      const paricipant1 = manager.create(Participant, {
        personId: personId,
        conversation,
      });

      const participant2 = manager.create(Participant, {
        personId: createConversationDto.personId,
        conversation,
      });

      await manager.save([paricipant1, participant2]);

      conversation.participants = [paricipant1, participant2];

      this.messageGateway.emitJoinConversation(conversation);
    });

    return {
      message: 'Create conversation successful',
    };
  }

  public async createGroupConversation(
    createGroupConversationDto: CreateGroupConversationDto,
    personId: UUID,
  ): Promise<{ message: string }> {
    await this.dataSource.transaction(async (manager) => {
      const conversation = manager.create(Conversation, {
        isGroup: true,
        title: createGroupConversationDto.title,
      });

      await manager.save(conversation);

      const participants: Participant[] = [];

      for (const member of createGroupConversationDto.members) {
        const person = await this.personService.findOneById(member);

        const participant = manager.create(Participant, {
          person,
          conversation: conversation,
        });

        await manager.save(participant);
        participants.push(participant);
      }

      const person = await this.personService.findOneById(personId);

      const adminConversation = manager.create(Participant, {
        person,
        conversation,
        isAdmin: true,
      });

      await manager.save(adminConversation);
      participants.push(adminConversation);

      conversation.participants = participants;

      this.messageGateway.emitJoinConversation(conversation);
    });

    return { message: 'Create group conversation successful' };
  }

  public async sendMessage(
    sendMessageDto: SendMessageDto,
    personId: UUID,
  ): Promise<Message> {
    const person = await this.personService.findOneById(personId);

    const conversation = await this.conversationRepository
      .findOneOrFail({
        where: {
          id: sendMessageDto.conversationId,
          participants: {
            personId: personId,
          },
        },
      })
      .catch(() => {
        throw new BadRequestException('Not found the conversation');
      });

    const message = this.messageRepository.create({
      content: sendMessageDto.content,
      conversation,
      sender: person,
    });

    const participant = await this.participantRepository
      .findOneOrFail({
        where: {
          conversationId: sendMessageDto.conversationId,
          personId: personId,
        },
      })
      .catch(() => {
        throw new BadRequestException('Not found the participant');
      });

    try {
      await this.messageRepository.save(message);

      participant.seen = message;

      await this.participantRepository.save(participant);

      return message;
    } catch {
      throw new BadRequestException('An error occurred when send message');
    }
  }

  public async getInfoConversation(personId: UUID): Promise<Conversation[]> {
    return await this.conversationRepository.find({
      where: {
        participants: {
          personId: personId,
        },
      },
    });
  }

  public async sendImages(
    sendImagesDto: SendImagesDto,
    personId: UUID,
  ): Promise<Message> {
    const person = await this.personService.findOneById(personId);

    const conversation = await this.conversationRepository
      .findOneOrFail({
        where: {
          id: sendImagesDto.conversationId,
          participants: {
            personId: personId,
          },
        },
      })
      .catch(() => {
        throw new BadRequestException('Not found the conversation');
      });

    const message = this.messageRepository.create({
      images: sendImagesDto.images,
      conversation,
      sender: person,
    });

    const participant = await this.participantRepository
      .findOneOrFail({
        where: {
          conversationId: sendImagesDto.conversationId,
          personId: personId,
        },
      })
      .catch(() => {
        throw new BadRequestException('Not found the participant');
      });

    try {
      await this.messageRepository.save(message);

      participant.seen = message;

      await this.participantRepository.save(participant);

      return message;
    } catch {
      throw new BadRequestException('An error occurred when send message');
    }
  }

  public async seenMessage(
    seenMessageDto: SeenMessageDto,
    personId: UUID,
  ): Promise<Participant> {
    const participant = await this.participantRepository
      .findOneOrFail({
        where: {
          personId: personId,
          conversationId: seenMessageDto.conversationId,
        },
      })
      .catch(() => {
        throw new BadRequestException('Not found the participant');
      });

    const message = await this.messageRepository
      .findOneOrFail({
        where: {
          conversation: {
            id: seenMessageDto.conversationId,
          },
          id: seenMessageDto.messageId,
        },
      })
      .catch(() => {
        throw new BadRequestException('Not found messages');
      });

    try {
      participant.seen = message;

      return await this.participantRepository.save(participant);
    } catch {
      throw new BadRequestException('An error occurred when seen message');
    }
  }

  public async addPerson(
    addPersonDto: AddPersonDto,
    personId: UUID,
  ): Promise<{ message: string }> {
    const conversation = await this.conversationRepository
      .findOneOrFail({
        relations: {
          participants: true,
          messages: {
            sender: true,
          },
        },
        where: {
          id: addPersonDto.conversationId,
          isGroup: true,
        },
        order: {
          messages: {
            createdAt: 'ASC',
          },
        },
      })
      .catch(() => {
        throw new BadRequestException('Not found the conversation');
      });

    let isAccept = true;

    for (const participant of conversation.participants) {
      if (participant.personId === addPersonDto.personId) {
        isAccept = false;
        break;
      }

      if (participant.personId === personId) {
        if (participant.isAdmin) continue;

        isAccept = false;
        break;
      }
    }

    if (!isAccept) {
      throw new BadRequestException(
        'An error occurred when add person to group conversation',
      );
    }

    const participant = this.participantRepository.create({
      conversation,
      personId: addPersonDto.personId,
    });

    try {
      await this.participantRepository.save(participant);
      conversation.participants.push(participant);
      this.messageGateway.emitAddPerson(conversation, participant);
    } catch {
      throw new BadRequestException(
        'An error occurred when add user to group conversation',
      );
    }

    return {
      message: 'Add person to group conversation successful',
    };
  }
}
