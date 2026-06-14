# Production-Ready Express.js Backend Boilerplate with TypeScript and Prisma

This is a highly scalable, robust, and production-ready Express.js backend starter kit built with modern **TypeScript**, **ES Modules/Imports**, and **Prisma ORM**. It implements a solid modular architecture, strict API versioning, deep separation of concerns, and industry-standard security features.

---

## 🚀 Key Features

*   **Modular Architecture:** Designed to keep code organized by domains (`auth`, `users`), facilitating easier scaling and code readability.
*   **TypeScript (Node16 standard):** Strong, clean type-safety across controllers, services, database models, and custom Request payloads.
*   **Database Management (Prisma):** Clean and high-performance database layer with type-safe queries, transaction support, and seamless migrations.
*   **Request Validation (Zod):** Strict, runtime validation of Request bodies, queries, and parameters.
*   **Robust Security:**
    *   **Helmet:** Secure HTTP headers.
    *   **CORS:** Cross-Origin Resource Sharing enablement.
    *   **Rate Limiting:** Protect endpoints against brute-force/DDOS attacks.
    *   **JWT Authentication:** Stateless, signed sessions via JWT stored inside `Authorization` headers or secure `httpOnly` cookies.
    *   **Password Hashing:** Strong password encryption using `bcryptjs`.
*   **Clean Error Handling:** Centralized global error handling with a custom `AppError` class and automatic promise rejection handling in controllers.
*   **Performance Optimization:** Gzip compression middleware to reduce payload transfer size.
*   **Modern Logging:** Colorized console logging in development (Morgan dev) and standard detailed formats in production.

---

## 📁 Project Directory Structure

```text
src/
├── app.ts                  # Express application setup (middleware, endpoints mounting)
├── server.ts               # HTTP Server start, db connection, and graceful shutdown handling
├── config/                 # Application configuration & loaders
│   ├── env.ts              # Zod schema-backed environment variables validation
│   └── database.ts         # Prisma Client instantiation and db connection hook
├── common/                 # Shared helpers, types, and utilities
│   ├── helpers/
│   │   ├── async-handler.ts # Wrapper for catching async errors in controllers
│   │   └── response.ts     # Unified API response formatter (success/error)
│   ├── types/
│   │   └── index.ts        # Global Express.Request type extensions & SafeUser interface
│   └── utils/
│       └── app-error.ts    # Custom exception class for operational errors
├── middleware/             # Global / Route-level Express middlewares
│   ├── auth.middleware.ts  # Protected routes authentication check & user injection
│   ├── error.middleware.ts # Global error responder (parses Prisma, Zod, and JWT errors)
│   ├── validate.middleware.ts # Zod schema validator middleware for Express routes
│   └── rate-limit.middleware.ts # Brute force and rate limit middleware
├── routes/
│   └── index.ts            # Root API router (mounts modular routes)
└── modules/                # Core business domains (Modular Pattern)
    ├── auth/               # Authentication module
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── auth.route.ts
    │   ├── auth.validation.ts
    │   └── auth.types.ts
    └── users/              # Users management module
        ├── user.controller.ts
        ├── user.service.ts
        ├── user.route.ts
        ├── user.validation.ts
        └── user.types.ts
```

---

## 🛠 Setup & Installation

### Prerequisites
*   Node.js (v18 or higher recommended)
*   A running database instance (PostgreSQL, MySQL, SQLite, etc.)

### 1. Clone & Install Dependencies
Navigate into the folder and run:
```bash
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file and create a `.env` file:
```bash
cp .env.example .env
```
Open `.env` and fill out your variables:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/express_ts_db?schema=public"
JWT_SECRET="your_super_secret_jwt_key_at_least_32_chars_long"
JWT_EXPIRES_IN="1d"
```

### 3. Setup Database Schema
Sync your database schema with Prisma:
```bash
# Generate the type-safe Prisma client
npm run prisma:generate

# Generate and apply migrations to your database
npm run prisma:migrate
```

---

## 🏃 Running the Application

### Development Mode (with Live Reloading)
```bash
npm run dev
```

### Production Build & Execution
```bash
# Compile TypeScript files to JavaScript inside /dist
npm run build

# Start the compiled server
npm run start
```

### Prisma Studio
Launch the Prisma GUI dashboard to inspect and manage database records:
```bash
npm run prisma:studio
```

---

## 📡 API Reference & Endpoints

