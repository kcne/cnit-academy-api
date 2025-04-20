# CNIT Academy 0.2 - Epics & User Stories

Status: Draft

## Epic 0: Initial Manual Set Up & Configuration

**Goal:** Prepare the development environment and database for the new features.

*   **Story 0.1: Update Prisma Schema**
    *   **As a** Developer
    *   **I want** to update the `prisma/schema.prisma` file to include all new models and relations defined in the Architecture Document (User roles, Modules, Quizzes, Questions, Comments, Badges, UserBadges, StoreItems, UserItems, UserActivity, UserQuizAttempt, UserModuleProgress, UserLectureProgress),
    *   **so that** the database structure supports all new features.
    *   **AC:**
        *   `schema.prisma` includes definitions for all new models.
        *   Relations between new and existing models are correctly defined.
        *   Enums (like `Role`, `StoreItemType`) are defined.
        *   Relevant constraints (unique, onDelete) are applied.

*   **Story 0.2: Create Database Migration**
    *   **As a** Developer,
    *   **I want to** run `npx prisma migrate dev --name init-phase-0.2` (or similar),
    *   **so that** a new SQL migration file is generated based on the schema changes and applied to my development database (SQLite).
    *   **AC:**
        *   Migration command runs successfully.
        *   A new migration file is created in `prisma/migrations`.
        *   Development database schema reflects the changes.

*   **Story 0.3: Update Seed Data**
    *   **As a** Developer,
    *   **I want to** update the `prisma/seed.ts` script,
    *   **so that** it can create initial data for new models, including sample Admin/Instructor users, Badges (Streak, First Course, Fast Learner), purchasable StoreItems (e.g., the Badges), and potentially basic test content (Course->Module->Lecture->Quiz).
    *   **AC:**
        *   Seed script includes creation logic for new models.
        *   Seed script assigns `ADMIN` role to at least one user.
        *   Running `npx prisma db seed` populates the database with necessary sample data.

*   **Story 0.4: Document Environment Variables**
    *   **As a** Developer,
    *   **I want to** identify and document any new environment variables required (e.g., specific service keys, potentially updated JWT settings if roles impact payload),
    *   **so that** other developers can easily set up their environment.
    *   **AC:**
        *   Any new variables are added to `.env.example` or documented in `README.md`.
        *   Existing `.env` file needs these variables added locally.

## Epic 1: Gamification Enhancements

**Goal:** Implement core gamification mechanics including a store for coin spending, badges for achievements, and activity streaks.

*   **Story 1.1: Implement Purchasable Item Store (Schema & API)**
    *   **As a** Developer,
    *   **I want to** implement the `StoreItem` model, `StoreService`, `StoreController`, and `/api/store` routes,
    *   **so that** purchasable items (like badges or themes) can be managed and retrieved via the API.
    *   **AC:**
        *   `StoreItem` model implemented in `schema.prisma`.
        *   `StoreService` with `listAvailableItems()` method created.
        *   `StoreController` created.
        *   `GET /api/store/items` endpoint returns a list of available `StoreItem`s (publicly accessible).
        *   Admin endpoints (via `adminRoutes`?) for CRUD operations on `StoreItem`s are created (requires Admin role).

*   **Story 1.2: Implement Item Purchase Logic**
    *   **As a** Learner (User),
    *   **I want to** be able to purchase an available item from the store using my earned coins,
    *   **so that** I can unlock virtual goods like badges or themes.
    *   **AC:**
        *   `POST /api/store/buy/{itemId}` endpoint implemented (`storeController`, `storeService`).
        *   Requires authentication.
        *   Service logic checks if the user has sufficient `totalCoins`.
        *   Service logic checks if the `itemId` is valid and available.
        *   If successful, user's `totalCoins` are decremented.
        *   If successful and item type is `BADGE`, a `UserBadge` entry is created (linking user and badge).
        *   If successful and item type is `THEME` (or other), a `UserItem` entry is created.
        *   Returns success message on successful purchase.
        *   Returns appropriate error (400/403) if insufficient coins or invalid item.

