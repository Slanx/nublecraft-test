import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { hashPassword } from 'src/utils/hash';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  private readonly saltRounds: number;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    this.saltRounds = Number(this.configService.get('CRYPT_SALT'));
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await hashPassword(
      this.saltRounds,
      createUserDto.password,
    );

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });

    return user;
  }

  async findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    await this.userRepository.remove(user);
  }
}
