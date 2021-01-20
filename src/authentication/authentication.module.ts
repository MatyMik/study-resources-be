import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  imports: [TypeOrmModule.forFeature([User])],
})
export class AuthenticationModule {}
