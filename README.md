# CNIT academy backend

<!--toc:start-->

- [CNIT academy backend](#cnit-academy-backend)
  - [Usage](#usage)
  - [Authentication](#authentication)
    - [POST /api/auth/register](#post-apiauthregister)
    - [POST /api/auth/verify-email](#post-apiauthverify-email)
    - [POST /api/auth/resend-email](#post-apiauthresend-email)
    - [POST /api/auth/login](#post-apiauthlogin)
    - [GET /api/auth/protected](#get-apiauthprotected)
  - [Profiles (Users)](#profiles-users)
    - [GET /api/profile](#get-apiprofile)
    - [GET /api/profile/:id](#get-apiprofileid)
    - [POST /api/profile/me](#post-apiprofileme)
    - [PATCH /api/profile/me](#patch-apiprofileme)
    - [DELETE /api/profile/me](#delete-apiprofileme)
  - [Programs](#programs)
    - [GET /api/program](#get-apiprogram)
    - [GET /api/program/:id](#get-apiprogramid)
    - [POST /api/program](#post-apiprogram)
    - [PATCH /api/program/:id](#patch-apiprogramid)
    - [DELETE /api/program/:id](#delete-apiprogramid)
    - [PUT /api/program/:id/apply](#put-apiprogramidapply)
    - [PUT /api/program/:id/enroll](#put-apiprogramidenroll)
  - [Courses](#courses)
    - [GET /api/course](#get-apicourse)
    - [GET /api/course/:id](#get-apicourseid)
    - [POST /api/course](#post-apicourse)
    - [PATCH /api/course/:id](#patch-apicourseid)
    - [DELETE /api/course/:id](#delete-apicourseid)
  - [Leaderboard](#leaderboard)
    - [GET /api/leaderboard](#get-apileaderboard)
    - [GET /api/leaderboard/weekly](#get-apileaderboardweekly)
  - [Blogs](#blogs)
    - [GET /api/blog](#get-apiblog)
    - [GET /api/blog/:id](#get-apiblogid)
    - [POST /api/blog](#post-apiblog)
    - [PUT /api/blog/:id/publish](#put-apiblogidpublish)
    - [PATCH /api/blog/:id](#patch-apiblogid)
    - [DELETE /api/blog/:id](#delete-apiblogid)
  - [Global](#global)
    - [paginationMeta](#paginationmeta)
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
SEED=42    # setting this variable creates reproducible results
USERS=15   # number of users to create
COURSES=10 # number of courses to create
PROGRAMS=5 # number of programs to create
```

A popular email service for testing is [ethereal](ethereal.email),
but it doesn't deliver the emails

Install packages: `npm install` \
Initialize the db: `npx prisma db push` \
Add default values: `npx prisma db seed` \
Start the backend: `npm run dev`

## Authentication

### POST /api/auth/register

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

### POST /api/auth/verify-email

Request JSON:

```json
{
  "email": "johndoe@gmail.com",
  "code": "123456"
}
```

Response 200 -> User's email is successfully verified \
Response 400 -> Invalid code, invalid email or malformed request

### POST /api/auth/resend-email

Request JSON:

```json
{
  "email": "johndoe@gmail.com"
}
```

Response 200 -> Another email with a new code has been sent \
Response 400 -> Failed to send an email, try again

### POST /api/auth/login

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
  "id": 1,
  "email": "tet@test.net",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXRAdGVzdC5uZXQiLCJpYXQiOjE3NDMwMjY4NTMsImV4cCI6MTc0MzExMzI1M30.MdyIeeyBaMLdJ65F6wfdLnKZVkOwMm8gkWm8ZyX7gQY"
}
```

Response 403 -> Email is not verified \
Response 404 -> Invalid email or password

### GET /api/auth/protected

Route to test authorization

Request headers:

| key           | example        | description                            |
| ------------- | -------------- | -------------------------------------- |
| Authorization | "Bearer TOKEN" | TOKEN is the string you get from login |

Response 401 -> Authorization header is missing or malformed \
Response 403 -> Token is invalid or expired

## Profiles (Users)

Requires authorization (see [/api/auth/protected](#get-apiauthprotected))

### GET /api/profile

Returns all profiles

Request query params:

| key   | example | description                 |
| ----- | ------- | --------------------------- |
| page  | 2       | Current page                |
| limit | 20      | Number of profiles per page |

Response 200 JSON:

```json
{
  "data": [
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
  ],
  "meta": "(paginationMeta)"
}
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

Response 201 JSON: same as above \
Reponse 404 -> User does not exist (don't use this instead of [/api/auth/register](#post-apiauthregister))

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

Deletes own profile

Response 200 -> no response \
Reponse 404 -> Profile does not exist

## Programs

Requires authorization (see [/api/auth/protected](#get-apiauthprotected))

### GET /api/program

Fetch all programs

Request query params:

| key   | example | description                 |
| ----- | ------- | --------------------------- |
| page  | 2       | Current page                |
| limit | 20      | Number of programs per page |

Response 200 JSON:

```json
{
  "data": [
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
  ],
  "meta": "(paginationMeta)"
}
```

### GET /api/program/:id

Request query params:

| key | example | description                         |
| --- | ------- | ----------------------------------- |
| id  | 2       | ID of the program, positive integer |

Response 200 JSON:

```json
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
```

Request 404 -> Program not found

### POST /api/program

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

Response 201 JSON:

```json
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
```

### PATCH /api/program/:id

Update program \
All of the fields are optional

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
```

Request 404 -> Program not found

### DELETE /api/program/:id

Deletes a program

Request query params:

| key | example | description                         |
| --- | ------- | ----------------------------------- |
| id  | 2       | ID of the program, positive integer |

Response 200 -> Program deleted
Request 404 -> Program not found

### PUT /api/program/:id/apply

Increments applieadCount by one

Request query params:

| key | example | description                         |
| --- | ------- | ----------------------------------- |
| id  | 2       | ID of the program, positive integer |

Response 200 -> Applied to program
Request 404 -> Program not found

### PUT /api/program/:id/enroll

Increments studentCount by one

Request query params:

| key | example | description                         |
| --- | ------- | ----------------------------------- |
| id  | 2       | ID of the program, positive integer |

Response 200 -> Enrolled into program
Request 404 -> Program not found

## Courses

Requires authorization (see [/api/auth/protected](#get-apiauthprotected))

### GET /api/course

Fetch all course

Request query params:

| key   | example | description                |
| ----- | ------- | -------------------------- |
| page  | 2       | Current page               |
| limit | 20      | Number of courses per page |

Response 200 JSON:

```json
{
  "data": [
    {
      "id": 1,
      "title": "title",
      "description": "description",
      "durationInHours": 2,
      "numberOfStudents": 0
    }
  ],
  "meta": "paginationMeta"
}
```

### GET /api/course/:id

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

Request 404 -> Course not found

### POST /api/course

Create a new course

Request JSON:

```json
{
  "title": "title",
  "description": "description",
  "durationInHours": 2,
  "numberOfStudents": 0
}
```

Response 201 JSON:

```json
{
  "id": 1,
  "title": "title",
  "description": "description",
  "durationInHours": 2,
  "numberOfStudents": 0
}
```

Request 404 -> Course not found

### PATCH /api/course/:id

Update a course \
All of the fields are optional

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

Request 404 -> Course not found

### DELETE /api/course/:id

Delete a course

Request query params:

| key | example | description                        |
| --- | ------- | ---------------------------------- |
| id  | 2       | ID of the course, positive integer |

Response 200 -> Course deleted successfully
Request 404 -> Course not found

## Leaderboard

Requires authorization (see [/api/auth/protected](#get-apiauthprotected))

### GET /api/leaderboard

**Prone to change:**

- Return a max of X profiles

Response 200 JSON:

```json
[
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
```

### GET /api/leaderboard/weekly

nly returns profiles which have been updated this week \
**Prone to change:**

- Return a max of X profiles
- Fixing the logic error

Response 200 JSON:

```json
[
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
```

## Blogs

Requires authorization (see [/api/auth/protected](#get-apiauthprotected))

### GET /api/blog

Fetch all **published** blogs \
If you don't see your blog you may have not published it
(see [/api/blog/:id/publish](#put-apiblogidpublish) )

Request query params:

| key   | example | description              |
| ----- | ------- | ------------------------ |
| page  | 2       | Current page             |
| limit | 20      | Number of blogs per page |

Response 200 JSON:

```json
{
  "data": [
    {
      "id": 1,
      "title": "title",
      "published": true,
      "content": "# Markdown",
      "blogDescription": null,
      "userId": 5,
      "createdAt": "2025-04-05T18:34:35.612Z",
      "updatedAt": "2025-04-05T18:34:35.612Z"
    }
  ],
  "meta": "paginationMeta"
}
```

### GET /api/blog/:id

Request query params:

| key | example | description                      |
| --- | ------- | -------------------------------- |
| id  | 2       | ID of the blog, positive integer |

Response 200 JSON:

```json
{
  "id": 1,
  "title": "title",
  "published": true,
  "content": "# Markdown",
  "blogDescription": null,
  "userId": 5,
  "createdAt": "2025-04-05T18:34:35.612Z",
  "updatedAt": "2025-04-05T18:34:35.612Z"
}
```

Request 404 -> Blog not found

### POST /api/blog

Create a new blog

Request JSON:

```json
{
  "userId": 5
  "title": "title",
  "published": true,
  "content": "# Markdown",
  "blogDescription": null,
}
```

Response 201 JSON:

```json
{
  "id": 1,
  "title": "title",
  "published": true,
  "content": "# Markdown",
  "blogDescription": null,
  "userId": 5,
  "createdAt": "2025-04-05T18:34:35.612Z",
  "updatedAt": "2025-04-05T18:34:35.612Z"
}
```

Request 404 -> Blog not found

### PUT /api/blog/:id/publish

Publish a blog

Request query params:

| key | example | description                      |
| --- | ------- | -------------------------------- |
| id  | 2       | ID of the blog, positive integer |

Response 200 -> Blog published successfully
Request 404 -> Blog not found

### PATCH /api/blog/:id

Update a blog \
All of the fields are optional

Request query params:

| key | example | description                      |
| --- | ------- | -------------------------------- |
| id  | 2       | ID of the blog, positive integer |

Request JSON:

```json
{
  "userId": 5
  "title": "title",
  "published": true,
  "content": "# Markdown",
  "blogDescription": null,
}
```

Response 200 JSON:

```json
{
  "id": 1,
  "title": "title",
  "published": true,
  "content": "# Markdown",
  "blogDescription": null,
  "userId": 5,
  "createdAt": "2025-04-05T18:34:35.612Z",
  "updatedAt": "2025-04-05T18:34:35.612Z"
}
```

Request 404 -> Blog not found

### DELETE /api/blog/:id

Delete a blog

Request query params:

| key | example | description                      |
| --- | ------- | -------------------------------- |
| id  | 2       | ID of the blog, positive integer |

Response 200 -> Blog deleted successfully
Request 404 -> Blog not found

## Global

### paginationMeta

```json
{
  "page": 1,
  "limit": 10,
  "total": 150,
  "totalPages": 15,
  "hasNextPage": true,
  "hasPrevPage": false
}
```
