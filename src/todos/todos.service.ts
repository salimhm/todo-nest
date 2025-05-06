import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto, UpdateTodoDto } from './dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

interface GetTodosParams {
    page: number;
    limit: number;
    completed?: boolean;
}

@Injectable()
export class TodosService {
    constructor(
        private prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    private getTodoCacheKey(userId: number, todoId?: number): string {
        return todoId ? `user:${userId}:todo:${todoId}` : `user:${userId}:todos`;
    }

    async getTodos(userId: number, params: GetTodosParams) {
        const page = Number(params.page);
        const limit = Number(params.limit);

        const cacheKey = this.getTodoCacheKey(userId);
        const cached = await this.cacheManager.get<{ data: any; total: number }>(cacheKey);

        if (cached) {
            console.log(`Cache hit for key: ${cacheKey}`);
            return cached;
        }

        console.log(`Cache miss for key: ${cacheKey}`);
        const [data, total] = await Promise.all([
            this.prisma.todo.findMany({
                where: { userId, completed: params.completed },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.todo.count({
                where: { userId, completed: params.completed },
            }),
        ]);

        const result = { data, total };
        await this.cacheManager.set(cacheKey, result, 3600);
        return result;
    }


    async createTodo(userId: number, dto: CreateTodoDto) {
        const todo = await this.prisma.todo.create({
            data: { userId, ...dto },
        });
        await this.cacheManager.del(this.getTodoCacheKey(userId));
        return todo;
    }

    async updateTodo(userId: number, todoId: number, dto: UpdateTodoDto) {
        const todo = await this.prisma.todo.update({
            where: { id: todoId },
            data: dto,
        });
        await Promise.all([
            this.cacheManager.del(this.getTodoCacheKey(userId, todoId)),
            this.cacheManager.del(this.getTodoCacheKey(userId)),
        ]);
        return todo;
    }

    async deleteTodo(userId: number, todoId: number) {
        await this.prisma.todo.delete({ where: { id: todoId } });
        await Promise.all([
            this.cacheManager.del(this.getTodoCacheKey(userId, todoId)),
            this.cacheManager.del(this.getTodoCacheKey(userId)),
        ]);
    }

    async getTodoStatistics(userId: number) {
        const [total, completed] = await Promise.all([
            this.prisma.todo.count({ where: { userId } }),
            this.prisma.todo.count({ where: { userId, completed: true } }),
        ]);

        return {
            total,
            completed,
            pending: total - completed,
            completionRate: total > 0 ? (completed / total) * 100 : 0,
        };
    }
}