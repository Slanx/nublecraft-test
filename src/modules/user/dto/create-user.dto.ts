import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { IsEmail } from 'class-validator/types/decorator/decorators';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(5)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}
