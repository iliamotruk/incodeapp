import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';


@Module({
  imports: [JwtModule,UserModule],
  providers: [TokenService],
  exports: [TokenService]
})
export class TokenModule {}
