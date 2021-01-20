import { IsEmail, MinLength, MaxLength } from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: 'Invalid email format!' })
  email: string;

  @MinLength(5, {
    message: 'Password too short!',
  })
  @MaxLength(10, {
    message: 'Password too long!',
  })
  password: string;

  @MinLength(5, {
    message: 'Password too short!',
  })
  @MaxLength(10, {
    message: 'Password too long!',
  })
  confirmPassword: string;
}
