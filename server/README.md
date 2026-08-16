# CyberShield Backend

This is the Node.js backend for the CyberShield hackathon project.

## Running the Server

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure `.env`:**
   Ensure you have a `.env` file in the `server` directory with your MongoDB Atlas URI:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/cybershield?retryWrites=true&w=majority
   JWT_SECRET=supersecretjwtkey_cybershield_hackathon
   ```

3. **Start the server:**
   ```bash
   node server.js
   ```

## API Testing Examples (Postman)

### 1. Authentication APIs

#### Register User
- **URL:** `POST http://localhost:5000/api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "user"
  }
  ```

#### Login User
- **URL:** `POST http://localhost:5000/api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```
> Save the `token` from the response to use in the Authorization header for protected routes: `Bearer <your_token>`.

### 2. Fraud Report APIs

#### Create Report (with image upload)
- **URL:** `POST http://localhost:5000/api/reports`
- **Headers:** `Authorization: Bearer <your_token>`
- **Body (form-data):**
  - `scamType`: "Phishing" (Text)
  - `description`: "I received an email asking for my OTP." (Text)
  - `riskLevel`: "Medium" (Text)
  - `screenshot`: [Select a file] (File)

#### Get All Reports
- **URL:** `GET http://localhost:5000/api/reports`
- **Headers:** `Authorization: Bearer <your_token>`

#### Delete Report (Admin Only)
- **URL:** `DELETE http://localhost:5000/api/reports/<report_id>`
- **Headers:** `Authorization: Bearer <admin_token>`

### 3. Scam Detection API

#### Detect Scam
- **URL:** `POST http://localhost:5000/api/detect-scam`
- **Headers:** `Authorization: Bearer <your_token>`, `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "message": "Urgent! Your bank account is blocked. Click now to verify your KYC and receive your lottery."
  }
  ```
- **Expected Response:**
  ```json
  {
    "riskLevel": "High",
    "matchedKeywords": ["urgent", "click now", "lottery", "kyc"],
    "warningMessage": "CRITICAL WARNING: This message has multiple scam indicators. Do NOT click any links or share personal info."
  }
  ```

### 4. Admin APIs

#### Get Admin Stats
- **URL:** `GET http://localhost:5000/api/admin/stats`
- **Headers:** `Authorization: Bearer <admin_token>`

#### Get All Reports (Admin)
- **URL:** `GET http://localhost:5000/api/admin/reports`
- **Headers:** `Authorization: Bearer <admin_token>`
