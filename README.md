# Bitespeed Identify API

Customer identity consolidation service that links contacts across multiple purchases using email and phone number.

## Prerequisites

- Node.js 18+
- MySQL 8+

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create MySQL database**
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   Or run the SQL in `database/schema.sql` manually in MySQL Workbench or your MySQL client.

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your MySQL credentials:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=bitespeed
   ```

## Run

**Development** (with auto-reload):
```bash
npm run dev
```

**Production**:
```bash
npm run build
npm start
```

## API

### POST /identify

Identifies or creates a contact and returns consolidated contact info.

**Request:**
```json
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
```

- `email` (optional): Customer email
- `phoneNumber` (optional): Customer phone number
- At least one of `email` or `phoneNumber` must be provided

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23]
  }
}
```

## Example

```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"mcfly@hillvalley.edu","phoneNumber":"123456"}'
```
