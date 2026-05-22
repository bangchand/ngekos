# Backend Express Project AI Rules

## Response Format
Always return API responses using this structure:

{
  "status": true | false,
  "message": "Readable message",
  "data": null | object | array
}

Success example:
{
  "status": true,
  "message": "User fetched successfully",
  "data": user
}

Error example:
{
  "status": false,
  "message": "User not found",
  "data": null
}

## Imports
Always use path aliases instead of relative imports.

Correct:
import userService from "@/services/user.service";

Wrong:
import userService from "../../../services/user.service";

## Routes
Separate routes into public and protected routes.

Public routes:
- Do not require token
- Example: login, register, forgot password

Protected routes:
- Must use auth middleware
- Example: profile, update user, logout

Example:
router.use("/public", publicRoutes);
router.use("/protected", authMiddleware, protectedRoutes);

## Folder Structure
Use this structure:

src/
  config/
  controllers/
  middlewares/
  routes/
  services/
  repositories/
  validators/
  utils/
  types/
  app.ts
  server.ts

## Controller Rules
Controllers should only handle:
- request input
- validation result
- calling service
- sending response

Do not put business logic in controllers.

## Service Rules
Services contain business logic.

Services should:
- call repositories
- process data
- throw meaningful errors
- not directly use req or res

## Repository Rules
Repositories handle database queries only.

Do not put validation or business logic in repositories.

## Error Handling
Use centralized error handling middleware.

Never repeat try-catch response logic everywhere unless needed.

## Validation
Validate request body, params, and query before reaching service logic.

Use schema validation such as Zod, Joi, or express-validator.

## Naming Convention
Use consistent naming:

Controllers:
user.controller.ts

Services:
user.service.ts

Routes:
user.route.ts

Middlewares:
auth.middleware.ts

Validators:
user.validator.ts

## HTTP Status Codes
Use correct status codes:

200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
422 Validation Error
500 Internal Server Error

## Auth Rules
Protected routes must verify token before controller logic.

Never trust user_id from request body.
Always get authenticated user from token/session.

## Environment Variables
Never hardcode secrets, URLs, ports, or credentials.

Use:
process.env.JWT_SECRET
process.env.DATABASE_URL

## Code Style
Write clean, readable TypeScript.

Prefer:
- async/await
- named functions
- early returns
- small functions
- reusable helpers

Avoid:
- deeply nested code
- duplicated response objects
- relative import paths
- business logic inside routes

## AI Behavior
When generating code:
- Follow existing project structure
- Use `@/` imports
- Return standardized response format
- Separate public and protected routes
- Add validation when needed
- Keep code scalable
- Explain only important changes