import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';
import { UnauthorizedError, ValidationError, ForbiddenError } from '../utils/errors';
import { randomBytes } from 'crypto';
import prisma from '../lib/prisma';
import { CreateUserInput } from '../schemas/auth';

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    // Validação das variáveis de ambiente
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    
    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT_SECRET and JWT_REFRESH_SECRET environment variables are required');
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      jwtRefreshSecret,
      { expiresIn: '7d' }
    );

    // Salva refresh token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  async refresh(refreshToken: string) {
    const jwtRefreshSecretEnv = process.env.JWT_REFRESH_SECRET;
    if (!jwtRefreshSecretEnv) {
      throw new Error('JWT_REFRESH_SECRET environment variable is required');
    }
    
    try {
      const decoded = jwt.verify(refreshToken, jwtRefreshSecretEnv) as any;
      
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedError('Token inválido');
      }

      const user = await prisma.user.findFirst({
        where: { 
          id: decoded.id,
          refreshToken 
        }
      });

      if (!user) {
        throw new UnauthorizedError('Token inválido ou expirado');
      }

      const jwtSecret = process.env.JWT_SECRET;
      const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
      
      if (!jwtSecret || !jwtRefreshSecret) {
        throw new Error('JWT secrets not configured');
      }

      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: '15m' }
      );

      const newRefreshToken = jwt.sign(
        { id: user.id, type: 'refresh' },
        jwtRefreshSecret,
        { expiresIn: '7d' }
      );

      // Atualiza refresh token (rotation)
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken }
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };

    } catch (error) {
      throw new UnauthorizedError('Token inválido ou expirado');
    }
  }

  async logout(refreshToken: string) {
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtRefreshSecret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is required');
    }
    
    try {
      const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as any;
      
      // Remove refresh token do banco (invalida)
      await prisma.user.update({
        where: { id: decoded.id },
        data: { refreshToken: null }
      });

    } catch (error) {
      // Token inválido, loga para debugging
      console.error('Logout error: Invalid refresh token');
    }
  }

  private generateRefreshToken(): string {
    return randomBytes(32).toString('hex');
  }

  async createUser(data: CreateUserInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new ValidationError('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    return user;
  }
}
