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
  - [Programs](#programs)
    - [GET /api/programs](#get-apiprograms)
    - [GET /api/programs/:id](#get-apiprogramsid)
    - [POST /api/programs](#post-apiprograms)
    - [PUT /api/programs/:id](#put-apiprogramsid)
    - [DELETE /api/programs/:id](#delete-apiprogramsid)
    - [PUT /api/programs/:id/apply](#put-apiprogramsidapply)
    - [PUT /api/programs/:id/enroll](#put-apiprogramsidenroll)
  - [Courses](#courses)
    - [GET /api/courses](#get-apicourses)
    - [GET /api/courses/:id](#get-apicoursesid)
    - [POST /api/courses](#post-apicourses)
    - [PUT /api/courses/:id](#put-apicoursesid)
    - [DELETE /api/courses/:id](#delete-apicoursesid)
  - [Leaderboard](#leaderboard)
    - [GET /api/leaderboard](#get-apileaderboard)
    - [GET /api/leaderboard/weekly](#get-apileaderboardweekly)
    <!--toc:end-->

## Usage

Create .env file and edit it accordingly:

```sh
MAIL_HOST=smtp.mail.com
MAIL_PORT=587
MAIL_USER=email@mail.com
MAIL_PASS=password
MAIL_SECURE=false

JWT_SECRET="secret" # a string that encrypts the jwt tokens, longer = more secure

# additional options for npx prisma db seed
SEED=42 # setting this variable creates reproducible results
USERS=15 # number of users to create
```

A popular email service for testing is [ethereal](ethereal.email),
but it doesn't deliver the emails

Install packages: `npm install` \
Initialize the db: `npx prisma db push` \
Add default values: `npx prisma db seed` \
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

Response 200 -> User's email is successfully verified \
Response 400 -> Invalid code, invalid email or malformed request

### POST /api/users/resend-email

Request JSON:

```json
{
  "email": "johndoe@gmail.com"
}
```

Response 200 -> Another email with a new code has been sent \
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

Response 401 -> Email is not verified \
Response 404 -> Invalid email or password

### GET /api/protected

Route to test authorization

Request headers:

| key           | example        | description                            |
| ------------- | -------------- | -------------------------------------- |
| Authorization | "Bearer TOKEN" | TOKEN is the string you get from login |

Response 401 -> Authorization header is missing or malformed \
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

New profiles are created during registration,
this route serves as a fallback if a user is created without a profile

Request JSON:

```json
{
  "skills": ["haskell"],
  "education": [],
  "experience": [],
  "pfp": "/pfp/2.png"
}
```

Response 200 JSON: same as above \
Reponse 404 -> User does not exist (don't use this instead of [/api/register](#post-apiregister))

### PATCH /api/profile/me

Update profile (every field is optional) \
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

Response 200 JSON: same as above \
Reponse 404 -> Profile does not exist

### DELETE /api/profile/me

Deletes own profile (but not the user leading to buggy behaviour currently)

Response 200 -> no response \
Reponse 404 -> Profile does not exist

## Programs

Will probably require authorization in the future

### GET /api/programs

Fetch all programs

Response 200 JSON:

```json
[
  {
    "id": 1,
    "title": "title",
    "description": "description",
    "founder": "founder",
    "durationInDays": 2,
    "appliedCount": 0,
    "studentCount": 0,
    "applicationDeadline": "2025-03-07T16:42:30.000Z",
    "CreatedAt": "2025-03-27T18:05:56.343Z"
  }
]
```

### GET /api/programs/:id

Request query params:

| key | example | description                         |
| --- | ------- | ----------------------------------- |
| id  | 2       | ID of the program, positive integer |

Response 200 JSON:

```json
[
  {
    "id": 1,
    "title": "title",
    "description": "description",
    "founder": "founder",
    "durationInDays": 2,
    "appliedCount": 0,
    "studentCount": 0,
    "applicationDeadline": "2025-03-07T16:42:30.000Z",
    "CreatedAt": "2025-03-27T18:05:56.343Z"
  }
]
```

Request 404 -> Program not found (bad ID)

### POST /api/programs

Create new program

Request JSON:

```json
{
  "title": "title",
  "description": "description",
  "founder": "founder",
  "durationInDays": 2,
  "applicationDeadline": "2025-03-07T17:42:30+01:00"
}
```

Response 200 JSON:

```json
[
  {
    "id": 1,
    "title": "title",
    "description": "description",
    "founder": "founder",
    "durationInDays": 2,
    "appliedCount": 0,
    "studentCount": 0,
    "applicationDeadline": "2025-03-07T16:42:30.000Z",
    "CreatedAt": "2025-03-27T18:05:56.343Z"
  }
]
```

### PUT /api/programs/:id

Update program \
All of the fields are optional \
**Subject to change from PUT to PATCH**

Request query params:

| key | example | description                         |
| --- | ------- | ----------------------------------- |
| id  | 2       | ID of the program, positive integer |

Request JSON:

```json
{
  "title": "title",
  "description": "description",
  "founder": "founder",
  "durationInDays": 2,
  "applicationDeadline": "2025-03-07T17:42:30+01:00"
}
```

Response 200 JSON:

```json
[
  {
    "id": 1,
    "title": "title",
    "description": "description",
    "founder": "founder",
    "durationInDays": 2,
    "appliedCount": 0,
    "studentCount": 0,
    "applicationDeadline": "2025-03-07T16:42:30.000Z",
    "CreatedAt": "2025-03-27T18:05:56.343Z"
  }
]
```

### DELETE /api/programs/:id

Deletes a program \
Crashes the application if program does not exist

Request query params:

| key | example | description                         |
| --- | ------- | ----------------------------------- |
| id  | 2       | ID of the program, positive integer |

Response 200 -> Program deleted

### PUT /api/programs/:id/apply

Increments applieadCount by one \
Crashes the application if program does not exist

Request query params:

| key | example | description                         |
| --- | ------- | ----------------------------------- |
| id  | 2       | ID of the program, positive integer |

Response 200 -> Applied to program

### PUT /api/programs/:id/enroll

Increments studentCount by one \
Crashes the application if program does not exist

Request query params:

| key | example | description                         |
| --- | ------- | ----------------------------------- |
| id  | 2       | ID of the program, positive integer |

Response 200 -> Enrolled into program

## Courses

### GET /api/courses

Fetch all courses

Response 200 JSON:

```json
[
  {
    "id": 1,
    "title": "title",
    "description": "description",
    "durationInHours": 2,
    "numberOfStudents": 0
  }
]
```

### GET /api/courses/:id

Request query params:

| key | example | description                        |
| --- | ------- | ---------------------------------- |
| id  | 2       | ID of the course, positive integer |

Response 200 JSON:

```json
{
  "id": 1,
  "title": "title",
  "description": "description",
  "durationInHours": 2,
  "numberOfStudents": 0
}
```

Request 404 -> Course not found (bad ID)

### POST /api/courses

Create a new course \
Only the title field is required

Request JSON:

```json
{
  "title": "title",
  "description": "description",
  "durationInHours": 2,
  "numberOfStudents": 0
}
```

Response 200 JSON:

```json
{
  "id": 1,
  "title": "title",
  "description": "description",
  "durationInHours": 2,
  "numberOfStudents": 0
}
```

### PUT /api/courses/:id

Update a course \
All of the fields are optional \
Crashes the application if course does not exist \
**Subject to change from PUT to PATCH**

Request query params:

| key | example | description                        |
| --- | ------- | ---------------------------------- |
| id  | 2       | ID of the course, positive integer |

Request JSON:

```json
{
  "title": "title",
  "description": "description",
  "durationInHours": 2,
  "numberOfStudents": 0
}
```

Response 200 JSON:

```json
{
  "id": 1,
  "title": "title",
  "description": "description",
  "durationInHours": 2,
  "numberOfStudents": 0
}
```

### DELETE /api/courses/:id

Delete a course \
Crashes the application if course does not exist

Request query params:

| key | example | description                        |
| --- | ------- | ---------------------------------- |
| id  | 2       | ID of the course, positive integer |

Response 200 -> Course deleted successfully

## Leaderboard

### GET /api/leaderboard

**Prone to change:**

- Directly return leaderboard object
- Return a max of X profiles

Response 200 JSON:

```json
{
  "success": true,
  "leaderboard": [
    {
      "id": 1,
      "firstName": "john",
      "lastName": "doe",
      "totalCoins": 1000,
      "updatedAt": "2025-03-27T18:54:17.460Z"
    },
    {
      "id": 2,
      "firstName": "jane",
      "lastName": "doe",
      "totalCoins": 50,
      "updatedAt": "2025-03-27T18:54:22.415Z"
    }
  ]
}
```

### GET /api/leaderboard/weekly

Only returns profiles which have been updated this week \
**Prone to change:**

- Directly return leaderboard object
- Return a max of X profiles
- Fixing the logic error

Response 200 JSON:

```json
{
  "success": true,
  "leaderboard": [
    {
      "id": 1,
      "firstName": "john",
      "lastName": "doe",
      "totalCoins": 1000,
      "updatedAt": "2025-03-27T18:54:17.460Z"
    },
    {
      "id": 2,
      "firstName": "jane",
      "lastName": "doe",
      "totalCoins": 50,
      "updatedAt": "2025-03-27T18:54:22.415Z"
    }
  ]
}
```
