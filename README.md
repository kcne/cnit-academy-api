# CNIT academy backend

<!--toc:start-->

- [CNIT academy backend](#cnit-academy-backend)
  - [Usage](#usage)
  - [Authentication](#authentication)
    - [POST /api/auth/register](#post-apiauthregister)
    - [POST /api/auth/register-form](#post-apiauthregister-form)
    - [POST /api/auth/google](#post-apiauthgoogle)
    - [POST /api/auth/verify-email](#post-apiauthverify-email)
    - [POST /api/auth/resend-email](#post-apiauthresend-email)
    - [POST /api/auth/login](#post-apiauthlogin)
    - [GET /api/auth/protected](#get-apiauthprotected)
    - [GET /api/auth/admin](#get-apiauthadmin)
  - [Profiles (Users)](#profiles-users)
    - [GET /api/profile](#get-apiprofile)
    - [GET /api/profile/:id](#get-apiprofileid)
    - [PATCH /api/profile/me](#patch-apiprofileme)
    - [POST /api/profile/me/pfp](#post-apiprofilemepfp)
    - [DELETE /api/profile/me](#delete-apiprofileme)
    - [PATCH /api/profile/admin/:id](#patch-apiprofileadminid)
    - [DELETE /api/profile/admin/:id](#delete-apiprofileadminid)
  - [Programs](#programs)
    - [GET /api/program](#get-apiprogram)
    - [GET /api/program/my](#get-apiprogrammy)
    - [GET /api/program/:id](#get-apiprogramid)
    - [POST /api/program/admin](#post-apiprogramadmin)
    - [PATCH /api/program/admin/:id](#patch-apiprogramadminid)
    - [DELETE /api/program/admin/:id](#delete-apiprogramadminid)
    - [PUT /api/program/:id/apply](#put-apiprogramidapply)
    - [PUT /api/program/admin/:id/enroll](#put-apiprogramadminidenroll)
    - [PUT /api/program/admin/:id/finish](#put-apiprogramadminidfinish)
  - [Courses](#courses)
    - [GET /api/course](#get-apicourse)
    - [GET /api/course/my](#get-apicoursemy)
    - [GET /api/course/:id](#get-apicourseid)
    - [POST /api/course/admin](#post-apicourseadmin)
    - [PATCH /api/course/admin/:id](#patch-apicourseadminid)
    - [PUT /api/course/:id/start](#put-apicourseidstart)
    - [PUT /api/course/:id/finish](#put-apicourseidfinish)
    - [DELETE /api/course/admin/:id](#delete-apicourseadminid)
  - [Lectures](#lectures)
    - [GET /api/lecture](#get-apilecture)
    - [GET /api/lecture/my](#get-apilecturemy)
    - [GET /api/lecture/:id](#get-apilectureid)
    - [POST /api/lecture/admin](#post-apilectureadmin)
    - [PATCH /api/lecture/admin/:id](#patch-apilectureadminid)
    - [PUT /api/lecture/:id/start](#put-apilectureidstart)
    - [PUT /api/lecture/:id/finish](#put-apilectureidfinish)
    - [DELETE /api/lecture/admin/:id](#delete-apilectureadminid)
  - [Leaderboard](#leaderboard)
    - [GET /api/leaderboard](#get-apileaderboard)
    - [GET /api/leaderboard/weekly](#get-apileaderboardweekly)
  - [Blogs](#blogs)
    - [GET /api/blog](#get-apiblog)
    - [GET /api/blog/:id](#get-apiblogid)
    - [POST /api/blog/admin](#post-apiblogadmin)
    - [PUT /api/blog/admin/:id/publish](#put-apiblogadminidpublish)
    - [PATCH /api/blog/admin/:id](#patch-apiblogadminid)
    - [DELETE /api/blog/admin/:id](#delete-apiblogadminid)
    - [GET /api/blog/user/:userId](#get-apibloguseruserid)
    - [GET /api/blog/slug/:slug](#get-apiblogslugslug)
    - [GET /api/blog/:id/comment](#get-apiblogidcomment)
    - [POST /api/blog/:id/comment](#post-apiblogidcomment)
    - [DELETE /api/blog/:id/comment/:commentId](#delete-apiblogidcommentcommentid)
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
LECTURES=3 # number of lectures per course to create
```

A popular email service for testing is [ethereal](ethereal.email),
but it doesn't deliver the emails

Install packages: `npm install` \
Initialize the db: `npx prisma db push` \
Add default values: `npx prisma db seed` \
Start the backend: `npm run dev`

## Authentication

### POST /api/auth/register

**Deprecated, use [/api/auth/register-form](#post-apiauthregister-form) instead** \
Registering a user automatically sends an email. On failure to send it fails silently.

Request JSON:

```json
{
  "firstName": "john",
  "lastName": "doe",
  "email": "johndoe@gmail.com",
  "password": "qwerty"
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
  "pfp": "http://localhost:3000/files/pfp/default.png"
}
```

Response 409 -> User with given email already exists

### POST /api/auth/register-form

Registering a user automatically sends an email. On failure to send it fails silently.

Request form data:

| Key       | Value               |
| --------- | ------------------- |
| firstName | john                |
| lastName  | doe                 |
| email     | <johndoe@gmail.com> |
| password  | qwerty              |
| pfp       | (multipart file)    |

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
  "pfp": "http://localhost:3000/files/pfp/default.png"
}
```

Response 409 -> User with given email already exists

### POST /api/auth/google

Google OAuth2 login and register

Request JSON:

```json
{
  "code": "(auth-code from google oauth2)"
}
```

Response JSON:

```json
{
  "id": 1,
  "email": "tet@test.net",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXRAdGVzdC5uZXQiLCJpYXQiOjE3NDMwMjY4NTMsImV4cCI6MTc0MzExMzI1M30.MdyIeeyBaMLdJ65F6wfdLnKZVkOwMm8gkWm8ZyX7gQY"
}
```

Response 200 -> User successfully logged in \
Response 201 -> New user registered

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

### GET /api/auth/admin

Route to test admin authorization

Request headers:

| key           | example        | description                            |
| ------------- | -------------- | -------------------------------------- |
| Authorization | "Bearer TOKEN" | TOKEN is the string you get from login |

Response 401 -> Authorization header is missing or malformed \
Response 403 -> Token is invalid or expired or you do not have the admin role

## Profiles (Users)

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
      "pfp": "http://localhost:3000/files/pfp/default.png"
      "badges": [
        {
          "title": "titl",
          "icon": "/badges/1.png"
        }
      ],
      "streak": 7,
    },
    {
      "id": 17,
      "firstName": "jane",
      "lastName": "doe",
      "skills": ["c++"],
      "education": [],
      "experience": [],
      "totalCoins": 0,
      "pfp": "http://localhost:3000/files/pfp/jane.png"
      "badges": [
        {
          "title": "titl",
          "icon": "/badges/1.png"
        }
      ],
      "streak": 7,
    }
  ],
  "meta": "(paginationMeta)"
}
```

### GET /api/profile/:id

Requires authorization (see [/api/auth/protected](#get-apiauthprotected))

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
  "pfp": "http://localhost:3000/files/pfp/2.png",
      "badges": [
        {
          "title": "titl",
          "icon": "/badges/1.png"
        }
      ],
  "streak": 7,
  "programs": [
    {
      "id": 1,
      "title": "The Adventures of Tom Sawyer",
      "description": "The IB microchip is down, compress the solid state transmitter so we can parse the DNS bandwidth!",
      "founder": "Paul Windler",
      "durationInDays": 164,
      "applicationDeadline": "2025-05-13T01:28:56.901Z",
      "createdAt": "2025-04-17T12:16:44.928Z",
      "coins": 0,
      "applied": "2025-04-17T12:19:44.956Z",
      "enrolled": false,
      "finished": false
    }
  ],
  "courses": [
    {
      "id": 1,
      "title": "transmitter",
      "description": "Try to copy the EXE pixel, maybe it will connect the optical card!",
      "durationInHours": 5.509553508813935,
      "createdAt": "2025-04-17T12:16:44.901Z",
      "coins": 0,
      "finished": false
    }
  ],
  "lectures": []
}
```

Response 404 -> Profile with :id doesn't exist

### PATCH /api/profile/me

Requires authorization (see [/api/auth/protected](#get-apiauthprotected)) \
Update profile (every field is optional) \
Changing education/experience:

- Including id modifies an existing object it if it's already in the database
- Omitting id creates a new object
- Omitting an object that is in the database deletes it
- Not passing an argument at all (or undefined) doesn't change anything

Request JSON:

```json
{
  "firstName": "jans",
  "lastName": "doe",
  "skills": ["none", "all", "great at table tennis"],
  "pfp": "http://localhost:3000/files/pfp/aaa2023-12-15_01-23.png",
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

### POST /api/profile/me/pfp

Change profile photo

Request form data:

| Value | Key              |
| ----- | ---------------- |
| pfp   | (multipart file) |

Response 200 JSON:

```json
{
  "firstName": "jans",
  "lastName": "doe",
  "skills": ["none", "all", "great at table tennis"],
  "pfp": "http://localhost:3000/files/pfp/aaa2023-12-15_01-23.png",
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

Response 400 -> Photo upload failed \
Response 404 -> User not found

### DELETE /api/profile/me

Requires authorization (see [/api/auth/protected](#get-apiauthprotected)) \
Deletes own profile

Response 200 -> no response \
Reponse 404 -> Profile does not exist

### PATCH /api/profile/admin/:id

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin)) \
Update profile (every field is optional) \
Changing education/experience:

- Including id modifies an existing object it if it's already in the database
- Omitting id creates a new object
- Omitting an object that is in the database deletes it
- Not passing an argument at all (or undefined) doesn't change anything

Request JSON:

```json
{
  "firstName": "jans",
  "lastName": "doe",
  "skills": ["none", "all", "great at table tennis"],
  "pfp": "http://localhost:3000/files/pfp/aaa2023-12-15_01-23.png",
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

### DELETE /api/profile/admin/:id

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin)) \
Deletes profile

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
      "appliedCount": 10,
      "enrolledCount": 2,
      "finishedCount": 1,
      "coins": 50,
      "applicationDeadline": "2025-03-07T16:42:30.000Z",
      "createdAt": "2025-03-27T18:05:56.343Z"
    }
  ],
  "meta": "(paginationMeta)"
}
```

### GET /api/program/my

Return applied to programs

Response 200 JSON:

```json
{"data":
[
  {
    "id": 1,
    "title": "title",
    "description": "description",
    "founder": "founder",
    "durationInDays": 2,
    "appliedCount": 10,
    "enrolledCount": 2,
    "finishedCount": 1,
    "applied": false,
    "enrolled": false,
    "finished": false,
    "coins": 50,
    "applicationDeadline": "2025-03-07T16:42:30.000Z",
    "createdAt": "2025-03-27T18:05:56.343Z"
  },
"meta": "(paginationMeta)"]}
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
  "appliedCount": 10,
  "enrolledCount": 2,
  "finishedCount": 1,
  "applied": false,
  "enrolled": false,
  "finished": false,
  "coins": 50,
  "applicationDeadline": "2025-03-07T16:42:30.000Z",
  "createdAt": "2025-03-27T18:05:56.343Z"
}
```

Response 404 -> Program not found

### POST /api/program/admin

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin)) \

Create new program \
The coins field defaults to 0

Request JSON:

```json
{
  "title": "title",
  "description": "description",
  "founder": "founder",
  "durationInDays": 2,
  "coins": 50,
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
  "coins": 50,
  "applicationDeadline": "2025-03-07T16:42:30.000Z",
  "createdAt": "2025-03-27T18:05:56.343Z"
}
```

### PATCH /api/program/admin/:id

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin)) \

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
  "coins": 50,
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
  "coins": 50,
  "applicationDeadline": "2025-03-07T16:42:30.000Z",
  "createdAt": "2025-03-27T18:05:56.343Z"
}
```

Response 404 -> Program not found

### DELETE /api/program/admin/:id

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin)) \

Deletes a program

Request query params:

| key | example | description                         |
| --- | ------- | ----------------------------------- |
| id  | 2       | ID of the program, positive integer |

Response 200 -> Program deleted \
Response 404 -> Program not found

### PUT /api/program/:id/apply

Apply to a program

Request query params:

| key | example | description                         |
| --- | ------- | ----------------------------------- |
| id  | 2       | ID of the program, positive integer |

Response 200 -> Applied to program \
Response 404 -> Program not found

### PUT /api/program/admin/:id/enroll

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin)) \

Enroll given users into a program

Request query params:

| key | example | description                         |
| --- | ------- | ----------------------------------- |
| id  | 2       | ID of the program, positive integer |

Request JSON:

```json
[1, 3, 4, 17, 2, 5]
```

Response 200 -> Enrolled into program \
Response 404 -> Program not found

### PUT /api/program/admin/:id/finish

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin)) \

Finishes the program for all currently enrolled users

Request query params:

| key | example | description                         |
| --- | ------- | ----------------------------------- |
| id  | 2       | ID of the program, positive integer |

Response 200 -> Finished the program \
Response 404 -> Program not found

## Courses

Requires authorization (see [/api/auth/protected](#get-apiauthprotected))

### GET /api/course

Fetch all courses

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
      "studentCount": 0,
      "lectures": [
        {
          "id": 28,
          "title": "The Woman in White",
          "content": "We need to reboot the back-end VGA transmitter!",
          "videoUrl": "https://fragrant-saloon.name/",
          "courseId": 10,
          "coins": 2234
        }
      ],
      "coins": 10
    }
  ],
  "meta": "paginationMeta"
}
```

### GET /api/course/my

Return applied to courses

Response 200 JSON:

```json
{
  "data": [
    {
      "id": 1,
      "title": "title",
      "description": "description",
      "durationInHours": 2,
      "studentCount": 0,
      "coins": 10
    }
  ],
  "meta": "(paginationMeta)"
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
  "coins": 10,
  "lectures": [
    {
      "id": 28,
      "title": "The Woman in White",
      "content": "We need to reboot the back-end VGA transmitter!",
      "videoUrl": "https://fragrant-saloon.name/",
      "courseId": 10,
      "coins": 2234,
      "started": true,
      "finished": false
    }
  ],
  "started": true,
  "finished": false,
  "studentCount": 0
}
```

Response 404 -> Course not found

### POST /api/course/admin

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin)) \

Create a new course \
The coins field defaults to 0

Request JSON:

```json
{
  "title": "title",
  "description": "description",
  "durationInHours": 2,
  "coins": 10,
  "studentCount": 0,
  "lectures": [
    {
      "title": "The Woman in White",
      "content": "We need to reboot the back-end VGA transmitter!",
      "videoUrl": "https://fragrant-saloon.name/",
      "coins": 2234
    }
  ]
}
```

Response 201 JSON:

```json
{
  "id": 1,
  "title": "title",
  "description": "description",
  "coins": 10,
  "durationInHours": 2,
  "lectures": [
    {
      "id": 28,
      "title": "The Woman in White",
      "content": "We need to reboot the back-end VGA transmitter!",
      "videoUrl": "https://fragrant-saloon.name/",
      "courseId": 10,
      "coins": 2234
    }
  ],
  "studentCount": 0
}
```

Response 404 -> Course not found

### PATCH /api/course/admin/:id

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin)) \

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
  "coins": 10,
  "studentCount": 0,
  "lectures": {
    "create": [
      {
        "title": "The Woman in White",
        "content": "We need to reboot the back-end VGA transmitter!",
        "videoUrl": "https://fragrant-saloon.name/",
        "coins": 2234
      }
    ],
    "update": [
      {
        "id": 42,
        "title": "The Woman in White",
        "content": "We need to reboot the back-end VGA transmitter!",
        "videoUrl": "https://fragrant-saloon.name/",
        "coins": 2234
      }
    ],
    "delete": [1, 2, 3, 5, 8]
  }
}
```

Response 200 JSON:

```json
{
  "id": 1,
  "title": "title",
  "description": "description",
  "durationInHours": 2,
  "coins": 10,
  "lectures": [
    {
      "id": 28,
      "title": "The Woman in White",
      "content": "We need to reboot the back-end VGA transmitter!",
      "videoUrl": "https://fragrant-saloon.name/",
      "courseId": 10,
      "coins": 2234
    }
  ],
  "studentCount": 0
}
```

Response 404 -> Course not found

### PUT /api/course/:id/start

Start a course

Request query params:

| key | example | description                        |
| --- | ------- | ---------------------------------- |
| id  | 2       | ID of the course, positive integer |

Response 200 -> Started the course \
Response 404 -> Course not found

### PUT /api/course/:id/finish

Finish a course

Request query params:

| key | example | description                        |
| --- | ------- | ---------------------------------- |
| id  | 2       | ID of the course, positive integer |

Response 200 -> Finished the course \
Response 404 -> Course not found

### DELETE /api/course/admin/:id

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin)) \

Delete a course

Request query params:

| key | example | description                        |
| --- | ------- | ---------------------------------- |
| id  | 2       | ID of the course, positive integer |

Response 200 -> Course deleted successfully \
Response 404 -> Course not found

## Lectures

Requires authorization (see [/api/auth/protected](#get-apiauthprotected))

### GET /api/lecture

Fetch all lectures

Request query params:

| key   | example | description                 |
| ----- | ------- | --------------------------- |
| page  | 2       | Current page                |
| limit | 20      | Number of lectures per page |

Response 200 JSON:

```json
{
  "data": [
    {
      "id": 28,
      "title": "The Woman in White",
      "content": "We need to reboot the back-end VGA transmitter!",
      "videoUrl": "https://fragrant-saloon.name/",
      "courseId": 10,
      "coins": 2234
    }
  ],
  "meta": "paginationMeta"
}
```

### GET /api/lecture/my

Return applied to lectures

Response 200 JSON:

```json
{
  "data": [
    {
      "id": 28,
      "title": "The Woman in White",
      "content": "We need to reboot the back-end VGA transmitter!",
      "videoUrl": "https://fragrant-saloon.name/",
      "courseId": 10,
      "coins": 2234
    }
  ],
  "meta": "(paginationMeta)"
}
```

### GET /api/lecture/:id

Request query params:

| key | example | description                         |
| --- | ------- | ----------------------------------- |
| id  | 2       | ID of the lecture, positive integer |

Response 200 JSON:

```json
{
  "id": 28,
  "title": "The Woman in White",
  "content": "We need to reboot the back-end VGA transmitter!",
  "videoUrl": "https://fragrant-saloon.name/",
  "courseId": 10,
  "started": true,
  "finished": false,
  "coins": 2234
}
```

Response 404 -> Lecture not found

### POST /api/lecture/admin

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin)) \

Create a new lecture \
The coins field defaults to 0 \
Video url is optional

Request JSON:

```json
{
  "title": "The Woman in White",
  "content": "We need to reboot the back-end VGA transmitter!",
  "videoUrl": "https://fragrant-saloon.name/",
  "courseId": 2,
  "coins": 2234
}
```

Response 201 JSON:

```json
{
  "id": 28,
  "title": "The Woman in White",
  "content": "We need to reboot the back-end VGA transmitter!",
  "videoUrl": "https://fragrant-saloon.name/",
  "courseId": 10,
  "coins": 2234
}
```

Response 404 -> Lecture not found

### PATCH /api/lecture/admin/:id

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin)) \

Update a lecture \
All of the fields are optional

Request query params:

| key | example | description                         |
| --- | ------- | ----------------------------------- |
| id  | 2       | ID of the lecture, positive integer |

Request JSON:

```json
{
  "title": "The Woman in White",
  "content": "We need to reboot the back-end VGA transmitter!",
  "videoUrl": "https://fragrant-saloon.name/",
  "courseId": 2,
  "coins": 2234
}
```

Response 200 JSON:

```json
{
  "id": 28,
  "title": "The Woman in White",
  "content": "We need to reboot the back-end VGA transmitter!",
  "videoUrl": "https://fragrant-saloon.name/",
  "courseId": 10,
  "coins": 2234
}
```

Response 404 -> Lecture not found

### PUT /api/lecture/:id/start

Start a lecture

Request query params:

| key | example | description                         |
| --- | ------- | ----------------------------------- |
| id  | 2       | ID of the lecture, positive integer |

Response 200 -> Started the lecture \
Response 404 -> Lecture not found

### PUT /api/lecture/:id/finish

Finish a lecture

Request query params:

| key | example | description                         |
| --- | ------- | ----------------------------------- |
| id  | 2       | ID of the lecture, positive integer |

Response 200 -> Finished the lecture \
Response 404 -> Lecture not found

### DELETE /api/lecture/admin/:id

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin)) \

Delete a lecture

Request query params:

| key | example | description                         |
| --- | ------- | ----------------------------------- |
| id  | 2       | ID of the lecture, positive integer |

Response 200 -> Lecture deleted successfully \
Response 404 -> Lecture not found

## Leaderboard

### GET /api/leaderboard

**Prone to change:**

- Return a max of X profiles

Response 200 JSON:

```json
{
  "data": [
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
  ],
  "meta": "(paginationMeta)"
}
```

### GET /api/leaderboard/weekly

Only returns profiles which have been updated this week \
**Prone to change:**

- Return a max of X profiles
- Fixing the logic error

Response 200 JSON:

```json
{
  "data": [
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
  ],
  "meta": "(paginationMeta)"
}
```

## Blogs

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
  "blogDescription": "desc",
  "userId": 5,
  "createdAt": "2025-04-05T18:34:35.612Z",
  "updatedAt": "2025-04-05T18:34:35.612Z"
}
```

Response 404 -> Blog not found

### POST /api/blog/admin

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin)) \

Requires authorization (see [/api/auth/protected](#get-apiauthprotected)) \
Create a new blog

Request JSON:

```json
{
  "title": "title",
  "published": true,
  "content": "# Markdown",
  "blogDescription": "desc"
}
```

Response 201 JSON:

```json
{
  "id": 1,
  "title": "title",
  "published": true,
  "content": "# Markdown",
  "blogDescription": "desc",
  "userId": 5,
  "createdAt": "2025-04-05T18:34:35.612Z",
  "updatedAt": "2025-04-05T18:34:35.612Z"
}
```

Response 404 -> Blog not found

### PUT /api/blog/admin/:id/publish

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin)) \

Requires authorization (see [/api/auth/protected](#get-apiauthprotected)) \
Publish a blog

Request query params:

| key | example | description                      |
| --- | ------- | -------------------------------- |
| id  | 2       | ID of the blog, positive integer |

Response 200 -> Blog published successfully
Response 404 -> Blog not found

### PATCH /api/blog/admin/:id

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin)) \

Requires authorization (see [/api/auth/protected](#get-apiauthprotected)) \
Update a blog \
All of the fields are optional

Request query params:

| key | example | description                      |
| --- | ------- | -------------------------------- |
| id  | 2       | ID of the blog, positive integer |

Request JSON:

```json
{
  "title": "title",
  "published": true,
  "content": "# Markdown",
  "blogDescription": "desc"
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

Response 404 -> Blog not found

### DELETE /api/blog/admin/:id

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin)) \
Delete a blog

Request query params:

| key | example | description                      |
| --- | ------- | -------------------------------- |
| id  | 2       | ID of the blog, positive integer |

Response 200 -> Blog deleted successfully
Response 404 -> Blog not found

### GET /api/blog/user/:userId

Get all blogs belonging to a specific user

Request query params:

| key    | example | description                      |
| ------ | ------- | -------------------------------- |
| userId | 2       | ID of the user, positive integer |

Response 200 JSON:

```json
{
  "data": [
    {
      "id": 1,
      "title": "title",
      "published": true,
      "content": "# Markdown",
      "blogDescription": "desc",
      "userId": 5,
      "createdAt": "2025-04-05T18:34:35.612Z",
      "updatedAt": "2025-04-05T18:34:35.612Z"
    }
  ],
  "meta": "paginationMeta"
}
```

Response 404 -> User not found

### GET /api/blog/slug/:slug

Get a blog by its URL-friendly slug

Request query params:

| key  | example       | description                   |
| ---- | ------------- | ----------------------------- |
| slug | my-blog-title | URL-friendly slug of the blog |

Response 200 JSON:

```json
{
  "id": 1,
  "title": "title",
  "published": true,
  "content": "# Markdown",
  "blogDescription": "desc",
  "slug": "my-blog-title",
  "userId": 5,
  "createdAt": "2025-04-05T18:34:35.612Z",
  "updatedAt": "2025-04-05T18:34:35.612Z"
}
```

Response 404 -> Blog not found

### GET /api/blog/:id/comment

Requires authorization (see [/api/auth/protected](#get-apiauthprotected)) \
Fetch comments of blog with :id

| key | example | description |
| --- | ------- | ----------- |
| id  | 2       | ID of blog  |

Response 200 JSON:

```json
{
  "data": [
    {
      "id": 1,
      "userId": 16,
      "content": "content",
      "createdAt": "2025-04-23T15:35:46.360Z"
    }
  ],
  "meta": "(paginationMeta)"
}
```

Response 404 -> Blog not found

### POST /api/blog/:id/comment

Requires authorization (see [/api/auth/protected](#get-apiauthprotected)) \
Create new comment

| key | example | description |
| --- | ------- | ----------- |
| id  | 2       | ID of blog  |

Request JSON:

```json
{
  "content": "content"
}
```

Response 404 -> Blog not found

### DELETE /api/blog/admin/:id/comment/:commentId

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin)) \
Delete a comment

Request query params:

| key       | example | description   |
| --------- | ------- | ------------- |
| id        | 2       | ID of blog    |
| commentId | 2       | ID of comment |

Response 200 -> Comment successfully deleted \
Response 404 -> Blog not found

## Quizzes

Requires authorization (see [/api/auth/protected](#get-apiauthprotected))

### GET /api/quiz

Fetch all quizzes

Request query params:

| key   | example | description                |
| ----- | ------- | -------------------------- |
| page  | 2       | Current page               |
| limit | 20      | Number of quizzes per page |

Response 200 JSON:

```json
{
  "data": [
    {
      "id": 7,
      "questions": [
        {
          "id": 1,
          "text": "programming language",
          "quizId": 7,
          "score": 50,
          "options": ["html", "css", "js"]
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 9007199254740991,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### GET /api/quiz/:id

Request query params:

| key | example | description                      |
| --- | ------- | -------------------------------- |
| id  | 2       | ID of the quiz, positive integer |

Response 200 JSON:

```json
{
  "id": 7,
  "questions": [
    {
      "id": 1,
      "text": "programming language",
      "quizId": 7,
      "score": 50,
      "options": ["html", "css", "js"]
    }
  ]
}
```

Response 404 -> Quiz not found

### POST /api/quiz/admin

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin))

Create a new quiz

Request JSON:

```json
{
  "id": 7,
  "questions": [
    {
      "text": "programming language",
      "score": 50,
      "options": ["html", "css", "js"],
      "answer": "js"
    }
  ]
}
```

Response 201 JSON:

```json
{
  "id": 7,
  "questions": [
    {
      "text": "bestest lang",
      "score": 50,
      "options": ["html", "css", "js"]
    }
  ]
}
```

Response 404 -> Quiz not found

### PATCH /api/quiz/admin/:id

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin))

Update a quiz \
All of the fields are optional

Request query params:

| key | example | description                      |
| --- | ------- | -------------------------------- |
| id  | 2       | ID of the quiz, positive integer |

Request JSON:

```json
{
  "title": "The Woman in White",
  "content": "We need to reboot the back-end VGA transmitter!",
  "videoUrl": "https://fragrant-saloon.name/",
  "courseId": 2,
  "coins": 2234
}
```

Response 200 JSON:

```json
{
  "id": 28,
  "title": "The Woman in White",
  "content": "We need to reboot the back-end VGA transmitter!",
  "videoUrl": "https://fragrant-saloon.name/",
  "courseId": 10,
  "coins": 2234
}
```

Response 404 -> Quiz not found

### PUT /api/quiz/:id/submit

Submit the answers to a quiz

Request query params:

| key | example | description                      |
| --- | ------- | -------------------------------- |
| id  | 2       | ID of the quiz, positive integer |

Request JSON:

```json
{
  "3": "c",
  "4": "c++",
  "6": "rust",
  "7": "html",
  "8": "css",
  "9": "go",
  "12": "java"
}
```

Response 200 JSON:

```json
{
  "maxScore": 800,
  "score": 400,
  "ratio": 0.5
}
```

Response 404 -> Quiz not found

### DELETE /api/quiz/admin/:id

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin))

Delete a quiz

Request query params:

| key | example | description                      |
| --- | ------- | -------------------------------- |
| id  | 2       | ID of the quiz, positive integer |

Response 200 -> Quiz deleted successfully \
Response 404 -> Quiz not found

## Badges

Requires authorization (see [/api/auth/protected](#get-apiauthprotected))

### GET /api/store

Fetch all badges

Request query params:

| key   | example | description               |
| ----- | ------- | ------------------------- |
| page  | 2       | Current page              |
| limit | 20      | Number of Badges per page |

Response 200 JSON:

```json
{
  "data": [
    {
      "id": 1,
      "icon": "/badges/streak100.png",
      "title": "Streak 100",
      "cost": 50
    }
  ],
  "meta": {
    "page": 1,
    "limit": 9007199254740991,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### GET /api/store/:id

Request query params:

| key | example | description                       |
| --- | ------- | --------------------------------- |
| id  | 2       | ID of the badge, positive integer |

Response 200 JSON:

```json
{
  "id": 1,
  "icon": "/badges/streak100.png",
  "title": "Streak 100",
  "cost": 50
}
```

Response 404 -> Badge not found

### POST /api/store/admin

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin))

Create a new badge

Request JSON:

```json
{
  "icon": "/badges/streak100.png",
  "title": "Streak 100",
  "cost": 50
}
```

Response 201 JSON:

```json
{
  "id": 1,
  "icon": "/badges/streak100.png",
  "title": "Streak 100",
  "cost": 50
}
```

Response 404 -> badge not found

### PATCH /api/store/admin/:id

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin))

Update a badge \
All of the fields are optional

Request query params:

| key | example | description                       |
| --- | ------- | --------------------------------- |
| id  | 2       | ID of the badge, positive integer |

Request JSON:

```json
{
  "icon": "/badges/streak100.png",
  "title": "Streak 100",
  "cost": 50
}
```

Response 200 JSON:

```json
{
  "id": 1,
  "icon": "/badges/streak100.png",
  "title": "Streak 100",
  "cost": 50
}
```

Response 404 -> badge not found

### PUT /api/store/:id/buy

Buy a badge

Request query params:

| key | example | description                       |
| --- | ------- | --------------------------------- |
| id  | 2       | ID of the badge, positive integer |

Response 200 -> Badge bought successfully
Response 400 -> Insufficient funds
Response 404 -> Badge not found

### DELETE /api/store/admin/:id

Requires admin authorization (see [/api/auth/admin](#get-apiauthadmin))

Delete a badge

Request query params:

| key | example | description                       |
| --- | ------- | --------------------------------- |
| id  | 2       | ID of the badge, positive integer |

Response 200 -> Badge deleted successfully \
Response 404 -> Badge not found

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
