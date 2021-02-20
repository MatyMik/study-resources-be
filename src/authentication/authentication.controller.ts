import { Body, Controller, Post, Res, Get } from '@nestjs/common';
import { Cookies } from '../decorators/cookies';
import { BadRequestError } from '../errors/bad-request-error';
import { AuthenticationService } from './authentication.service';
import { SignupDto } from './dto/signup-dto';
import { AuthError } from '../errors/auth-error';
import { LoginDto } from './dto/login-dto';
import { NotFoundError } from '../errors/not-found-error';
import { NotAuthorizedError } from '../errors/not-authorized-error';
import { Response } from 'express';
import * as cookie from 'cookie';
import { User } from '../decorators/user';

@Controller('auth')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Post('signup')
  async signup(@Body() userData: SignupDto) {
    const { email, password, confirmPassword } = userData;
    const foundUser = await this.authenticationService.findUserByEmail(email);
    if (foundUser) throw new AuthError('email', 'Email already in use!');
    if (password !== confirmPassword)
      throw new BadRequestError('Passwords do not match!');
    const hashedPassword = await this.authenticationService.hashPassword(
      password,
    );
    await this.authenticationService.createUser({
      email,
      password: hashedPassword,
    });
    return { message: 'User has been successfully saved!' };
  }

  @Post('login')
  async login(
    @Body() userData: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password } = userData;

    const registeredUser = await this.authenticationService.findUserByEmail(
      email,
    );
    if (!registeredUser) throw new NotFoundError('Email not registered!');
    const isPasswordValid = await this.authenticationService.validatePassword(
      password,
      registeredUser.password,
    );
    if (!isPasswordValid)
      throw new AuthError('password', 'Password not valid!');
    const token = await this.authenticationService.createJwtToken(
      { email },
      process.env.ACCESS_TOKEN_SECRET,
      '2d',
    );
    return { token, userId: registeredUser.id };
  }

  @Post('verifytoken')
  async verifyToken(@User('user') user: any) {
    const foundUser = await this.authenticationService.findUserByEmail(
      user.email,
    );
    if (!foundUser) throw new NotFoundError('Email not registered!');
    return { userId: foundUser.id };
  }
}
