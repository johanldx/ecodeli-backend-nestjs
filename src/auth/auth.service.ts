import { Injectable, UnauthorizedException } from '@nestjs/common';
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
import { BadRequestException, NotFoundException } from '@nestjs/common';  // Importer les exceptions

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  // Inscription
  async register(registerDto: RegisterDto) {
    const { password, email, ...userData } = registerDto;

    // Vérification si l'email existe déjà
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email is already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      ...userData,
      email,
      password: hashedPassword,
    });
    await this.userRepository.save(newUser);
    return this.login({ email: newUser.email, password: registerDto.password });
  }

  // Connexion
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Utilisation de BadRequestException pour une erreur de credentials invalides
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user);
  }

  // Générer les tokens JWT (Access et Refresh)
  generateTokens(user: User) {
    const payload = { email: user.email, sub: user.id };
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

  // Refresh Token
  async refreshToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      return this.generateTokens(decoded);
    } catch (error) {
      // Utilisation de BadRequestException pour un token invalide
      throw new BadRequestException('Invalid refresh token');
    }
  }

  // Mot de passe oublié - Envoi du token de réinitialisation par e-mail
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Utilisation de NotFoundException pour une erreur d'utilisateur introuvable
      throw new NotFoundException('User not found');
    }

    // Générer un token UUID pour la réinitialisation du mot de passe
    const resetToken = uuidv4();
    user.resetPasswordToken = resetToken;
    await this.userRepository.save(user);

    // Envoyer un e-mail avec le token de réinitialisation
    const resetUrl = `https://your-app.com/reset-password?token=${resetToken}`;
    const emailContent = `
      <h1>Password Reset Request</h1>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
    `;

    const emailResult = await this.emailService.sendEmail(user.email, 'Password Reset Request', emailContent);
    if (emailResult.success) {
      return { message: 'Password reset instructions sent to your email.' };
    } else {
      // Utilisation de BadRequestException pour un échec d'envoi d'email
      throw new BadRequestException('Failed to send email');
    }
  }

  // Réinitialisation du mot de passe
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { resetPasswordToken, password } = resetPasswordDto;

    // Vérification du token de réinitialisation
    const user = await this.userRepository.findOne({ where: { resetPasswordToken } });
    if (!user) {
      // Utilisation de BadRequestException pour un token invalide ou expiré
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hachage du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mise à jour du mot de passe de l'utilisateur
    user.password = hashedPassword;

    // Réinitialiser le token (par mesure de sécurité)
    user.resetPasswordToken = null;

    await this.userRepository.save(user);
    return { message: 'Password successfully reset' };
  }

  // Informations sur le profil (route /me)
  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      // Utilisation de NotFoundException si l'utilisateur n'est pas trouvé
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Mise à jour du profil
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    await this.userRepository.update(userId, updateProfileDto);
    return this.getProfile(userId);
  }

  // Suppression du profil
  async deleteProfile(userId: number) {
    const result = await this.userRepository.delete(userId);
    if (result.affected === 0) {
      // Utilisation de NotFoundException si l'utilisateur n'est pas trouvé pour la suppression
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }
}
