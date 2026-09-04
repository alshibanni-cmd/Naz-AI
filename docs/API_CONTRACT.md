# Naz AI - API Contract (v1.0)

## Base URL
`http://127.0.0.1:8000`

## Authentication
- Type: Bearer Token
- Header: `Authorization: Bearer <token>`
- Token Expiry: 1440 minutes (24 hours)

---

## Auth Endpoints

### POST /auth/register
- **Description**: Register new user
- **Auth**: No
- **Request**:
  ```json
  {"username": "string", "email": "string", "password": "string"}