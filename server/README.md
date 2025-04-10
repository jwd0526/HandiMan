# HandiMan Golf Tracker Server

## Simulation Scripts

This server includes scripts to generate test data for development purposes.

### Generate Test Courses

To generate a set of predefined golf courses:

```bash
npm run simulate:courses [user_email] [force]
```

Parameters:
- `user_email`: Email of the user who will be set as the creator (default: test@example.com)
- `force`: Add "force" as the second parameter to override existing courses

Example:
```bash
npm run simulate:courses user@example.com force
```

### Generate Test Rounds

To generate random golf rounds for a user:

```bash
npm run simulate:rounds [user_email] [count]
```

Parameters:
- `user_email`: Email of the user to generate rounds for (default: test@example.com)
- `count`: Number of rounds to generate (default: 20)

Example:
```bash
npm run simulate:rounds user@example.com 30
```

## API Routes

### Authentication
- `POST /api/auth/signup`: Create a new user account
- `POST /api/auth/login`: Log in an existing user
- `GET /api/auth/validate-token`: Validate a JWT token
- `POST /api/auth/logout`: Log out a user

### Courses
- `GET /api/courses`: Get all courses
- `GET /api/courses/:id`: Get a specific course
- `POST /api/courses`: Create a new course
- `PUT /api/courses/:id`: Update a course
- `DELETE /api/courses/:id`: Delete a course
- `GET /api/courses/search`: Search for courses

### Rounds
- `GET /api/rounds`: Get all rounds for the authenticated user
- `GET /api/rounds/:id`: Get a specific round
- `POST /api/rounds`: Create a new round
- `PUT /api/rounds/:id`: Update a round
- `DELETE /api/rounds/:id`: Delete a round