import { IsEmail, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: 'Invalid email format!' })
  email: string;

  @MinLength(5, {
    message: 'Password too short!',
  })
  password: string;

  @MinLength(5, {
    message: 'Password too short!',
  })
  confirmPassword: string;
}
