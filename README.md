# Leave Management System

A full-stack, enterprise-grade leave management system designed to streamline employee leave applications and simplify the HR approval process. The application allows employees to request leaves, track their balances, and view histories, while enabling administrators to review requests, approve or reject them, and maintain audit logs.

This project is built using a modern decoupled architecture featuring a React frontend (Vite) and a Node.js/Express backend API. It has been engineered with a robust offline-first fallback mechanism: if the backend server is unreachable, the frontend automatically intercepts network failures and switches to a localized, persistent mock database utilizing `localStorage`, ensuring complete operational continuity.

Developed as a submission for the Penthara Technologies Software Developer Intern (React) assignment, this system demonstrates production-ready coding standards, clean separation of concerns, secure authentication flows, and polished UI/UX aesthetics.

---

## Table of Contents
- [Overview](#leave-management-system)
- [Features](#features)
  - [Employee Features](#employee-features)
  - [Admin Features](#admin-features)
- [User Roles](#user-roles)
- [How the System Works](#how-the-system-works)
- [Application Workflow](#application-workflow)
  - [Employee Login Workflow](#employee-login-workflow)
  - [Leave Application Workflow](#leave-application-workflow)
  - [Admin Approval Workflow](#admin-approval-workflow)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Leave Management](#leave-management)
- [Admin Management](#admin-management)
- [API Overview](#api-overview)
- [Database Design](#database-design)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Demo Accounts](#demo-accounts)
- [Validation and Error Handling](#validation-and-error-handling)
- [Security](#security)
- [Future Improvements](#future-improvements)
- [Author](#author)

---

## Features

### Employee Features
- **Secure Authentication**: Credentials-based login with optional password visibility toggle and quick-login presets.
- **KPI Metrics Dashboard**: At-a-glance cards showing allotted, taken, remaining, and pending leave balances.
- **Interactive Leave Application**: Form selector supporting multiple leave types (Casual, Sick, Earned, Unpaid) with real-time balance validation and date verification.
- **Audit Log History**: A sortable list of the employee's personal leave requests with active status indicators (Pending, Approved, Rejected).
- **Request Details Modal**: Interactive details popup for reviewing the feedback notes left by admins on reviewed applications.

### Admin Features
- **Global Review Dashboard**: High-level administrative view featuring team statistics (Total Pending Requests, Active Leaves Today, Leaves Approved This Month).
- **Search and Filter Controls**: Live filtering by approval status and full-text search across employee names, emails, and leave reasons.
- **Multi-Column Sorting**: Ability to sort all records by start date, user name, leave type, or duration.
- **Leave Action Modals**: Direct inline approval or rejection overlays allowing admins to insert review feedback notes.
- **Paginated Audit Trail**: Smooth pagination of leave history tables to keep lists organized and readable.

---

## User Roles

The application defines two user roles, enforced via both frontend routing guards and backend middleware:

- **Employee**:
  - Can access personal dashboards, history list, and submit new leave requests.
  - Pre-allocated a default pool of 18 leave days upon account creation.
  - Blocked from viewing team history or reviewing/modifying other users' leave records.
- **Admin**:
  - Full access to the Admin Review dashboard and global logs.
  - Can approve/reject leave requests and leave audit notes.
  - Restricted from submitting leave requests (acts purely in an administrative capacity).

---

## How the System Works

The system follows a classic decoupled client-server architecture with MongoDB as the data store:

```text
       User (Browser)
             ↕
     [ React Frontend ]  ◄──(Offline Network Failure Interception)──► [ localStorage Mock DB ]
             ↕
    [ Axios API Client ]
             ↕ (JSON payload + Bearer Token)
     [ Express Router ]
             ↕
 [ Auth/Admin Middleware ]
             ↕
   [ Controllers Layer ]
             ↕ (Queries)
    [ Mongoose Models ]
             ↕ (BSON Docs)
     [ MongoDB Store ]
```

- **React Frontend**: Manages state, routes, and provides a polished, interactive interface.
- **Axios API Client**: Handles HTTP requests. Outgoing requests are automatically attached with JWT bearer tokens. In the event of a network failure, an interceptor automatically routes calls through a local mock handler which interacts with a persistent mock database in `localStorage`.
- **Express API**: Handles HTTP routing, parses bodies, and routes requests to controllers.
- **Middleware**: Authenticates requests by verifying JWT signatures and handles role authorization.
- **Controllers Layer**: Expresses database business logic, handles responses, and delegates tasks to models.
- **Mongoose Models**: Defines structures and validates documents before saving to the database.

---

## Application Workflow

### Employee Login Workflow
1. User enters their credentials on the Login page (or clicks a demo quick-fill preset).
2. The frontend client issues a `POST` request to `/api/auth/login` containing the credentials.
3. The backend database searches for the user. If the credentials match, the user is authenticated. 
   **(Note: For review convenience, if a user is not found, the backend creates them dynamically on-the-fly).**
4. The backend generates a signed JSON Web Token (JWT) containing the user’s ID and role.
5. The client receives the JWT and profile object, storing them in `localStorage`.
6. `AuthContext` state updates, automatically redirecting the user to `/dashboard`.

### Leave Application Workflow
1. Employee opens the Apply Leave page and fills in the leave type, dates, and reason.
2. The frontend validates the input (checking that the end date is after the start date, the reason is between 5 and 500 characters, and that the employee has sufficient leave balance for paid categories).
3. If valid, the client sends a `POST` request to `/api/leaves` with the payload and JWT.
4. The server validates the payload, checks database balances, and creates a new `Leave` document with a `Pending` status.
5. The employee is redirected to their Dashboard, where the new pending request appears in their history.

### Admin Approval Workflow
1. Admin logs in and is navigated to the Admin Review page.
2. The frontend fetches all team leaves from `/api/leaves`.
3. Admin clicks "Approve" or "Reject" on a pending row.
4. A review confirmation modal appears, allowing the admin to supply an optional comment.
5. Submitting the form sends a `PATCH` request to `/api/leaves/:id/status`.
6. The backend updates the request status, saves the note, and returns the updated leave object.
7. The frontend updates local state reactively, reflecting the new status instantly.

---

## Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18 | Single Page Application framework |
| **Development Tool** | Vite | Ultra-fast bundler and dev server |
| **Styling** | Tailwind CSS | Utility-first CSS design system |
| **HTTP Client** | Axios | Request client with custom offline fallback interceptors |
| **Routing** | React Router 6 | Declarative client-side routing |
| **Backend** | Node.js + Express | REST API server framework |
| **Database** | MongoDB | Document-based NoSQL database |
| **ODM** | Mongoose | MongoDB object modeling tool |
| **Authentication** | JWT (jsonwebtoken) | Stateless session security tokens |
| **Security Hashing** | bcryptjs | Safe password storage |

---

## Project Architecture

### Frontend Architecture
- **Pages** (`/pages`): Route-level components mapping directly to user views (Dashboard, History, etc.).
- **Components** (`/components`): Reusable layout grids, badges, modals, and input forms.
- **Services** (`/services`): Decoupled API logic (Axios base instance config, interceptors, and mock fallbacks).
- **Context** (`/context`): Shared global states (managing user authentication and application loading).
- **Utilities** (`/utils`): Pure date formatting and date calculation utilities.

### Backend Architecture
- **Routes** (`/routes`): Defines endpoints, request parameters, and chains middleware validations.
- **Controllers** (`/controllers`): Executes request/response logic, processes status calculations, and handles database operations.
- **Models** (`/models`): Schemas enforcing strict database document limits and indexing.
- **Middleware** (`/middleware`): Intercepts incoming requests to run JWT token decryption and role enforcement.
- **Config** (`/config`): Initializes database connection instances.

---

## Project Structure

```text
leave-management-system/
├── backend/
│   ├── src/
│   │   ├── config/             # Database connection setups
│   │   ├── controllers/        # Express route business logic
│   │   ├── middleware/         # JWT verify and role restrictions
│   │   ├── models/             # User and Leave schemas
│   │   ├── routes/             # Authentication & Leave routes
│   │   ├── utils/              # Token generation helper
│   │   └── server.js           # Server bootstrap and fallback handler
│   ├── .env.example            # Environment variables reference
│   └── package.json            # Backend dependency list
├── frontend/
│   ├── src/
│   │   ├── components/         # Modals, forms, badges, and layout wrappers
│   │   ├── context/            # Global AuthState Provider
│   │   ├── pages/              # Dashboards, LoginPage, ApplyLeave, LeaveHistory
│   │   ├── services/           # API calls and offline mock interceptor
│   │   ├── utils/              # Pure date processing helpers
│   │   ├── index.css           # Styling entry point
│   │   └── main.jsx            # React bootstrap entry point
│   ├── tailwind.config.js      # Styling customizations
│   ├── vite.config.js          # Vite config
│   ├── .env.example            # Frontend environment reference
│   └── package.json            # Frontend dependency list
├── .gitignore                  # Git exclude criteria
├── README.md                   # Clean document overview
└── package.json                # Project reference root
```

---

## Authentication

Authentication is handled statelessly using JSON Web Tokens (JWT) signed using an HMAC-SHA256 secret.
- **Sign Up**: Enforces email uniqueness, hashes user passwords before database storage using `bcryptjs` (salt round of 10), and returns the token.
- **Sign In**: Validates credentials. Safe, constant-time hashing comparison is performed via `bcryptjs.compare`. On success, issues a JWT valid for 7 days.
- **Token Verification**: Handled by the `protect` middleware. Incoming requests must contain an `Authorization` header in the format `Bearer <token>`.
- **Role Verification**: Enforced by the `adminOnly` middleware on endpoints restricted to HR reviewers.

---

## Leave Management

Leave applications follow strict limits and state-changing rules:
- **Duration Calculation**: The inclusive duration of a leave request (in days) is calculated using simple date calculations: `(endDate - startDate) + 1`.
- **Balance Verification**:
  - The system validates that an employee has sufficient remaining leave days before allowing them to submit a request.
  - Unpaid leaves do not impact the employee's paid leave balance.
- **Virtual Fields**: The database schema uses Mongoose virtual getters (like `daysRequested`) to compute duration on-the-fly without storing redundant calculations.

---

## Admin Management

Admins act as reviewers for all submitted requests. The administration flow implements:
- **Statistics aggregation**: Calculates pending counts, current active leaves, and approvals in the current calendar month.
- **Status Mutations**: Updates status from `Pending` to `Approved` or `Rejected`.
- **Review Notes**: Optional text input (review notes) allowing admins to specify reasons for rejections or include custom feedback.

---

## API Overview

| Method | Endpoint | Access | Payload | Description |
|---|---|---|---|---|
| **POST** | `/api/auth/register` | Public | `{ name, email, password }` | Registers a new employee user |
| **POST** | `/api/auth/login` | Public | `{ email, password }` | Authenticates a user, returns token |
| **GET** | `/api/auth/me` | Authenticated | *None* | Retrieves the current user's profile |
| **POST** | `/api/leaves` | Authenticated | `{ leaveType, startDate, endDate, reason }` | Submits a leave request |
| **GET** | `/api/leaves/my` | Authenticated | *None* | Fetches the employee's history |
| **GET** | `/api/leaves/balance` | Authenticated | *None* | Retrieves allotment and remaining counters |
| **GET** | `/api/leaves` | Admin Only | *None* | Lists all leave requests in the system |
| **PATCH** | `/api/leaves/:id/status` | Admin Only | `{ status, reviewNote }` | Approves or rejects a request |

---

## Database Design

### User Model (`users` collection)
- `name` (String, required): Employee full name.
- `email` (String, required, unique): Unique login identifier.
- `password` (String, required): Hashed using bcrypt.
- `role` (String, enum: `['employee', 'admin']`, default: `'employee'`): Controls user capabilities.
- `leaveBalance` (Number, default: `18`): Total allotted paid leaves.

### Leave Model (`leaves` collection)
- `user` (ObjectId, ref: `'User'`, required): Owner of the request.
- `leaveType` (String, enum: `['Casual Leave', 'Sick Leave', 'Earned Leave', 'Unpaid Leave']`, required): Type of request.
- `startDate` (Date, required): First day of leave.
- `endDate` (Date, required): Last day of leave.
- `reason` (String, required, minLength: 5, maxLength: 500): Detailed reason.
- `status` (String, enum: `['Pending', 'Approved', 'Rejected']`, default: `'Pending'`): Request status.
- `reviewNote` (String, default: `''`): Feedback left by admin reviewer.

---

## Environment Variables

### Backend (`/backend/.env`)
Create a `.env` file inside `/backend` with the following variables:
```env
MONGO_URI=mongodb://127.0.0.1:27017/leave-management
JWT_SECRET=replace_this_with_a_long_random_secret
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

### Frontend (`/frontend/.env`)
Create a `.env` file inside `/frontend` with the following variables:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Installation

Ensure you have [Node.js](https://nodejs.org/) installed on your computer.

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd leave-management-system
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

---

## Running the Application

### 1. Initialize and Seed the Database
To populate the database with default demo accounts and test leave requests, run the seed script from the `/backend` folder:
```bash
cd backend
npm run seed
```

### 2. Start the Backend API Server
Run the backend server in development mode (starts on `http://localhost:5000`):
```bash
npm run dev
```

### 3. Start the Frontend Client
Open a new terminal window, navigate to the `/frontend` folder, and start the development web server (starts on `http://localhost:5173`):
```bash
cd frontend
npm run dev
```

---

## Demo Accounts

The database seed script initializes two accounts with the credentials below:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@penthara.dev` | `admin123` |
| **Employee** | `employee@penthara.dev` | `employee123` |

**Note: For review convenience, if a user is not found, the backend creates them dynamically on-the-fly.
So if you want to login personally apart from these two accounts you can login with them also.
To login as employee write any mail address just don't have the word "admin" in the mail address.
To login as admin you have to write a mail address like this (admin@xyz.com) basically the mail must contain the word admin in it .**

---

## Validation and Error Handling

- **Date Checks**: Enforces that start dates and end dates are in the correct order, and prevents past submissions or overlapping requests.
- **Client Validation**: The UI catches invalid characters, short description lengths (<5 characters), or empty selections before triggering server requests.
- **Mongoose Constraints**: Enforces string length restrictions (5 to 500 characters) and enum options directly at the database layer.
- **Global Error Handling**: Uncaught Express route exceptions are caught by a centralized middleware handler, preventing backend server crashes and returning clean JSON errors.

---

## Security

- **Password Cryptography**: Passwords are saved as securely hashed strings using `bcryptjs` (10 rounds of salt generation). Candidate matches are compared using time-constant functions.
- **JWT Authorization**: Enforces stateless JWT validation. Authentication tokens are checked via server-side middlewares on protected endpoints.
- **Role Enforcement**: Routes restricted to administrators check if `req.user.role === 'admin'` before performing operations.
- **Cross-Origin Resource Sharing (CORS)**: The Express server is locked down to process requests only from the specified client origin.

---

## Future Improvements

- Add a dedicated sign-up page in the UI (backend registers are already fully functional).
- Implement email notifications when an admin reviews a leave request.
- Add support for pagination on the admin leaves log table.
- Build automated unit and integration tests (Jest, Supertest).

---

## Author

Developed by Aryan as part of the Penthara Technologies React Developer Intern assessment process.
