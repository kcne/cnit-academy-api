/*
  Warnings:

  - You are about to drop the column `githubLink` on the `Professor` table. All the data in the column will be lost.
  - You are about to drop the column `linkedinLink` on the `Professor` table. All the data in the column will be lost.
  - You are about to drop the column `portfolioLink` on the `Professor` table. All the data in the column will be lost.
  - You are about to drop the column `githubLink` on the `RoleRequest` table. All the data in the column will be lost.
  - You are about to drop the column `linkedinLink` on the `RoleRequest` table. All the data in the column will be lost.
  - You are about to drop the column `portfolioLink` on the `RoleRequest` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Links" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleRequestId" INTEGER NOT NULL,
    "professorId" INTEGER,

    PRIMARY KEY ("key", "value", "userId", "roleRequestId"),
    CONSTRAINT "Links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Links_roleRequestId_fkey" FOREIGN KEY ("roleRequestId") REFERENCES "RoleRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Links_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Professor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "bio" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "photoURL" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Professor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Professor" ("age", "bio", "coverLetter", "createdAt", "id", "photoURL", "updatedAt", "userId") SELECT "age", "bio", "coverLetter", "createdAt", "id", "photoURL", "updatedAt", "userId" FROM "Professor";
DROP TABLE "Professor";
ALTER TABLE "new_Professor" RENAME TO "Professor";
CREATE UNIQUE INDEX "Professor_userId_key" ON "Professor"("userId");
CREATE TABLE "new_RoleRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "bio" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "photoURL" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RoleRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RoleRequest" ("age", "bio", "coverLetter", "createdAt", "id", "photoURL", "status", "updatedAt", "userId") SELECT "age", "bio", "coverLetter", "createdAt", "id", "photoURL", "status", "updatedAt", "userId" FROM "RoleRequest";
DROP TABLE "RoleRequest";
ALTER TABLE "new_RoleRequest" RENAME TO "RoleRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
