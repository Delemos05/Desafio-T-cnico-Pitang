import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '../types';
import { UnauthorizedError, ValidationError } from '../utils/errors';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

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

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
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
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
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

      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      const newRefreshToken = jwt.sign(
        { id: user.id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET!,
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
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      // Remove refresh token do banco (invalida)
      await prisma.user.update({
        where: { id: decoded.id },
        data: { refreshToken: null }
      });

    } catch (error) {
      // Token inválido, mas não faz nada
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
