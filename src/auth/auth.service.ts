/*
https://docs.nestjs.com/providers#services
*/

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import authConfig from './config/authConfig';
import type { ConfigType } from '@nestjs/config';
import { SignupDto } from './dtos/signup.dto';
import { HashingProvider } from './providers/hashing.provider';
import { Role } from 'src/common/enums/user.role.enum';
import { JwtService } from '@nestjs/jwt';
import { SigninDto } from './dtos/signin.dto';
import { RefreshTokenDto } from './dtos/refresh.token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly hashingProvider: HashingProvider,
    private readonly jwtService: JwtService,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
  ) {}

  async signup(dto: SignupDto) {
    if (dto.role === Role.ADMIN) {
      throw new BadRequestException('admin account cannot be self-registered');
    }

    const exists = await this.userService.findByEmail(dto.email);
    if (exists) throw new ConflictException();

    const hash = await this.hashingProvider.hash(dto.password);

    const user = await this.userService.create({
      ...dto,
      password: hash,
    });

    const { password, ...rest } = user;
    const tokens = await this.generateTokens(user);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      message: 'signup success',
      rest,
      tokens,
    };
  }

  async signin(dto: SigninDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('user not found');

    const validPass = await this.hashingProvider.compare(
      dto.password,
      user.password,
    );

    if (!validPass) throw new BadRequestException('invalid credentials');

    const { password, ...rest } = user;
    const tokens = await this.generateTokens(user);

    return {
      rest,
      tokens,
    };
  }

  async logout(userId: string) {
    await this.userService.update(userId, {
      refreshToken: null,
    });

    return {
      message: 'You have logged out!',
    };
  }

  async refreshTokens(dto: RefreshTokenDto) {
    const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
      secret: this.authConfiguration.refresh_secret,
    });

    const user = await this.userService.findOne(payload.id);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException();
    }

    const match = await this.hashingProvider.compare(
      dto.refreshToken,
      user.refreshToken,
    );

    if (!match) throw new UnauthorizedException();

    const tokens = await this.generateTokens(user);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashed = await this.hashingProvider.hash(refreshToken);

    await this.userService.update(userId, {
      refreshToken: hashed,
    });
  }

  private async generateTokens(user: any) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.authConfiguration.secret,
        expiresIn: this.authConfiguration.expiresIn as any,
      }),

      this.jwtService.signAsync(payload, {
        secret: this.authConfiguration.refresh_secret,
        expiresIn: this.authConfiguration.refresh_secret_expires as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
