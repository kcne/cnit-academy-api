# CNIT academy backend

<!--toc:start-->
- [CNIT academy backend](#cnit-academy-backend)
  - [Usage](#usage)
  - [Authentication](#authentication)
    - [POST /api/register](#post-apiregister)
    - [POST /api/users/verify-email](#post-apiusersverify-email)
    - [POST /api/users/resend-email](#post-apiusersresend-email)
    - [POST /api/login](#post-apilogin)
    - [GET /api/protected](#get-apiprotected)
  - [Profiles (Users)](#profiles-users)
    - [GET /api/profile](#get-apiprofile)
    - [GET /api/profile/:id](#get-apiprofileid)
    - [POST /api/profile/me](#post-apiprofileme)
    - [PATCH /api/profile/me](#patch-apiprofileme)
    - [DELETE /api/profile/me](#delete-apiprofileme)
<!--toc:end-->

## Usage

Install packages: `npm install` \
Start the backend: `npm run dev`

## Authentication

### POST /api/register

Registering a user automatically sends an email. On failure to send it fails silently.

Request JSON:

```json
{
  "firstName": "john",
  "lastName": "doe",
  "email": "johndoe@gmail.com"
}
```

Response 201 JSON:

```json
{
  "id": 1,
  "firstName": "john",
  "lastName": "doe",
  "email": "johndoe@gmail.com",
  "isEmailVerified": false,
  "updatedAt": "2025-03-26T21:59:54.755Z",
  "totalCoins": 0,
  "pfp": "/pfp/default"
}
```

Response 409 -> User with given email already exists

### POST /api/users/verify-email

Request JSON:

```json
{
  "email": "johndoe@gmail.com",
  "code": "123456"
}
```

Response 200 -> User's email is successfully verified
Response 400 -> Invalid code, invalid email or malformed request

### POST /api/users/resend-email

Request JSON:

```json
{
  "email": "johndoe@gmail.com"
}
```

Response 200 -> Another email with a new code has been sent
Response 400 -> Failed to send an email, try again

### POST /api/login

Email has to be verified before logging in

Request JSON:

```json
{
  "email": "johndoe@gmail.com",
  "password": "qwerty"
}
```

Response 200 JSON:

```json
{
  "user": {
    "id": 1,
    "email": "tet@test.net"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXRAdGVzdC5uZXQiLCJpYXQiOjE3NDMwMjY4NTMsImV4cCI6MTc0MzExMzI1M30.MdyIeeyBaMLdJ65F6wfdLnKZVkOwMm8gkWm8ZyX7gQY"
}
```

Response 401 -> Email is not verified
Response 404 -> Invalid email or password

### GET /api/protected

Route to test authorization

Request headers:

| key           | example        | description                            |
| ------------- | -------------- | -------------------------------------- |
| Authorization | "Bearer TOKEN" | TOKEN is the string you get from login |

Response 401 -> Authorization header is missing or malformed
Response 403 -> Token is invalid or expired

## Profiles (Users)

Requires authorization (see [/api/protected](#get-apiprotected))

### GET /api/profile

Returns all profiles

Response 200 JSON:

```json
[
  {
    "id": 1,
    "firstName": "john",
    "lastName": "doe",
    "skills": ["markdown"],
    "education": [],
    "experience": [],
    "totalCoins": 0,
    "pfp": "/pfp/default"
  },
  {
    "id": 17,
    "firstName": "jane",
    "lastName": "doe",
    "skills": ["c++"],
    "education": [],
    "experience": [],
    "totalCoins": 0,
    "pfp": "/pfp/jane.png"
  }
]
```

### GET /api/profile/:id

Request query params:

| key | example | description                                           |
| --- | ------- | ----------------------------------------------------- |
| id  | 2       | Positive integer or string "me" to return own profile |

Response 200 JSON:

```json
{
  "id": 2,
  "email": "joshdoe@gmail.com",
  "isEmailVerified": true,
  "firstName": "josh",
  "lastName": "doe",
  "skills": ["c++"],
  "education": [],
  "experience": [
    "id": 2,
    "title": "school",
    "description": "secondary",
    "organization": "private",
    "startPeriod": "2024-12-04T17:40:50+01:00",
    "endPeriod": "2025-03-14T17:38:29+01:00"
  ],
  "totalCoins": 0,
  "pfp": "/pfp/2.png"
}
```

Response 404 -> Profile with :id doesn't exist

### POST /api/profile/me

New profiles are created during registration, this route serves as a fallback if a user is created without a profile

Request JSON:

```json
{
  "skills": ["haskell"],
  "education": [],
  "experience": [],
  "pfp": "/pfp/2.png"
}
```

Response 200 JSON: same as above
Reponse 404 -> User does not exist (don't use this instead of [/api/register](#post-apiregister))

### PATCH /api/profile/me

Update profile (every field is optional)
Changing education/experience:

- Including id modifies an existing object it if it's already in the database
- Omitting id creates a new object
- Omitting an object that is in the database deletes it
- Not passing an argument at all (or undefined) doesn't change anything

Request JSON:

```jsonp
{
  "firstName": "jans",
  "lastName": "doe",
  "skills": ["none", "all", "great at table tennis"],
  "pfp": "/pfp/aaa2023-12-15_01-23.png",
  "education": [
    {
      "title": "school",
      "description": "primary",
      "organization": "the state",
      "startPeriod": "2024-12-04T17:40:50+01:00",
      "endPeriod": "2025-03-14T17:38:29+01:00"
    },
    {
      "id": 2,
      "title": "school",
      "description": "secondary",
      "organization": "private",
      "startPeriod": "2024-12-04T17:40:50+01:00",
      "endPeriod": "2025-03-14T17:38:29+01:00"
    }
  ],
  "experience": []
}
```

Response 200 JSON: same as above
Reponse 404 -> Profile does not exist

### DELETE /api/profile/me

Deletes own profile (but not the user leading to buggy behaviour currently)

Response 200 -> no response
Reponse 404 -> Profile does not exist