*   **Story 1.3: Implement Badge Awarding System (Schema & Basic Structure)**
    *   **As a** Developer,
    *   **I want to** implement the `Badge` and `UserBadge` models, `BadgeService`, `BadgeController`, and `/api/badges` routes,
    *   **so that** badges can be defined and awarded to users, and users can see their earned badges.
    *   **AC:**
        *   `Badge` and `UserBadge` models implemented in `schema.prisma`.
        *   `BadgeService` created (will contain awarding logic later).
        *   `BadgeController` created.
        *   `GET /api/profile/me/badges` endpoint (or similar) returns a list of badges owned by the authenticated user.
        *   `GET /api/profile/{userId}/badges` endpoint returns a list of badges owned by a specific user (publicly viewable on profile).
        *   Admin endpoints for `Badge` CRUD implemented (`adminRoutes`).

*   **Story 1.4: Award "Completed First Course" Badge**
    *   **As a** Developer,
    *   **I want to** integrate logic into the "finish course" process,
    *   **so that** a user is automatically awarded the "Completed First Course" badge the first time they finish any course.
    *   **AC:**
        *   Requires existing "finish course" endpoint/service (`CourseService`?).
        *   When a user finishes a course, check if they have finished any course before.
        *   If it's their first course completion, check if they already have the "Completed First Course" badge.
        *   If not, award the badge using `BadgeService` (creating a `UserBadge` entry).

*   **Story 1.5: Track Daily Activity & Streaks**
    *   **As a** Developer,
    *   **I want to** implement the `UserActivity` model and logic (potentially in a `GamificationService` or `UserService`) to track daily user activity (e.g., based on login or finishing a lecture/quiz),
    *   **so that** we can calculate consecutive daily streaks.
    *   **AC:**
        *   `UserActivity` model implemented in `schema.prisma`.
        *   Logic exists to record a `UserActivity` entry upon a relevant user action (e.g., login, lecture finish - decide trigger). Ensure only one entry per user per day is needed for streak calculation.
        *   A service method (`calculateStreak(userId)`) can determine the user's current consecutive day streak based on `UserActivity` timestamps.

*   **Story 1.6: Award "Streak" Badges**
    *   **As a** Developer,
    *   **I want to** integrate logic (potentially triggered by the activity tracking in Story 1.5),
    *   **so that** a user is automatically awarded predefined "Streak" badges (e.g., "5-Day Streak") when their calculated streak reaches the target number.
    *   **AC:**
        *   Streak calculation logic (Story 1.5) exists.
        *   When user activity is logged, check the new streak length.
        *   If the streak length matches a defined Badge criteria (e.g., 5 days) and the user doesn't already have that badge, award it using `BadgeService`.

*   **Story 1.7: Award "Fast Learner" Badge**
    *   **As a** Developer,
    *   **I want to** define the criteria for the "Fast Learner" badge (e.g., finishing a course within X days of starting it) and implement the awarding logic,
    *   **so that** users are recognized for rapid course completion.
    *   **AC:**
        *   Criteria defined (e.g., Course completion time < Threshold).
        *   Need to track course start time (maybe first lecture finish time?).
        *   Logic integrated into the "finish course" process.
        *   If criteria met and user doesn't have the badge, award it via `BadgeService`.

## Epic 2: Content Structure & Assessment

**Goal:** Enhance content organization by introducing Modules and provide basic assessment capabilities through multiple-choice quizzes.

*   **Story 2.1: Implement Modules (Schema & Linking)**
    *   **As a** Developer,
    *   **I want to** implement the `Module` model and update `Course` and `Lecture` models,
    *   **so that** Courses contain Modules, and Lectures belong to Modules, establishing the `Course -> Module -> Lecture` hierarchy.
    *   **AC:**
        *   `Module` model created in `schema.prisma` with fields (title, description, courseId, order).
        *   `Course` model updated to have a `modules Module[]` relation (replace `lectures Lecture[]`).
        *   `Lecture` model updated to have a `moduleId Int` and `module Module` relation (remove direct `courseId` if applicable).
        *   Migrations applied successfully.

