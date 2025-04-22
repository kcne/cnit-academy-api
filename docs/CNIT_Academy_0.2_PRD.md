# CNIT Academy 0.2 PRD

## Status: Draft

## Intro

This document outlines the Product Requirements for **CNIT Academy 0.2**. This phase focuses on enhancing the existing backend platform by incorporating several key features identified in the Analysis Report (`docs/Analysis_Report.md`). The goal is to add foundational elements for improved gamification, content structure, assessment, community interaction, administration, and progress tracking to prepare the platform for future growth and potential user testing, even though it is currently in a demo phase.

## Goals and Context

*   **Project Objectives:** Implement core backend functionality for Coin Utility, Assessments (Quizzes), Enhanced Content Structure (Modules), Badges, Basic Commenting, Admin/Instructor Roles, and Granular Progress Tracking.
*   **Measurable Outcomes:** Successful implementation and basic functionality demonstrated for all seven feature areas. (Specific KPIs are less relevant for this demo phase).
*   **Success Criteria:**
    *   APIs for new features are functional and adhere to existing API design patterns.
    *   Database schema changes support the new features.
    *   Basic interaction flows are possible (e.g., user earns coins, spends on a badge, takes a quiz, views progress, admin deletes a comment).
*   **Key Performance Indicators (KPIs):** N/A for demo phase (focus on feature completion).

## Features and Requirements

### Functional Requirements

*   **Coin Utility:** Users can spend earned coins on virtual items (e.g., profile badges).
*   **Assessments:** Users can take multiple-choice quizzes associated with lectures for self-assessment. Quiz completion/scores potentially award coins.
*   **Content Structure:** Introduce 'Modules' as an organizational layer between 'Courses' and 'Lectures'. Modules have descriptions and potentially other metadata.
*   **Badges:** Implement a system for awarding and displaying badges for achievements (Streaks, First Course Completion, Fast Learner).
*   **Commenting:** Users can add comments to Blog posts.
*   **Admin/Instructor Roles:** Introduce distinct 'Admin' and 'Instructor' roles with specific permissions.
    *   *Admin:* Can manage users (CRUD), manage all content types (Programs, Courses, Modules, Lectures, Blogs), manage comments (delete), manage badges (CRUD).
    *   *Instructor:* (Initial Scope TBD - potentially CRUD for Courses/Modules/Lectures they own?)
*   **Progress Tracking:** Track finished status for Modules and Lectures, quiz scores, and active days (streaks).

### Non-functional Requirements

*   **Technology:** Continue using the existing Node.js/TypeScript/Prisma stack. Introduce new libraries as needed.
*   **Performance:** APIs should remain reasonably performant; database queries optimized. (Formal load testing not required for MVP).
*   **Security:** New endpoints must implement existing authentication/authorization middleware appropriately. Role-based access control must be enforced.
*   **Code Quality:** Adhere to existing coding standards and practices. Include basic unit/integration tests for new services/controllers.

### User Experience Requirements

*   API responses for new features should be clear and consistent with existing responses.
*   Quiz interaction flow should be simple (submit answers, get score/feedback).
*   Badges should be clearly visible on user profiles.
*   Spending coins should provide immediate feedback (item unlocked, coin balance updated).

### Integration Requirements

*   None specified for this MVP.

### Testing Requirements

*   Unit tests for new services (business logic).
*   Integration tests for new API endpoints (controllers, request/response validation).
*   Manual testing of core user flows involving the new features.

## Epic Story List

*(Initial high-level breakdown - needs refinement)*

### Epic 0: Initial Manual Set Up or Provisioning

*   **Story 0.1:** Ensure environment setup allows for new role assignments (Admin/Instructor).
*   **Story 0.2:** Document any new environment variables needed (if any).

### Epic 1: Gamification Enhancements

*   **Story 1.1:** Design DB schema for storing purchasable items (e.g., badges, themes).
*   **Story 1.2:** Create API endpoint for users to list purchasable items.
*   **Story 1.3:** Create API endpoint for users to spend coins to purchase an item.
*   **Story 1.4:** Design DB schema for Badges and UserBadges (linking badges to users).
*   **Story 1.5:** Implement logic to award "Completed First Course" badge.
*   **Story 1.6:** Implement logic for tracking daily activity/streaks.
*   **Story 1.7:** Implement logic to award "Streak" badges (e.g., 5-day streak).
*   **Story 1.8:** Implement logic to award "Fast Learner" badge (criteria TBD - e.g., complete course within X days?).
*   **Story 1.9:** Create API endpoint to list badges owned by a user (for profile display).
*   **Story 1.10:** Create Admin endpoints for Badge CRUD.

### Epic 2: Content Structure & Assessment

