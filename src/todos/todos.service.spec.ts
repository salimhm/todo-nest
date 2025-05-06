import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from './todos.service';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateTodoDto, UpdateTodoDto } from './dto';

describe('TodosService', () => {
  let service: TodosService;
  let prisma: PrismaService;
  let cacheManager: any;

  beforeEach(async () => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: PrismaService,
          useValue: {
            todo: {
              findMany: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getTodos', () => {
    it('should return cached data if available', async () => {
      const cachedData = { data: ['todo1', 'todo2'], total: 2 };
      cacheManager.get.mockResolvedValue(cachedData);

      const result = await service.getTodos(1, { page: 1, limit: 10 });
      expect(result).toEqual(cachedData);
      expect(prisma.todo.findMany).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache when no cache', async () => {
      const dbData = [{ id: 1, title: 'Test' }];
      const total = 1;
      cacheManager.get.mockResolvedValue(null);
      jest.spyOn(prisma.todo, 'findMany').mockResolvedValue(dbData as any);
      jest.spyOn(prisma.todo, 'count').mockResolvedValue(total);

      const result = await service.getTodos(1, { page: 1, limit: 10 });
      expect(result).toEqual({ data: dbData, total });
      expect(cacheManager.set).toHaveBeenCalled();
    });
  });

  describe('createTodo', () => {
    it('should create a new todo and clear cache', async () => {
      const dto: CreateTodoDto = { title: 'New Todo', description: 'Test' };
      const todo = { id: 1, userId: 1, ...dto };
      jest.spyOn(prisma.todo, 'create').mockResolvedValue(todo as any);

      const result = await service.createTodo(1, dto);
      expect(result).toEqual(todo);
      expect(cacheManager.del).toHaveBeenCalled();
    });
  });

  describe('updateTodo', () => {
    it('should update a todo and clear cache', async () => {
      const dto: UpdateTodoDto = { title: 'Updated Todo' };
      const todo = { id: 1, userId: 1, title: dto.title };
      jest.spyOn(prisma.todo, 'update').mockResolvedValue(todo as any);

      const result = await service.updateTodo(1, 1, dto);
      expect(result).toEqual(todo);
      expect(cacheManager.del).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo and clear cache', async () => {
      jest.spyOn(prisma.todo, 'delete').mockResolvedValue({} as any);
      await service.deleteTodo(1, 1);
      expect(prisma.todo.delete).toHaveBeenCalled();
      expect(cacheManager.del).toHaveBeenCalledTimes(2);
    });
  });

  describe('getTodoStatistics', () => {
    it('should return correct statistics', async () => {
      jest.spyOn(prisma.todo, 'count')
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(6);

      const result = await service.getTodoStatistics(1);
      expect(result).toEqual({
        total: 10,
        completed: 6,
        pending: 4,
        completionRate: 60,
      });
    });
  });
});