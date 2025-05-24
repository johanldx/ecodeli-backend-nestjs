import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { EmailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfigService } from '@nestjs/config';
import { Wallet } from 'src/wallets/entities/wallet.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,

    private jwtService: JwtService,
    private emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { password, email, ...userData } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    this.validatePassword(password);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      ...userData,
      email,
      password: hashedPassword,
    });
    await this.userRepository.save(newUser);

    const welcomeUrl = `${this.configService.get<string>('FRONDEND_URL')}/app/clients`;
    const emailContent = `
      <p>Bienvenue sur EcoDeli ! Nous sommes heureux de vous compter parmi nos membres. Vous pouvez découvir une large gamme de services tel que la livraison collaborative de colis, du services à la personne, et bien d'autres encore.</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${welcomeUrl}" style="display: inline-block; background-color: #0C392C; color: #FEFCF3; text-decoration: none; padding: 12px 25px; border-radius: 1000px;">
          Découvrir EcoDeli
        </a>
      </div>
      <p>Nous espérons que vous apprécierez l'expérience sur notre site. Si vous avez des questions, n'hésitez pas à nous contacter.</p>
    `;

    await this.emailService.sendEmail(
      email,
      'Bienvenue chez Ecodeli !',
      'Bienvenue chez Ecodeli !',
      emailContent,
    );

    return this.login({ email: newUser.email, password: registerDto.password });
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.active) {
      throw new ForbiddenException('Account is inactive');
    }

    let wallet = await this.walletRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (!wallet) {
      wallet = this.walletRepository.create({
        user,
        amout_available: 0,
        amout_pending: 0,
      });
      await this.walletRepository.save(wallet);
    }

    return this.generateTokens(user);
  }

  generateTokens(user: User) {
    const payload = {
      email: user.email,
      sub: user.id,
      administrator: user.administrator,
    };
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });
    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });
    return { access_token, refresh_token };
  }

  async refreshToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      return this.generateTokens(decoded);
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = uuidv4();
    user.resetPasswordToken = resetToken;
    await this.userRepository.save(user);

    const resetUrl = `${this.configService.get<string>('FRONDEND_URL')}/auth/reset-password?token=${resetToken}`;
    const emailContent = `
      <p>Vous avez demandé à réinitialiser le mot de passe de votre compte EcoDeli. Pour ce faire, cliquez sur le bouton ci-dessous afin de définir un nouveau mot de passe :</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #0C392C; color: #FEFCF3; text-decoration: none; padding: 12px 25px; border-radius: 1000px;">
          Réinitialiser mon mot de passe
        </a>
      </div>
      <p>Si le bouton ci-dessus ne fonctionne pas, copiez-collez le lien suivant dans la barre d'adresse de votre navigateur :</p>
      <p>${resetUrl}</p>
      </br>
      <p>Si vous n'avez pas initié cette demande, veuillez ignorer cet e-mail.</p>
    `;

    const emailResult = await this.emailService.sendEmail(
      user.email,
      'Réinitialisation de votre mot de passe',
      'Réinitialisation de votre mot de passe',
      emailContent,
    );
    if (emailResult.success) {
      return { message: 'Password reset instructions sent to your email.' };
    } else {
      throw new BadRequestException('Failed to send email');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { resetPasswordToken, password } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: { resetPasswordToken },
    });
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    this.validatePassword(password);

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = null;

    await this.userRepository.save(user);

    const loginUrl = `${this.configService.get<string>('FRONDEND_URL')}/auth/login`;
    const emailContent = `
      <p>Nous vous informons que votre mot de passe EcoDeli a été modifié avec succès. Si vous êtes à l'origine de cette modification, vous pouvez vous connecter en utilisant votre nouveau mot de passe.</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${loginUrl}" style="display: inline-block; background-color: #0C392C; color: #FEFCF3; text-decoration: none; padding: 12px 25px; border-radius: 1000px;">
          Se connecter
        </a>
      </div>
      <p>Si vous n'êtes pas à l'origine de cette modification, nous vous conseillons de nous contacter immédiatement pour sécuriser votre compte.</p>
      <p>Pour toute question, n'hésitez pas à nous contacter.</p>
    `;

    await this.emailService.sendEmail(
      user.email,
      'Votre mot de passe a bien été modifié',
      'Votre mot de passe a bien été modifié',
      emailContent,
    );

    return { message: 'Password successfully reset' };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toResponseDto(user);
  }

  async updateProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    if (updateProfileDto.email !== undefined) {
      if (updateProfileDto.email.trim() === '') {
        throw new BadRequestException("L'email ne peut pas être vide");
      }
      const userWithEmail = await this.userRepository.findOne({
        where: { email: updateProfileDto.email },
      });
      if (
        userWithEmail &&
        userWithEmail.id !== userId &&
        userWithEmail.email != updateProfileDto.email
      ) {
        throw new ConflictException('Cet email est déjà pris');
      }
    }

    if (
      updateProfileDto.first_name !== undefined &&
      updateProfileDto.first_name.trim() === ''
    ) {
      throw new BadRequestException('Le prénom ne peut pas être vide');
    }
    if (
      updateProfileDto.last_name !== undefined &&
      updateProfileDto.last_name.trim() === ''
    ) {
      throw new BadRequestException('Le nom ne peut pas être vide');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (updateProfileDto.email !== undefined) {
      user.email = updateProfileDto.email;
    }
    if (updateProfileDto.first_name !== undefined) {
      user.first_name = updateProfileDto.first_name;
    }
    if (updateProfileDto.last_name !== undefined) {
      user.last_name = updateProfileDto.last_name;
    }

    await this.userRepository.save(user);
    return user;
  }

  async deleteProfile(userId: number) {
    const result = await this.userRepository.delete(userId);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<UserResponseDto> {
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    this.validatePassword(newPassword);

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    const loginUrl = `${this.configService.get<string>('FRONDEND_URL')}/auth/login`;
    const emailContent = `
      <p>Nous vous informons que votre mot de passe EcoDeli a été modifié avec succès. Si vous êtes à l'origine de cette modification, vous pouvez vous connecter en utilisant votre nouveau mot de passe.</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${loginUrl}" style="display: inline-block; background-color: #0C392C; color: #FEFCF3; text-decoration: none; padding: 12px 25px; border-radius: 1000px;">
          Se connecter
        </a>
      </div>
      <p>Si vous n'êtes pas à l'origine de cette modification, nous vous conseillons de nous contacter immédiatement pour sécuriser votre compte.</p>
      <p>Pour toute question, n'hésitez pas à nous contacter.</p>
    `;

    await this.emailService.sendEmail(
      user.email,
      'Votre mot de passe a bien été modifié',
      'Votre mot de passe a bien été modifié',
      emailContent,
    );

    return this.toResponseDto(user);
  }

  private toResponseDto(user: User): UserResponseDto {
    const { password, resetPasswordToken, ...userResponse } = user;
    return userResponse;
  }

  private validatePassword(password: string): void {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new BadRequestException(
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number.',
      );
    }
  }
}
