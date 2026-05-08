import request from 'supertest';
import { app } from '../server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Solicitation Routes', () => {
  let userToken: string;
  let categoryId: string;

  beforeEach(async () => {
    // Clean database
    await prisma.solicitation.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    const hashedPassword = await bcrypt.hash('123456', 10);
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'EMPLOYEE',
      },
    });

    // Create test category
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        description: 'Test Description',
        isActive: true,
      },
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: '123456',
      });

    userToken = loginResponse.body.data.token;
    categoryId = category.id;
  });

  afterAll(async () => {
    await prisma.solicitation.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /solicitations', () => {
    it('should create a solicitation with valid data', async () => {
      const solicitationData = {
        title: 'Test Solicitation',
        description: 'Test Description',
        amount: 100,
        date: '2024-01-01T00:00:00.000Z',
        categoryId,
      };

      const response = await request(app)
        .post('/solicitations')
        .set('Authorization', `Bearer ${userToken}`)
        .send(solicitationData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.title).toBe(solicitationData.title);
      expect(response.body.data.status).toBe('DRAFT');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/solicitations')
        .send({
          title: 'Test Solicitation',
          description: 'Test Description',
          amount: 100,
          date: '2024-01-01',
          categoryId: 'test-id',
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 with invalid data', async () => {
      const response = await request(app)
        .post('/solicitations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: '',
          description: 'Test Description',
          amount: -100,
          date: '2024-01-01',
          categoryId: '',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /solicitations', () => {
    beforeEach(async () => {
      // Create test solicitation
      await prisma.solicitation.create({
        data: {
          title: 'Test Solicitation',
          description: 'Test Description',
          amount: 100,
          date: new Date('2024-01-01'),
          status: 'DRAFT',
          userId: 'test-user-id',
          categoryId,
        },
      });
    });

    it('should get solicitations with valid token', async () => {
      const response = await request(app)
        .get('/solicitations')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/solicitations');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /solicitations/:id', () => {
    let solicitationId: string;

    beforeEach(async () => {
      const solicitation = await prisma.solicitation.create({
        data: {
          title: 'Test Solicitation',
          description: 'Test Description',
          amount: 100,
          date: new Date('2024-01-01'),
          status: 'DRAFT',
          userId: 'test-user-id',
          categoryId,
        },
      });
      solicitationId = solicitation.id;
    });

    it('should update a solicitation with valid data', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        amount: 200,
        date: '2024-02-01T00:00:00.000Z',
      };

      const response = await request(app)
        .put(`/solicitations/${solicitationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.title).toBe(updateData.title);
    });

    it('should return 404 for non-existent solicitation', async () => {
      const response = await request(app)
        .put('/solicitations/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Updated Title',
        });

      expect(response.status).toBe(404);
    });
  });
});
