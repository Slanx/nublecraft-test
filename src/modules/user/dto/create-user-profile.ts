import { IsNotEmpty, IsEmail } from 'class-validator';

export class CreateUserProfileDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
