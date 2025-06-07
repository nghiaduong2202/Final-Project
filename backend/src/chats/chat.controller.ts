import { Body, Controller, Get, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ActivePerson } from 'src/auths/decorators/active-person.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { AuthRoleEnum } from 'src/auths/enums/auth-role.enum';
import { AuthRoles } from 'src/auths/decorators/auth-role.decorator';
import { UUID } from 'crypto';
import { CreateConversationDto } from './dtos/create-conversation.dto';
import { CreateGroupConversationDto } from './dtos/create-group-conversation.dto';
import { AddPersonDto } from './dtos/add-person.dto';

@Controller('chat')
@AuthRoles(AuthRoleEnum.ADMIN, AuthRoleEnum.OWNER, AuthRoleEnum.PLAYER)
export class ChatController {
  constructor(
    /**
     * inject ChatService
     */
    private readonly chatService: ChatService,
  ) {}

  @ApiOperation({
    summary: 'get many conversation of user (role: admin, owner, player)',
  })
  @Get()
  public getManyConversations(@ActivePerson('sub') personId: UUID) {
    return this.chatService.getManyConversations(personId);
  }

  @ApiOperation({
    summary: 'create conversation (role)',
  })
  @Post('conversation')
  public createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @ActivePerson('sub') personId: UUID,
  ) {
    return this.chatService.createConverastion(createConversationDto, personId);
  }

  @ApiOperation({
    summary: 'create group conversation (role: admin, owner, player)',
  })
  @Post('group-conversation')
  public createGroupConversation(
    @Body() createGroupConversationDto: CreateGroupConversationDto,
    @ActivePerson('sub') personId: UUID,
  ) {
    return this.chatService.createGroupConversation(
      createGroupConversationDto,
      personId,
    );
  }

  @ApiOperation({
    summary:
      'add a person in group conversation and you are admin of group conversation',
  })
  @Post('add-person')
  addPerson(
    @Body() addPersonDto: AddPersonDto,
    @ActivePerson('sub') personId: UUID,
  ) {
    return this.chatService.addPerson(addPersonDto, personId);
  }

  // @ApiOperation({
  //   summary: 'remove a person from group conversation',
  // })
  // @Post('remove-person')
  // removePerson() {}
}