*   **Story 2.2: Implement Module CRUD API**
    *   **As an** Admin or Instructor,
    *   **I want** API endpoints to Create, Read, Update, and Delete Modules within a Course,
    *   **so that** I can organize course content effectively.
    *   **AC:**
        *   `moduleRoutes`, `moduleController`, `moduleService` created.
        *   `POST /api/courses/{courseId}/modules` creates a module.
        *   `GET /api/courses/{courseId}/modules` lists modules for a course.
        *   `GET /api/modules/{moduleId}` retrieves a specific module (potentially including its lectures).
        *   `PATCH /api/modules/{moduleId}` updates a module's details (title, description, order).
        *   `DELETE /api/modules/{moduleId}` deletes a module.
        *   Endpoints secured appropriately (Admin/Instructor roles).

*   **Story 2.3: Update Course/Lecture APIs for Modules**
    *   **As a** Developer,
    *   **I want to** update the existing Course and Lecture API endpoints and services,
    *   **so that** they correctly interact with the new Module structure (e.g., fetching a course includes its modules and lectures, creating a lecture links it to a module).
    *   **AC:**
        *   `GET /api/courses/{courseId}` response now includes modules and their lectures.
        *   `POST /api/lectures` (or similar) now requires `moduleId` instead of `courseId`.
        *   Existing functionality related to fetching/managing lectures within courses is updated.

*   **Story 2.4: Implement Quizzes & Questions (Schema & Linking)**
    *   **As a** Developer,
    *   **I want to** implement the `Quiz` and `Question` models, linking Quizzes one-to-one with Lectures,
    *   **so that** the database can store quiz structures associated with specific learning content.
    *   **AC:**
        *   `Quiz` model created in `schema.prisma` with `lectureId Int @unique`.
        *   `Question` model created with fields (text, quizId, options Json, order).
        *   Relation set up between `Quiz` and `Lecture`.
        *   Relation set up between `Quiz` and `Question`.
        *   Migrations applied successfully.

*   **Story 2.5: Implement Quiz/Question CRUD API**
    *   **As an** Admin or Instructor,
    *   **I want** API endpoints to Create, Read, Update, and Delete Quizzes and their associated Questions,
    *   **so that** I can create assessments for lectures.
    *   **AC:**
        *   `quizRoutes`, `quizController`, `quizService` created.
        *   `POST /api/lectures/{lectureId}/quiz` creates a Quiz for a lecture (and potentially initial questions).
        *   `GET /api/lectures/{lectureId}/quiz` retrieves the quiz structure (questions & options, *without* correct answers marked) for a lecture.
        *   `PATCH /api/quizzes/{quizId}` updates quiz details (if any).
        *   `DELETE /api/quizzes/{quizId}` deletes a quiz and its questions.
        *   Endpoints for CRUD operations on `Questions` within a `Quiz` (e.g., `POST /api/quizzes/{quizId}/questions`).
        *   Endpoints secured appropriately (Admin/Instructor roles).

*   **Story 2.6: Implement Quiz Attempt Tracking (Schema & API)**
    *   **As a** Developer,
    *   **I want to** implement the `UserQuizAttempt` model and API endpoints for submitting quiz answers,
    *   **so that** user attempts can be recorded and scored.
    *   **AC:**
        *   `UserQuizAttempt` model created in `schema.prisma` (userId, quizId, score, submittedAnswers Json).
        *   `POST /api/quizzes/{quizId}/submit` endpoint created (`quizController`, `quizService`).
        *   Requires authentication.
        *   Accepts user answers in the request body.
        *   Service fetches the correct answers for the quiz.
        *   Service calculates the score.
        *   Service creates a `UserQuizAttempt` record.
        *   Endpoint returns the score and potentially feedback (e.g., which questions were right/wrong).

*   **Story 2.7: Award Coins for Quiz Completion**
    *   **As a** Developer,
    *   **I want to** integrate logic into the quiz submission process (Story 2.6),
    *   **so that** users can be awarded a predefined number of coins based on their quiz score (e.g., award coins if score > 70%).
    *   **AC:**
        *   Quiz submission service (`quizService`) calculates the score.
        *   Based on the score and predefined rules, call a `GamificationService` method to award coins.
        *   The response from `POST /api/quizzes/{quizId}/submit` indicates if coins were awarded.

