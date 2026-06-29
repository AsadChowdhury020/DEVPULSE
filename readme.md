# 🚀 DevPulse - Internal Tech Issue & Feature Tracker (Backend)

DevPulse is a backend REST API built for managing internal software issues and feature requests. It allows contributors to report issues and maintainers to manage the issue lifecycle through secure authentication and role-based authorization.

---

## 🌐 Live API

> https://dev-pulse-eight-ruddy.vercel.app/

---

## 📂 GitHub Repository

> https://github.com/AsadChowdhury020/DEVPULSE

---

# 🛠️ Technology Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT Authentication
- bcrypt
- Raw SQL (pg)
- dotenv
- cookie-parser
- cors

---

# ✨ Features

- User Registration
- User Login
- JWT Authentication
- Refresh Token Support
- Role-Based Authorization
- Issue CRUD Operations
- Dynamic Filtering
- Sorting
- PostgreSQL Database
- Secure Password Hashing
- RESTful API
- Modular Folder Structure
- Raw SQL Queries (No ORM)

---

# 👥 User Roles

## Contributor

- Register/Login
- Create Issues
- View Issues
- Update Own Open Issues

## Maintainer

- Everything Contributor Can Do
- Update Any Issue
- Change Issue Status
- Delete Any Issue

---

# 📦 Installation

Clone the repository

```bash
git clone https://github.com/AsadChowdhury020/DEVPULSE.git
```

Move into the project

```bash
cd DEVPULSE
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Build project

```bash
npm run build
```

Run production

```bash
npm start
```

---

# ⚙️ Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000

DATABASE_URL=your_database_url

JWT_ACCESS_SECRET=your_access_secret

JWT_ACCESS_EXPIRES_IN=1d

JWT_REFRESH_SECRET=your_refresh_secret

JWT_REFRESH_EXPIRES_IN=30d

```

---

# 📁 Project Structure

```
src
│
├── app
│   ├── config
│   ├── database
│   ├── middleware
│   ├── utility
│   │
│   ├── modules
│   │
│   │── auth
│   │── issue
│   │── user
│
├── app.ts
├── server.ts
```

---

# 🔑 Authentication

The API uses

- JWT Access Token
- Refresh Token
- HTTP Only Cookies

Protected routes require

```
Authorization: Bearer <access_token>
```

---

# 📌 API Endpoints

---

# 🔑 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login/access_token` | Login user and generate an access token |
| POST | `/api/login/refresh_token` | Generate a new access token using a refresh token |

---

## Users

| Method | Endpoint |
|----------|----------------|
| GET | /api/users |
| GET | /api/users/:id |
| PATCH | /api/users/:id |
| DELETE | /api/users/:id |

---

## Issues

| Method | Endpoint |
|----------|----------------|
| POST | /api/issues |
| GET | /api/issues |
| GET | /api/issues/:id |
| PUT | /api/issues/:id |
| DELETE | /api/issues/:id |
| GET | /api/issues/user |

---

# 🔍 Query Parameters

Get All Issues

```
GET /api/issues
```

Available Query Parameters

| Parameter | Values |
|------------|----------------------------|
| sort | newest, oldest |
| type | bug, feature_request |
| status | open, in_progress, resolved |

Example

```
GET /api/issues?sort=newest

GET /api/issues?type=bug

GET /api/issues?status=open

GET /api/issues?type=bug&status=open&sort=oldest
```

---

# 🔒 Security

- Password Hashing using bcrypt
- JWT Authentication
- Role-Based Authorization
- SQL Injection Prevention using Parameterized Queries
- HTTP Only Refresh Token Cookies
- Environment Variables for Sensitive Data

---

# 📖 Database

## Users Table

- id
- name
- email
- password
- role
- created_at
- updated_at

---

## Issues Table

- id
- title
- description
- type
- status
- reporter_id
- created_at
- updated_at

---

# 📌 HTTP Status Codes

| Status | Meaning |
|----------|----------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |
