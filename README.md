# Authentication API with JWT Access and Refresh Tokens

A Node.js-based authentication API using Express, MongoDB, and JWT for secure user registration, login, OTP verification, and token management. This API follows the MVC architecture with routes for user signup, OTP verification, login, token refresh, and access to protected routes.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Folder Structure](#folder-structure)
- [Endpoints](#endpoints)
  - [1. Signup](#1-signup)
  - [2. Verify OTP](#2-verify-otp)
  - [3. Resend OTP](#3-resend-otp)
  - [4. Login](#4-login)
  - [5. Refresh Token](#5-refresh-token)
  - [6. Protected Route](#6-protected-route)
- [Testing the API](#testing-the-api)
- [Troubleshooting](#troubleshooting)
- [Notes](#notes)

---

## Prerequisites

- [Node.js](https://nodejs.org/) installed.
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and cluster.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd authentication-api
   ```

````

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables in a `.env` file (see [Environment Variables](#environment-variables)).

4. Start the server:
   ```bash
   npm run dev
   ```
   For production:
   ```bash
   npm start
   ```

The server should start on `http://localhost:5000` by default.

---

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```plaintext
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_access_token_secret_key
JWT_REFRESH_SECRET=your_refresh_token_secret_key
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
PORT=5000
```

---

## Folder Structure

```
authentication-api/
│
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   └── authController.js      # Business logic for authentication
├── models/
│   └── User.js                # User schema
├── routes/
│   └── authRoutes.js          # Authentication routes
├── middlewares/
│   └── authMiddleware.js      # Authentication middleware
├── utils/
│   └── otpGenerator.js        # OTP generation
├── .env                       # Environment variables
├── server.js                  # Entry point
└── README.md                  # Documentation
```

---

## Endpoints

### 1. Signup

- **URL**: `/api/auth/signup`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "OTP sent successfully. Check console for OTP."
  }
  ```

### 2. Verify OTP

- **URL**: `/api/auth/verify-otp`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "message": "OTP verified successfully and user registered"
  }
  ```

### 3. Resend OTP

- **URL**: `/api/auth/resend-otp`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "message": "OTP resent successfully. Check console for OTP."
  }
  ```

### 4. Login

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login successful",
    "accessToken": "<jwt_access_token>",
    "refreshToken": "<jwt_refresh_token>"
  }
  ```

### 5. Refresh Token

- **URL**: `/api/auth/refresh-token`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "refreshToken": "<your_refresh_token>"
  }
  ```
- **Response**:
  ```json
  {
    "accessToken": "<new_access_token>"
  }
  ```

### 6. Protected Route

- **URL**: `/api/auth/protected`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <jwt_access_token>`
- **Response**:
  ```json
  {
    "message": "You have accessed a protected route!"
  }
  ```

---

## Testing the API

Use tools like [Postman](https://www.postman.com/) or `curl` for testing.

---

## Troubleshooting

1. **MongoDB Connection**:

   - Verify `MONGO_URI` in `.env` and ensure access on MongoDB Atlas.

2. **JWT Errors**:

   - Check the `Authorization` header for the correct token.

3. **OTP Expiration**:
   - Request a new OTP if expired.

---

## Notes

- **Temporary Storage**: Consider using Redis for OTPs in production.
- **Security**: Secure your `.env` file.

---
````