## Epic 3: Community & Moderation

**Goal:** Enable basic community interaction via comments on blog posts.

*   **Story 3.1: Implement Comments (Schema & API)**
    *   **As a** Developer,
    *   **I want to** implement the `Comment` model (linking to `Blog` and `User`), `CommentService`, `CommentController`, and `/api/comments` routes,
    *   **so that** users can add and view comments on blog posts.
    *   **AC:**
        *   `Comment` model created in `schema.prisma` (content, blogId, userId).
        *   `CommentService`, `CommentController` created.
        *   `POST /api/blogs/{blogId}/comments` endpoint allows authenticated users to add a comment.
        *   `GET /api/blogs/{blogId}/comments` endpoint retrieves all comments for a blog post (paginated). Include user information (name, PFP) with comments.

*   **Story 3.2: Implement Comment Deletion (Admin)**
    *   **As an** Admin,
    *   **I want** an API endpoint to delete any comment,
    *   **so that** I can moderate content if necessary.
    *   **AC:**
        *   `DELETE /api/comments/{commentId}` endpoint created (likely via `adminRoutes`/`adminController`).
        *   Requires Admin role.
        *   Successfully deletes the specified comment.

## Epic 4: User Roles & Permissions

**Goal:** Implement role-based access control (RBAC) to distinguish between regular users, instructors, and administrators.

*   **Story 4.1: Add Role to User Model**
    *   **As a** Developer,
    *   **I want to** add a `role` field (enum: `USER`, `INSTRUCTOR`, `ADMIN`) to the `User` model in `schema.prisma`, defaulting to `USER`,
    *   **so that** each user has an assigned role.
    *   **AC:**
        *   `Role` enum added to `schema.prisma`.
        *   `role Role @default(USER)` added to `User` model.
        *   Migration applied successfully.
        *   Existing users are defaulted to `USER` role upon migration.

*   **Story 4.2: Implement Role-Checking Middleware**
    *   **As a** Developer,
    *   **I want to** create an Express middleware (`roles.middleware.ts`),
    *   **so that** it can check if the authenticated user (attached by `auth.middleware.ts`) has one of the required roles for accessing a specific route.
    *   **AC:**
        *   Middleware function created (`checkRoles(roles: Role[])`).
        *   Retrieves user from request (e.g., `req.user`).
        *   Checks if `req.user.role` is included in the allowed `roles` array.
        *   Calls `next()` if authorized, otherwise sends a 403 Forbidden response.

*   **Story 4.3: Secure Endpoints with Role Middleware**
    *   **As a** Developer,
    *   **I want to** apply the `checkRoles` middleware to all relevant routes (existing and new),
    *   **so that** access is restricted based on user roles (e.g., Admin for user management, Instructor/Admin for content creation).
    *   **AC:**
        *   `checkRoles([Role.ADMIN])` applied to admin-only routes.
        *   `checkRoles([Role.ADMIN, Role.INSTRUCTOR])` applied to instructor/admin routes (e.g., course/module/lecture/quiz creation).
        *   `checkRoles([Role.USER, Role.ADMIN, Role.INSTRUCTOR])` (or just `authMiddleware` if all authenticated users allowed) applied to user routes.
        *   Access restrictions are enforced correctly.

*   **Story 4.4: Implement Role Management API (Admin)**
    *   **As an** Admin,
    *   **I want** API endpoints to view and change a user's role,
    *   **so that** I can promote users to Instructor or Admin roles.
    *   **AC:**
        *   `GET /api/admin/users` endpoint lists users including their roles (Admin only).
        *   `PATCH /api/admin/users/{userId}/role` endpoint allows updating a user's role (Admin only).
        *   Request validation ensures the role is a valid `Role` enum value.

