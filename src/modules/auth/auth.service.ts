import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../../interfaces/user.interface';
import { RegisterDto } from './dto/register.dto';
import { JWTconstants } from '../../constants/jwt.constants';
import { MessageConsatnts } from '../../constants/message.constants';
import { MailService } from '../../mail/mail.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
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
    const accessToken = this.jwtService.sign(payload, { expiresIn: JWTconstants.expiresIn });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: JWTconstants.expiresInRefresh });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, JWTconstants.HASH_SALT_ROUNDS);
    await this.usersService.saveRefreshToken(user._id as string, hashedRefreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(dto: RegisterDto) {
    const { email, password, role = 0 } = dto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(MessageConsatnts.EMAIL_ALREADY);
    }

    const hashedPassword = await bcrypt.hash(password, JWTconstants.HASH_SALT_ROUNDS);

    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const newUser = await this.usersService.create({
      email,
      password: hashedPassword,
      role,
      otp,
      otpExpiresAt,
    });

    await this.mailService.sendEmail({
      to: newUser.email,
      subject: 'Mã OTP xác minh',
      html: `<p>Mã OTP của bạn là: <b>${otp}</b></p>`,
    });

    return {
      message: 'Đăng ký thành công, kiểm tra email để xác minh OTP',
      email: newUser.email,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    if (user.otp !== dto.otp.trim()) {
      throw new BadRequestException('OTP không đúng');
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP đã hết hạn');
    }

    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    return { message: 'Xác minh OTP thành công' };
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
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException(MessageConsatnts.INVALID_REFRESH_TOKEN);
    }
  }

  async logout(userId: string) {
    await this.usersService.saveRefreshToken(userId, '');
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
