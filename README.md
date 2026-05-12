# Tasks Manager API

A RESTful API built to manage teams and tasks in a simple, secure, and scalable way.

This project was developed using Node.js, TypeScript, Express, Prisma ORM, and PostgreSQL, following clean architecture principles and backend best practices.

---

# Features

* User registration and authentication
* JWT authentication
* Role-based authorization
* Team creation and management
* Team member management
* Task creation, updating, listing, and deletion
* Task status and priority control
* Data validation and error handling
* Automated integration tests

---

# Technologies

* Node.js
* TypeScript
* Express
* Prisma ORM
* PostgreSQL
* JWT
* Vitest
* Supertest

---

# Project Structure

```bash
src/
├── config/
├── controllers/
├── database/
├── middlewares/
├── routes/
├── tests/
├── types/
├── utils/
└── app.ts
└── env.ts
└── server.ts
```

---

# Installation

Clone the repository:

```bash
git clone https://github.com/your-username/tasks-manager-api.git
```

Access the project folder:

```bash
cd tasks-manager-api
```

Install dependencies:

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="your_database_url"
JWT_SECRET="your_secret_key"
PORT=3333
```

---

# Database

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

---

# Running the Project

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

---

# Running Tests

Run automated tests:

```bash
npm run test
```

Watch mode:

```bash
npm run test:dev
```

---

# API Endpoints

## Users

* `POST /users`
* `POST /sessions`

## Teams

* `POST /teams`
* `GET /teams`
* `PATCH /teams/:team_id/update`
* `DELETE /teams/:team_id/remove`

## Team Members

* `POST /team-members`
* `REMOVE /team-members/:team_id`
* `GET /team-members/:team_id`

## Tasks

* `POST /tasks`
* `PATCH /tasks/:task_id/update`
* `PATCH /tasks/:task_id/assign`
* `DELETE /tasks/:task_id/remove`
* `GET /tasks/list`
* `GET /tasks/:task_id/history`

---

# Authentication

This API uses JWT authentication.

Send the token in the Authorization header:

```http
Authorization: Bearer your_token
```

---

# Tests

The project contains integration tests built with:

* Vitest
* Supertest

---

# Author

Developed by Juan Mafra.
Software Engineering Student | Fullstack Developer
