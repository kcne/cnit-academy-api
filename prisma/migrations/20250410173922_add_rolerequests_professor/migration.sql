/*
  Warnings:

  - You are about to drop the column `numberOfStudents` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `appliedCount` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `studentCount` on the `Program` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Blog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Lecture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "videoUrl" TEXT,
    "courseId" INTEGER NOT NULL,
    "coins" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Lecture_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserLecture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "lectureId" INTEGER NOT NULL,
    "finished" DATETIME,
    CONSTRAINT "UserLecture_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserLecture_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserCourse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "finished" DATETIME,
    CONSTRAINT "UserCourse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserProgram" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "programId" INTEGER NOT NULL,
    "applied" DATETIME,
    "enrolled" DATETIME,
    "finished" DATETIME,
    CONSTRAINT "UserProgram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoleRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "bio" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "photoURL" TEXT NOT NULL,
    "likedinLink" TEXT,
    "githubLink" TEXT,
    "portfolioLink" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RoleRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Professor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "bio" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "photoURL" TEXT NOT NULL,
    "likedinLink" TEXT,
    "githubLink" TEXT,
    "portfolioLink" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Professor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Blog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT NOT NULL,
    "blogDescription" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Blog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Blog" ("blogDescription", "content", "createdAt", "id", "published", "title", "updatedAt") SELECT "blogDescription", "content", "createdAt", "id", "published", "title", "updatedAt" FROM "Blog";
DROP TABLE "Blog";
ALTER TABLE "new_Blog" RENAME TO "Blog";
CREATE TABLE "new_Course" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "durationInHours" REAL,
    "coins" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Course" ("description", "durationInHours", "id", "title") SELECT "description", "durationInHours", "id", "title" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE TABLE "new_Education" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "startPeriod" DATETIME NOT NULL,
    "endPeriod" DATETIME,
    "profileId" INTEGER NOT NULL,
    CONSTRAINT "Education_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Education" ("description", "endPeriod", "id", "organization", "profileId", "startPeriod", "title") SELECT "description", "endPeriod", "id", "organization", "profileId", "startPeriod", "title" FROM "Education";
DROP TABLE "Education";
ALTER TABLE "new_Education" RENAME TO "Education";
CREATE TABLE "new_Experience" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "startPeriod" DATETIME NOT NULL,
    "endPeriod" DATETIME,
    "profileId" INTEGER NOT NULL,
    CONSTRAINT "Experience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Experience" ("description", "endPeriod", "id", "organization", "profileId", "startPeriod", "title") SELECT "description", "endPeriod", "id", "organization", "profileId", "startPeriod", "title" FROM "Experience";
DROP TABLE "Experience";
ALTER TABLE "new_Experience" RENAME TO "Experience";
CREATE TABLE "new_Program" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "founder" TEXT NOT NULL,
    "durationInDays" INTEGER NOT NULL,
    "applicationDeadline" DATETIME NOT NULL,
    "CreatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coins" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Program" ("CreatedAt", "applicationDeadline", "description", "durationInDays", "founder", "id", "title") SELECT "CreatedAt", "applicationDeadline", "description", "durationInDays", "founder", "id", "title" FROM "Program";
DROP TABLE "Program";
ALTER TABLE "new_Program" RENAME TO "Program";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserLecture_userId_lectureId_key" ON "UserLecture"("userId", "lectureId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCourse_userId_courseId_key" ON "UserCourse"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgram_userId_programId_key" ON "UserProgram"("userId", "programId");

-- CreateIndex
CREATE UNIQUE INDEX "Professor_userId_key" ON "Professor"("userId");
