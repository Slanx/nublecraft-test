import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ClassSerializerInterceptor,
  UseInterceptors,
  NotFoundException,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
  UploadedFile,
  MaxFileSizeValidator,
  ParseFilePipe,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { ParseEmailPipe } from 'src/common/pipes/parseEmail.pipe';
import { UserParams } from 'src/common/decorators/userParams.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserProfileDto } from './dto/create-user-profile';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Public()
  @Get('id/:id')
  findById(@Param('id', new ParseIntPipe()) id: number) {
    return this.userService.findOne(id);
  }

  @Patch('')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @UserParams('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10000000 })],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ) {
    return this.userService.update(id, updateUserDto, image);
  }

  @Delete('')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@UserParams('id') userId: number) {
    return this.userService.remove(userId);
  }

  @Public()
  @Get(':email')
  async findOneByEmail(@Param('email', new ParseEmailPipe()) email: string) {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    return user;
  }

  @Public()
  @Post('profile')
  async createProfile(@Body() createUserProfileDto: CreateUserProfileDto) {
    const result = await this.userService.createUserProfile(
      createUserProfileDto.email,
    );

    return result;
  }

  @Public()
  @Get('profile/:email')
  async getProfile(
    @Param('email', new ParseEmailPipe()) email: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const pdf = await this.userService.getUserProfile(email);

    response.set({
      'Content-Disposition': `inline; filename="${email}.pdf"`,
      'Content-Type': 'application/pdf',
    });

    return pdf;
  }
}
