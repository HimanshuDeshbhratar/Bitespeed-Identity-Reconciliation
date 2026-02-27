# Bitespeed Identity Reconciliation API

The project implements the Identity Reconciliation logic

A Node backend service that implements identity reconciliation which receives email/phone, merges contacts, and returns consolidated results.

---

## Live API

Base URL:

https://bitespeed-identity-reconciliation-0jl3.onrender.com

Endpoint:

POST /identify

---

## Run Locally

1. Clone the repo
2. Add MySQL credentials in .env file (use .env.example)
3. Install dependencies:
   npm install
4. Run locally:
   npm run dev
   
## How It Works

- If no matching contact: create new primary.
- If match exists: consolidate identity.
- If both email and phone differ but match two primaries:
  it links the newer as secondary under the older.

### Request (JSON Body Required)

```bash
curl -X POST https://bitespeed-identity-reconciliation-0jl3.onrender.com/identify \
-H "Content-Type: application/json" \
-d '{"email":"test@example.com","phoneNumber":"123456"}'

```
## Expected Response
```bash
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["test@example.com"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": []
  }
}
```
