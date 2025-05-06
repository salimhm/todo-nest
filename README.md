# Todo App API

- Clone the repo
- in the root folder, run: ```docker compose up --build```

## Features

- JWT Authentication
- Redis Caching
- Paginated Todo Lists
- User Profile Management
- Docker Support

## API Documentation

### Authentication

#### Register User
`POST /auth/register`

```http
POST /auth/register HTTP/1.1
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```
#### Success Response:

```http
{
  "statusCode": 201,
  "message": "Registration successful",
  "data": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "expires_in": 3600
  }
}
```

#### Login User
```http
POST /auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Success Response:
```http
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "expires_in": 3600
  }
}
```

### Todos
#### Get Todos

Query Parameters:

| Parameter  | Type     | Default | Description          |
|------------|----------|---------|----------------------|
| `page`     | integer  | `1`     | Page number          |
| `limit`    | integer  | `10`    | Items per page       |
| `completed`| boolean  | -       | Filter by completion |

Example
```http
GET /todos?page=1&limit=5&completed=false HTTP/1.1
Authorization: Bearer <access_token>
```

#### Success Response:
```http
{
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "title": "Buy groceries",
      "completed": false,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 5,
    "totalPages": 1
  }
}
```

#### Create Todo
```http
POST /todos HTTP/1.1
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Finish project",
  "description": "Complete the API documentation"
}
```

#### Success Response:
```http
{
  "statusCode": 201,
  "message": "Todo created",
  "data": {
    "id": 2,
    "title": "Finish project",
    "description": "Complete the API documentation",
    "completed": false,
    "userId": 1,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Profile
#### Get Profile
```http
GET /profile HTTP/1.1
Authorization: Bearer <access_token>
```

#### Success Response:
```http
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com"
}
```

