import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { ValidationPipe } from '@nestjs/common';

describe('TodosController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let accessToken: string;
  let userId: number;

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
      }));
      
      await app.init();
      
      prisma = app.get<PrismaService>(PrismaService);
      authService = app.get<AuthService>(AuthService);
      
      await prisma.todo.deleteMany();
      await prisma.refreshToken.deleteMany();
      await prisma.user.deleteMany();
    } catch (error) {
      console.error('Error during setup:', error);
      throw error;
    }
  });

  beforeEach(async () => {
    try {
      await prisma.todo.deleteMany();
      await prisma.refreshToken.deleteMany();
      await prisma.user.deleteMany();

      const registerDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
      };
      
      const registerResponse = await authService.register(registerDto);
      accessToken = registerResponse.access_token;
      
      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' }
      });
      
      if (user) {
        userId = user.id;
      } else {
        throw new Error('Failed to create test user');
      }
    } catch (error) {
      console.error('Error during test setup:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (app) {
      await prisma.$disconnect();
      await app.close();
    }
  });

  describe('GET /todos', () => {
    it('should return todos for authenticated user', async () => {
      await prisma.todo.createMany({
        data: [
          { title: 'Todo 1', userId },
          { title: 'Todo 2', userId },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/todos')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(2);
      expect(response.body.meta.total).toBe(2);
    });

    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .get('/todos')
        .expect(401);
    });
  });

  describe('POST /todos', () => {
    it('should create a new todo', async () => {
      const createDto = { title: 'New Todo', description: 'Test description' };

      const response = await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body.data.title).toBe(createDto.title);
    });
  });

  describe('PATCH /todos/:id', () => {
    it('should update a todo', async () => {
      const todo = await prisma.todo.create({
        data: { title: 'Original', userId },
      });

      const updateDto = { title: 'Updated' };

      const response = await request(app.getHttpServer())
        .patch(`/todos/${todo.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.data.title).toBe(updateDto.title);
    });
  });

  describe('DELETE /todos/:id', () => {
    it('should delete a todo', async () => {
      const todo = await prisma.todo.create({
        data: { title: 'To Delete', userId },
      });

      await request(app.getHttpServer())
        .delete(`/todos/${todo.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      const deleted = await prisma.todo.findUnique({
        where: { id: todo.id },
      });
      expect(deleted).toBeNull();
    });
  });
});