*   **Story 4.5: Define Instructor Permissions (Initial Scope)**
    *   **As a** Product Owner/Developer,
    *   **I want to** clearly define and implement the *initial* set of permissions for the `INSTRUCTOR` role for this MVP,
    *   **so that** Instructors have the necessary capabilities without having full admin access.
    *   **AC:**
        *   Decision made: Can Instructors CRUD *only* Courses/Modules/Lectures/Quizzes they "own" (requires adding ownership concept), or *any* content? (Let's assume *any* for simplicity initially, but requires explicit confirmation).
        *   Relevant CRUD endpoints for Course, Module, Lecture, Quiz are secured with `checkRoles([Role.ADMIN, Role.INSTRUCTOR])`.

## Epic 5: Progress Tracking

**Goal:** Implement more granular tracking of user progress through modules, lectures, and quizzes.

*   **Story 5.1: Track Module & Lecture Finish Status**
    *   **As a** Developer,
    *   **I want to** implement `UserModuleProgress` and `UserLectureProgress` models and logic to track when a user finishes a module or lecture,
    *   **so that** their progress can be accurately recorded and displayed.
    *   **AC:**
        *   `UserModuleProgress` and `UserLectureProgress` models created in `schema.prisma`.
        *   Existing "finish lecture" endpoint (`PUT /api/lectures/{lectureId}/finish`?) updated to create/update a `UserLectureProgress` record (setting `isFinished=true`, `finishedAt`).
        *   Logic implemented (potentially in `LectureService` or `ProgressService`): When a lecture is finished, check if all other lectures in the same module are also finished by that user. If yes, create/update the corresponding `UserModuleProgress` record (`isFinished=true`, `finishedAt`).
        *   Consider adding `lastAccessedAt` updates when a user fetches module/lecture content.

*   **Story 5.2: Track Quiz Attempts & Scores**
    *   **As a** Developer,
    *   **I want** the system to store the score for each quiz attempt a user makes,
    *   **so that** users and potentially instructors/admins can review performance.
    *   **AC:**
        *   Covered by Story 2.6 (Quiz Attempt Tracking). `UserQuizAttempt` stores `userId`, `quizId`, and `score`.

*   **Story 5.3: Track Active Days/Streaks**
    *   **As a** Developer,
    *   **I want** the system to log user activity daily to enable streak calculations,
    *   **so that** streak-based badges and features can be implemented.
    *   **AC:**
        *   Covered by Story 1.5 (Track Daily Activity & Streaks).

*   **Story 5.4: Implement User Progress API Endpoint**
    *   **As a** Learner (User),
    *   **I want** an API endpoint to retrieve my overall progress,
    *   **so that** I can see which modules/lectures I've finished, my quiz scores, and potentially my current activity streak.
    *   **AC:**
        *   `GET /api/profile/me/progress` endpoint created (`profileController` or `progressController`).
        *   Requires authentication.
        *   Service (`ProgressService`?) fetches data from `UserModuleProgress`, `UserLectureProgress`, `UserQuizAttempt`, and calculates current streak using `UserActivity`.
        *   Returns a consolidated JSON response summarizing the user's progress.

# Story {N}: {Title}

## Story

**As a** {role}
**I want** {action}
**so that** {benefit}.

## Status

Draft OR In-Progress OR Complete

## Context

{A paragraph explaining the background, current state, and why this story is needed. Include any relevant technical context or business drivers.}

## Estimation

Story Points: {Story Points (1 SP=1 day of Human Development, or 10 minutes of AI development)}

## Acceptance Criteria

1.  - [ ] {First criterion - ordered by logical progression}
2.  - [ ] {Second criterion}
3.  - [ ] {Third criterion}
         {Use - [x] for completed items}

## Subtasks

1.  - [ ] {Major Task Group 1}
   1. - [ ] {Subtask}
   2. - [ ] {Subtask}
   3. - [ ] {Subtask}
2.  - [ ] {Major Task Group 2}
   1. - [ ] {Subtask}
   2. - [ ] {Subtask}
   3. - [ ] {Subtask}
            {Use - [x] for completed items, - [-] for skipped/cancelled items}

## Testing Requirements:**

    - Reiterate the required code coverage percentage (e.g., >= 85%).

## Story Wrap Up (To be filled in AFTER agent execution):**

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Agent Credit or Cost:** `<Cost/Credits Consumed>`
- **Date/Time Completed:** `<Timestamp>`
- **Commit Hash:** `<Git Commit Hash of resulting code>`
- **Change Log**
  - change X
  - change Y
    ...

--- 