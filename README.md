# Simplified Keycloak IAM Platform

A simplified Identity and Access Management (IAM) platform inspired by Keycloak, built with React, TypeScript, Node.js, Express, and MongoDB. The application provides secure authentication, user and organization management, invitation workflows, and configurable global authentication and MFA settings.

---

## Features

### Authentication
- Seeded admin login
- JWT-based authentication
- Protected routes
- Session persistence
- Logout functionality

### Dashboard
- Central landing page after login
- Navigation to major modules
- Quick action cards for:
  - Invite User
  - Manage Users
  - Organizations
  - Global Settings

### User Management
- View users
- Search users
- Create users
- Edit users
- Delete users
- Activate/Deactivate users
- View user details
- Simulated password reset

### User Invitation
- Invite one or multiple email addresses
- Assign users to organizations
- Store invitation records
- Simulated invitation flow (no real email sending)

### Organization Management
- Create organizations
- Search organizations
- Delete organizations
- Assign users to organizations
- Optional sub-organization hierarchy

### Global Authentication Settings
Configurable authentication methods:
- Passkeys
- Password login
- Email passcodes
- Mobile login

### Global MFA Settings
Configurable MFA methods:
- TOTP
- Email MFA
- SMS MFA

---

## Tech Stack

### Frontend
- React
- TypeScript
- React Router
- Axios
- Tailwind CSS

### Backend
- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication

### Deployment
- Render (Frontend + Backend hosted together)
- MongoDB Atlas

---

## Project Structure

```txt
keycloak-iam-platform/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── server.ts
│   └── package.json
│
├── .env.example
├── README.md
└── package.json
```

---

## Architecture

```txt
React Frontend
   ↓
Express REST API
   ↓
MongoDB Database
```

Modules:
- Authentication
- User Management
- Invitations
- Organization Management
- Global Security Settings

---

## Setup Instructions

## 1. Clone repository

```bash
git clone https://github.com/YOUR_USERNAME/keycloak-iam-platform.git
cd keycloak-iam-platform
```

---

## 2. Install Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

---

## 3. Install Backend

```bash
cd server
npm install
npm run dev
```

Backend runs at:

```txt
http://localhost:4000
```

---

## 4. Environment Variables

Create `.env` inside server:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=4000
```

---

## Seed Demo Credentials

```txt
Admin User

Email: admin@test.com
Password: Admin123
```

---

## API Endpoints

## Authentication

```http
POST /api/auth/login
POST /api/auth/logout
```

---

## Users

```http
GET    /users
POST   /users
PUT    /users/:id
DELETE /users/:id
```

---

## Organizations

```http
GET    /organizations
POST   /organizations
DELETE /organizations/:id
```

---

## Invitations

```http
GET  /invitations
POST /invitations
```

---

## Global Settings

```http
GET /api/global-settings
PUT /api/global-settings
```

---

## Build for Production

From project root:

```bash
npm run build
npm start
```

---

## Hosting (Render)

### Build Command

```bash
npm run build
```

### Start Command

```bash
npm start
```

### Environment Variables in Render

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
NODE_ENV=production
```

---

## Assumptions

- Invitation emails are simulated
- Password reset is simulated
- Simplified RBAC model
- Single admin demo login for evaluation

---

## Limitations

- No real email provider integration
- No audit logs
- No advanced role hierarchy
- No automated tests included

---

## Future Improvements

- Full RBAC and permission policies
- Audit logging
- Real invitation emails
- Password recovery workflow
- Docker support
- Unit and integration testing
- SSO / OAuth support
- Advanced organization hierarchy

---

## Screenshots

Add screenshots in:

```txt
/screenshots
```

Examples:
- login.png
- dashboard.png
- user-management.png
- organization-management.png
- settings.png

---

## Demo Video

Optional Loom walkthrough:

```txt
https://loom.com/your-demo-link
```

---

## Security Notes

- JWT used for protected routes
- Sensitive values stored in environment variables
- .env excluded via .gitignore

---

## Author

Vikash  
M.Sc. Software Engineering  
University of Europe for Applied Sciences

GitHub:
https://github.com/imvk01

Portfolio:
https://imvk.tech
