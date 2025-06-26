import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../../interfaces/user.interface';
import { RegisterDto } from './dto/register.dto';
import { JWTconstants } from '../../constants/jwt.constants';
import { MessageConsatnts } from '../../constants/message.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: JWTconstants.expiresIn,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: JWTconstants.expiresInRefresh,
    });

    const hashedRefreshToken = await bcrypt.hash(
      refreshToken,
      JWTconstants.HASH_SALT_ROUNDS,
    );
    await this.usersService.saveRefreshToken(
      user._id as string,
      hashedRefreshToken,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(dto: RegisterDto) {
    const { email, password, role = 0 } = dto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException(MessageConsatnts.EMAIL_ALREADY);
    }

    const hashedPassword = await bcrypt.hash(
      password,
      JWTconstants.HASH_SALT_ROUNDS,
    );
    const newUser = await this.usersService.create({
      email,
      password: hashedPassword,
      role,
    });

    return this.login(newUser);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findById(payload.sub);

      if (!user?.refreshToken) {
        throw new UnauthorizedException(MessageConsatnts.INVALID_REFRESH_TOKEN);
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValid) {
        throw new UnauthorizedException(MessageConsatnts.INVALID_REFRESH_TOKEN);
      }

      const newAccessToken = this.jwtService.sign(
        {
          sub: user._id,
          email: user.email,
          role: user.role,
        },
        { expiresIn: JWTconstants.expiresIn },
      );

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(MessageConsatnts.INVALID_REFRESH_TOKEN);
    }
  }

  async logout(userId: string) {
    await this.usersService.saveRefreshToken(userId, '');
  }
}
