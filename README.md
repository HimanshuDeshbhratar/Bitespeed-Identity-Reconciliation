# Bitespeed Identity Reconciliation API

The project implements the Identity Reconciliation logic

The API consolidates customer contact information across multiple records and determines primary and secondary contacts.

---

## Live API

Base URL:

https://bitespeed-identity-reconciliation-0jl3.onrender.com

Endpoint:

POST /identify

---

## API Usage

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