*   **Story 2.1:** Design DB schema for Modules (linking Courses and Lectures). Add description field.
*   **Story 2.2:** Update Course CRUD endpoints/services to handle Modules.
*   **Story 2.3:** Create Module CRUD endpoints/services (likely Admin/Instructor only).
*   **Story 2.4:** Update Lecture CRUD endpoints/services to link to Modules instead of directly to Courses.
*   **Story 2.5:** Design DB schema for Quizzes and Questions (multiple-choice). Link Quizzes to Lectures.
*   **Story 2.6:** Create Quiz/Question CRUD endpoints/services (Admin/Instructor).
*   **Story 2.7:** Design DB schema for storing User Quiz Attempts/Scores.
*   **Story 2.8:** Create API endpoint for users to retrieve Quiz questions for a Lecture.
*   **Story 2.9:** Create API endpoint for users to submit Quiz answers and receive score/feedback.
*   **Story 2.10:** Implement logic to potentially award coins based on quiz score.

### Epic 3: Community & Moderation

*   **Story 3.1:** Design DB schema for Comments (linking to Blog posts and Users).
*   **Story 3.2:** Create API endpoint for users to add a comment to a Blog post.
*   **Story 3.3:** Create API endpoint to list comments for a Blog post.
*   **Story 3.4:** Create Admin API endpoint to delete a comment.

### Epic 4: User Roles & Permissions

*   **Story 4.1:** Add 'role' field to User model (e.g., 'User', 'Admin', 'Instructor').
*   **Story 4.2:** Implement middleware/decorators to check roles for protected routes.
*   **Story 4.3:** Define initial permissions for 'Instructor' role (e.g., CRUD on own Courses/Modules/Lectures/Quizzes?).
*   **Story 4.4:** Secure existing and new endpoints based on Admin/Instructor/User roles.
*   **Story 4.5:** Create Admin endpoint(s) to manage user roles.

### Epic 5: Progress Tracking

*   **Story 5.1:** Add 'finished' status tracking for Modules (linking User and Module).
*   **Story 5.2:** Update 'lecture finish' endpoint to potentially update Module progress.
*   **Story 5.3:** Store user quiz scores (linking User, Quiz, score) - Covered in Epic 2.
*   **Story 5.4:** Store user active days/streaks - Covered in Epic 1.
*   **Story 5.5:** Create API endpoint for users to view their progress (finished modules/lectures, quiz scores, active days).

### Epic N: Future Epic Enhancements (Beyond Scope of current PRD)

*   Advanced Gamification (Coin utility beyond badges, complex challenges)
*   Advanced Assessments (Different question types, required passing grades)
*   Diverse Content Types (Interactive coding, downloads)
*   Certificates
*   Advanced Community (Lecture comments, forums, messaging)
*   Payment Integration
*   Advanced Search/Filtering
*   Recommendations Engine
*   Notifications System

## Technology Stack

| Technology          | Version | Description                                      |
| ------------------- | ------- | ------------------------------------------------ |
| Node.js             | >=18    | JavaScript runtime environment                   |
| TypeScript          | Latest  | Superset of JavaScript adding static types       |
| Express (via NestJS? or raw?) | Current | Web framework (Confirm if using raw or NestJS) |
| Prisma              | Latest  | ORM for database access                          |
| PostgreSQL (or other?) | Current | SQL Database (Confirm specific DB)               |
| JWT                 | N/A     | Standard for access tokens                       |
| Potentially new libs | TBD     | Libraries for specific features (e.g., date-fns) |

*(Requires confirmation on Express usage and specific Database)*

## Project Structure (Proposed)

```plaintext
src/
├── app.ts
├── index.ts
├── prisma.ts
├── middlewares/
│   └── auth.middleware.ts
│   └── roles.middleware.ts  # New
├── utils/
│   └── ... (existing utils)
├── routes/
│   ├── authRoutes.ts
│   ├── profileRoutes.ts
│   ├── programRoutes.ts
│   ├── courseRoutes.ts
│   ├── moduleRoutes.ts      # New
│   ├── lectureRoutes.ts
│   ├── quizRoutes.ts        # New
│   ├── leaderboardRoutes.ts
│   ├── blogRoutes.ts
│   ├── commentRoutes.ts     # New
│   ├── badgeRoutes.ts       # New
│   ├── storeRoutes.ts       # New (for purchasable items)
│   └── adminRoutes.ts       # New (grouping admin actions)
├── controllers/
│   ├── authController.ts
│   ├── ... (existing controllers)
│   ├── moduleController.ts   # New
│   ├── quizController.ts     # New
│   ├── commentController.ts  # New
│   ├── badgeController.ts    # New
│   ├── storeController.ts    # New
│   └── adminController.ts    # New
├── services/
│   ├── authService.ts
│   ├── ... (existing services)
│   ├── moduleService.ts      # New
│   ├── quizService.ts        # New
│   ├── commentService.ts     # New
│   ├── badgeService.ts       # New
│   ├── storeService.ts       # New
│   ├── progressService.ts    # New (or integrate into profile/user service)
│   └── streakService.ts      # New (or integrate into user/gamification service)
└── prisma/
    └── schema.prisma # (To be updated significantly)
```

### POST MVP / PRD Features

*   See "Epic N: Future Epic Enhancements" above.

## Change Log

| Change        | Story ID | Description   |
| ------------- | -------- | ------------- |
| Initial draft | N/A      | Initial draft | 