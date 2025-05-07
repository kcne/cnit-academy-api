/*
  Warnings:

  - You are about to drop the column `likedinLink` on the `Professor` table. All the data in the column will be lost.
  - You are about to drop the column `likedinLink` on the `RoleRequest` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Professor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "bio" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "photoURL" TEXT NOT NULL,
    "linkedinLink" TEXT,
    "githubLink" TEXT,
    "portfolioLink" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Professor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Professor" ("age", "bio", "coverLetter", "createdAt", "githubLink", "id", "photoURL", "portfolioLink", "updatedAt", "userId") SELECT "age", "bio", "coverLetter", "createdAt", "githubLink", "id", "photoURL", "portfolioLink", "updatedAt", "userId" FROM "Professor";
DROP TABLE "Professor";
ALTER TABLE "new_Professor" RENAME TO "Professor";
CREATE UNIQUE INDEX "Professor_userId_key" ON "Professor"("userId");
CREATE TABLE "new_RoleRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "bio" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "photoURL" TEXT NOT NULL,
    "linkedinLink" TEXT,
    "githubLink" TEXT,
    "portfolioLink" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RoleRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RoleRequest" ("age", "bio", "coverLetter", "createdAt", "githubLink", "id", "photoURL", "portfolioLink", "status", "updatedAt", "userId") SELECT "age", "bio", "coverLetter", "createdAt", "githubLink", "id", "photoURL", "portfolioLink", "status", "updatedAt", "userId" FROM "RoleRequest";
DROP TABLE "RoleRequest";
ALTER TABLE "new_RoleRequest" RENAME TO "RoleRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
