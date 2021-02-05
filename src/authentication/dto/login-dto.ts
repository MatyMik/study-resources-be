import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format!' })
  email: string;

  @MinLength(5, {
    message: 'Password too short!',
  })
  password: string;
}
