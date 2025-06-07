import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { PlaymateService } from './playmate.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreatePlaymateDto } from './dtos/create-playmate.dto';
import { ActivePerson } from 'src/auths/decorators/active-person.decorator';
import { UUID } from 'crypto';
import { AuthRoles } from 'src/auths/decorators/auth-role.decorator';
import { AuthRoleEnum } from 'src/auths/enums/auth-role.enum';
import { UpdatePlaymateDto } from './dtos/update-playmate.dto';
import { RegisterPlaymateDto } from './dtos/register-playmate.dto';
import { ParticipantDto } from './dtos/participant.dto';
import { ParticipantStatusEnum } from './enums/participant-status.enum';

@Controller('playmate')
export class PlaymateController {
  constructor(
    /**
     * inject PlaymateService
     */
    private readonly playmateService: PlaymateService,
  ) {}

  @ApiOperation({
    summary: 'create a playmate (role: player)',
  })
  @Post('create')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public create(
    @Body() createPlaymateDto: CreatePlaymateDto,
    @ActivePerson('sub') playerId: UUID,
  ) {
    return this.playmateService.create(createPlaymateDto, playerId);
  }

  @ApiOperation({
    summary: 'Update playmate (role: player)',
  })
  @Put('update')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public update(
    @Body() updatePlaymateDto: UpdatePlaymateDto,
    @ActivePerson('sub') playerId: UUID,
  ) {
    return this.playmateService.update(updatePlaymateDto, playerId);
  }

  @ApiOperation({
    summary: 'register a playmate post (role: player)',
  })
  @Post('register')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public register(
    @Body() registerPlaymateDto: RegisterPlaymateDto,
    @ActivePerson('sub') playerId: UUID,
  ) {
    return this.playmateService.register(registerPlaymateDto, playerId);
  }

  @ApiOperation({
    summary: 'get many playmate post (role: none)',
  })
  @Get()
  @AuthRoles(AuthRoleEnum.NONE)
  public getMany() {
    return this.playmateService.getMany();
  }

  @ApiOperation({
    summary: 'get all my post (role: player)',
  })
  @Get('my-post')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public getMyPost(@ActivePerson('sub') playerId: UUID) {
    return this.playmateService.getMyPost(playerId);
  }

  @ApiOperation({
    summary: 'get all playmate which i registered (role: player)',
  })
  @Get('my-register')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public getMyRegister(@ActivePerson('sub') playerId: UUID) {
    return this.playmateService.getMyRegister(playerId);
  }

  @ApiOperation({
    summary: 'get detail of playmate post (post: none)',
  })
  @Get(':playmateId')
  @AuthRoles(AuthRoleEnum.NONE)
  public getDetail(@Param('playmateId', ParseUUIDPipe) playmateId: UUID) {
    return this.playmateService.getDetail(playmateId);
  }

  @ApiOperation({
    summary: 'accept to register (role: player)',
  })
  @Put('accept')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public accept(
    @Body() participantDto: ParticipantDto,
    @ActivePerson('sub') playerId: UUID,
  ) {
    return this.playmateService.decideRegister(
      participantDto,
      playerId,
      ParticipantStatusEnum.ACCEPTED,
    );
  }

  @ApiOperation({
    summary: 'reject to register (role: player)',
  })
  @Put('reject')
  @AuthRoles(AuthRoleEnum.PLAYER)
  reject(
    @Body() participantDto: ParticipantDto,
    @ActivePerson('sub') playerId: UUID,
  ) {
    return this.playmateService.decideRegister(
      participantDto,
      playerId,
      ParticipantStatusEnum.REJECTED,
    );
  }
}
