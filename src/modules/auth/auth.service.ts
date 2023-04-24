import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { JwtPayload } from 'jsonwebtoken';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { UserData } from './interfaces/userData';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(createUserDto: CreateUserDto, image?: Express.Multer.File) {
    const user = await this.usersService.findOneByEmail(createUserDto.email);

    if (user) {
      throw new BadRequestException('User already exists with this login');
    }

    return this.usersService.create(createUserDto, image);
  }

  async login(loginDto: LoginDto) {
    const { password, email } = loginDto;

    const validUser = await this.validateUser(email, password);

    if (!validUser)
      throw new ForbiddenException('Check your email or password');

    const { firstName, id, lastName } = validUser;

    return this.generateToken({
      email,
      firstName,
      id,
      lastName,
    });
  }

  private async validateUser(login: string, password: string) {
    const user = await this.usersService.findOneByEmail(login);

    if (!user) return null;

    const isPasswordMatch = await compare(password, user.password);

    if (!isPasswordMatch) return null;

    return user;
  }

  async generateToken(payload: JwtPayload & UserData) {
    return this.jwtService.signAsync(payload);
  }

  async verifyAccessToken(accessToken: string) {
    try {
      const userData = await this.jwtService.verifyAsync<JwtPayload & UserData>(
        accessToken,
      );

      return userData;
    } catch (e) {
      return null;
    }
  }
}
