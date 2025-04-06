/*
  Warnings:

  - You are about to drop the column `numberOfStudents` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `appliedCount` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `studentCount` on the `Program` table. All the data in the column will be lost.

*/
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
    "finished" DATETIME,
    CONSTRAINT "UserProgram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "durationInHours" REAL
);
INSERT INTO "new_Course" ("description", "durationInHours", "id", "title") SELECT "description", "durationInHours", "id", "title" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE TABLE "new_Program" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "founder" TEXT NOT NULL,
    "durationInDays" INTEGER NOT NULL,
    "applicationDeadline" DATETIME NOT NULL,
    "CreatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
