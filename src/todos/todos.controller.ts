import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
    DefaultValuePipe
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto, UpdateTodoDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('todos')
@UseGuards(AuthGuard('jwt'))
export class TodosController {
    constructor(private todosService: TodosService) { }


    @Get()
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getTodos(
        @GetUser('id') userId: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('completed') completed?: boolean
    ) {
        const { data, total } = await this.todosService.getTodos(userId, {
            page,
            limit,
            completed: completed ? completed : undefined
        });

        return {
            statusCode: HttpStatus.OK,
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }


    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createTodo(
        @GetUser('id') userId: number,
        @Body() dto: CreateTodoDto
    ) {
        const todo = await this.todosService.createTodo(userId, dto);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Todo created',
            data: todo
        };
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async updateTodo(
        @GetUser('id') userId: number,
        @Param('id') id: string,
        @Body() dto: UpdateTodoDto
    ) {
        const todo = await this.todosService.updateTodo(userId, +id, dto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Todo updated',
            data: todo
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteTodo(
        @GetUser('id') userId: number,
        @Param('id') id: string
    ) {
        await this.todosService.deleteTodo(userId, +id);
        return {
            statusCode: HttpStatus.NO_CONTENT
        };
    }
}