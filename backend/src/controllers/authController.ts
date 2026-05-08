import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../types';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const result = await authService.login(email, password);
      
      res.json({
        message: 'Login realizado com sucesso',
        statusCode: 200,
        data: result
      });
    } catch (error: any) {
      res.status(401).json({
        message: error.message || 'Erro ao fazer login',
        statusCode: 401,
        error: 'Unauthorized'
      });
    }
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;

    try {
      const result = await authService.refresh(refreshToken);
      
      res.json({
        message: 'Token atualizado com sucesso',
        statusCode: 200,
        data: result
      });
    } catch (error: any) {
      res.status(401).json({
        message: error.message || 'Erro ao atualizar token',
        statusCode: 401,
        error: 'Unauthorized'
      });
    }
  }

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.body;

    try {
      await authService.logout(refreshToken);
      
      res.json({
        message: 'Logout realizado com sucesso',
        statusCode: 200,
        data: null
      });
    } catch (error: any) {
      // Mesmo com erro, retorna sucesso para o cliente
      res.json({
        message: 'Logout realizado com sucesso',
        statusCode: 200,
        data: null
      });
    }
  }

  async createUser(req: Request, res: Response) {
    const userData = req.body;

    try {
      const user = await authService.createUser(userData);
      
      res.status(201).json({
        message: 'Usuário criado com sucesso',
        statusCode: 201,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error: any) {
      res.status(400).json({
        message: error.message || 'Erro ao criar usuário',
        statusCode: 400,
        error: 'Bad Request'
      });
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    res.json({
      message: 'Perfil recuperado com sucesso',
      statusCode: 200,
      data: req.user
    });
  }
}