| Endpoint | Method | Headers | Description | Protected |
| :--- | :--- | :--- | :--- | :--- |
| `/health` | `GET` | None | Verify server health status | ❌ No |
| `/api/v1/auth/register` | `POST` | None | Register a new user | ❌ No |
| `/api/v1/auth/login` | `POST` | None | Login user & retrieve token | ❌ No |
| `/api/v1/auth/profile` | `GET` | Bearer Token / Cookie | Retrieve current user profile |   Yes |
| `/api/v1/users` | `GET` | Bearer Token / Cookie | Retrieve a list of all users |   Yes |
| `/api/v1/users/:id` | `GET` | Bearer Token / Cookie | Retrieve user details by ID |   Yes |
| `/api/v1/users/:id` | `PUT` | Bearer Token / Cookie | Update user properties by ID |   Yes |
| `/api/v1/users/:id` | `DELETE` | Bearer Token / Cookie | Delete a user profile by ID |   Yes |

---

## 🔍 Advanced Querying (Filtering, Sorting, Pagination)

This boilerplate includes a powerful `PrismaQueryBuilder` that automatically parses query parameters into Prisma options. You can use these features on `GET` list endpoints (e.g., `/api/v1/users`, `/api/v1/kosts`).

### 1. Pagination (`page` & `limit`)
By default, the API returns page 1 with 10 items.
```http
GET /api/v1/kosts?page=2&limit=5
```
**Response Meta Data:**
```json
"meta": {
  "results": 5,
  "total": 50,
  "page": 2,
  "limit": 5,
  "totalPages": 10
}
```

### 2. Sorting (`sort`)
Prefix with `-` for descending order.
```http
GET /api/v1/kosts?sort=-createdAt,name
```

### 3. Field Selection (`fields`)
Return only specific columns.
```http
GET /api/v1/kosts?fields=id,name,city
```

### 4. Relations / Include (`include`)
Fetch related data.
```http
GET /api/v1/kosts?include=owner,rooms
```
> **💡 Pro Tip for Frontend:** 
> If you only need specific fields from a relation, use `fields` with dot notation (e.g., `fields=owner.name`). You **DO NOT** need to pass `include=owner`. Prisma will automatically join the table and return a smaller payload!

### 5. Advanced Filtering (Prisma Operators)
Use standard Prisma operators like `contains`, `gte`, `lte`, `in`, `notIn`.
```http
# Exact match
GET /api/v1/kosts?city=Bandung&type=MALE

# Text Search
GET /api/v1/kosts?name[contains]=Jaya

# Greater than / Less than
GET /api/v1/rooms?price[gte]=1000000&price[lte]=2000000
```

---

## 📝 Example Request & Response Payloads

### 1. User Registration (`POST /api/v1/auth/register`)
**Request Body:**
```json
{
  "email": "jane.doe@example.com",
  "password": "strongPassword123",
  "name": "Jane Doe"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "8b5f385c-1b77-4bde-8f83-d9d1c9535de4",
      "email": "jane.doe@example.com",
      "name": "Jane Doe",
      "createdAt": "2026-05-20T07:44:00.000Z",
      "updatedAt": "2026-05-20T07:44:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. User Login (`POST /api/v1/auth/login`)
**Request Body:**
```json
{
  "email": "jane.doe@example.com",
  "password": "strongPassword123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "8b5f385c-1b77-4bde-8f83-d9d1c9535de4",
      "email": "jane.doe@example.com",
      "name": "Jane Doe",
      "createdAt": "2026-05-20T07:44:00.000Z",
      "updatedAt": "2026-05-20T07:44:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get User Profile (`GET /api/v1/auth/profile`)
**Headers:**
`Authorization: Bearer <your-jwt-token>`

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "8b5f385c-1b77-4bde-8f83-d9d1c9535de4",
      "email": "jane.doe@example.com",
      "name": "Jane Doe",
      "createdAt": "2026-05-20T07:44:00.000Z",
      "updatedAt": "2026-05-20T07:44:00.000Z"
    }
  }
}
```

### 4. Update User Profile (`PUT /api/v1/users/:id`)
**Headers:**
`Authorization: Bearer <your-jwt-token>`

**Request Body:**
```json
{
  "name": "Jane Doe Smith",
  "password": "newStrongPassword456"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": "8b5f385c-1b77-4bde-8f83-d9d1c9535de4",
      "email": "jane.doe@example.com",
      "name": "Jane Doe Smith",
      "createdAt": "2026-05-20T07:44:00.000Z",
      "updatedAt": "2026-05-20T07:44:15.000Z"
    }
  }
}
```

### 5. Error Validation Response Example (400 Bad Request)
**Response Body:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.email",
      "message": "Invalid email address"
    },
    {
      "field": "body.password",
      "message": "Password must be at least 6 characters long"
    }
  ]
}
```

---

## 📜 License
This boilerplate is open-source software licensed under the [MIT License](LICENSE).
