import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt-nodejs';
import { LoginDto } from './dto/login-dto';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign, verify } from 'jsonwebtoken';

@Injectable()
export class AuthenticationService {
  constructor(@InjectRepository(User) private user: Repository<User>) {}
  async hashPassword(password: string) {
    const salt = await bcrypt.genSaltSync(10);
    const hashedP: string = await bcrypt.hashSync(password, salt);
    return hashedP;
  }

  async createUser(userDot: LoginDto) {
    const newUser: User = User.create();
    newUser.email = userDot.email;
    newUser.password = userDot.password;
    const [savedUser] = await this.user.save<User>([newUser]);
    return savedUser;
  }

  async findUserByEmail(email: string) {
    const [user] = await this.user.find({ where: { email } });
    return user;
  }

  async findById(id: number) {
    const [user] = await this.user.find({ id });
    return user;
  }

  async validatePassword(password: string, hashedPassword: string) {
    const isEqual: boolean = await bcrypt.compareSync(password, hashedPassword);
    return isEqual;
  }

  async createJwtToken(payload, secret, expiresIn) {
    return await sign({ ...payload, createdAt: Date.now() }, secret, {
      expiresIn,
    });
  }

  verifyJwtToken(payload, secret) {
    try {
      const user = verify(payload, secret);
      if (typeof user === 'string') return null;
      return user;
    } catch (e) {
      return null;
    }
  }
}
