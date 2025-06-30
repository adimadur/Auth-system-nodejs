# Auth System Node.js

A secure, production-ready Node.js authentication system built with Express, MongoDB, and JWT. This system provides comprehensive user authentication and authorization features with industry-standard security practices.

## 🚀 Features

- **User Authentication**: Signup, login, and password management
- **Role-Based Authorization**: User and Admin roles with middleware protection
- **Security Features**: 
  - Password hashing with bcrypt
  - JWT token authentication
  - Rate limiting
  - Input validation
  - CORS protection
  - Security headers with Helmet
- **Database**: MongoDB with Mongoose ODM
- **Logging**: Winston logger with file and console output
- **Error Handling**: Comprehensive error handling with custom error classes
- **API Documentation**: Complete API endpoints documentation

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auth-system-nodejs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGOURL=mongodb://localhost:27017/auth-system
   JWTSECRETKEY=your-super-secret-jwt-key-here
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### 1. User Registration
```http
POST /auth/signup
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePass123!",
  "age": 25
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "User",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

#### 2. User Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "User"
  },
  "token": "jwt_token_here"
}
```

#### 3. Get Current User Profile
```http
GET /auth/me
Authorization: Bearer <token>
```

#### 4. Update User Profile
```http
PUT /auth/update-profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "email": "john.updated@example.com",
  "age": 26
}
```

#### 5. Change Password
```http
PUT /auth/change-password
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

### Admin Endpoints

#### 6. Get All Users (Admin Only)
```http
GET /auth/users?page=1&limit=10&role=User&search=john
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Users per page (default: 10)
- `role`: Filter by role (User/Admin)
- `search`: Search in username, firstName, lastName, email

#### 7. Delete User (Admin Only)
```http
DELETE /auth/delete/:id
Authorization: Bearer <admin_token>
```

### Health Check
```http
GET /health
```

## 🔐 Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### Rate Limiting
- General API: 100 requests per 15 minutes per IP
- Authentication endpoints: 5 requests per 15 minutes per IP

### JWT Token
- Expires in 1 day (configurable)
- Contains user ID, role, and username
- Automatically invalidated on password change

## 🏗️ Project Structure

```
auth-system-nodejs/
├── config/
│   └── connectToDb.js          # Database connection
├── controllers/
│   └── userController.js       # User business logic
├── middlewares/
│   ├── errorHandler.js         # Error handling middleware
│   ├── roleMiddleware.js       # Authentication & authorization
│   └── validationMiddleware.js # Input validation
├── models/
│   └── userModel.js           # User data model
├── routes/
│   └── userRoutes.js          # API routes
├── utils/
│   └── logger.js              # Logging utility
├── logs/                      # Log files (auto-generated)
├── index.js                   # Server entry point
├── package.json
└── README.md
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Scripts

```bash
# Development
npm run dev          # Start with nodemon

# Production
npm start           # Start production server

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode

# Code Quality
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm run format      # Format code with Prettier
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `MONGOURL` | MongoDB connection URL | Required |
| `JWTSECRETKEY` | JWT secret key | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `1d` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |
| `LOG_LEVEL` | Logging level | `info` |

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

## 📊 Logging

Logs are written to:
- Console (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (error logs only)

## 🔄 Database Schema

### User Model
```javascript
{
  firstName: String (required, 2-50 chars, letters only),
  lastName: String (required, 2-50 chars, letters only),
  age: Number (optional, 13-120),
  role: String (enum: ["User", "Admin"], default: "User"),
  username: String (required, unique, 3-30 chars, alphanumeric + underscore),
  email: String (required, unique, valid email),
  password: String (required, min 8 chars, hashed),
  isActive: Boolean (default: true),
  lastLogin: Date,
  passwordChangedAt: Date,
  timestamps: true
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository. 