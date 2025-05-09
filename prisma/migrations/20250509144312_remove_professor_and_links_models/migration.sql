/*
  Warnings:

  - You are about to drop the `Links` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Professor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `age` on the `RoleRequest` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `RoleRequest` table. All the data in the column will be lost.
  - You are about to drop the column `photoURL` on the `RoleRequest` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Professor_userId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Links";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Professor";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RoleRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RoleRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RoleRequest" ("coverLetter", "createdAt", "id", "status", "updatedAt", "userId") SELECT "coverLetter", "createdAt", "id", "status", "updatedAt", "userId" FROM "RoleRequest";
DROP TABLE "RoleRequest";
ALTER TABLE "new_RoleRequest" RENAME TO "RoleRequest";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationCode" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "totalCoins" INTEGER NOT NULL DEFAULT 0,
    "languageCode" TEXT NOT NULL DEFAULT 'en',
    "links" JSONB NOT NULL DEFAULT [],
    CONSTRAINT "User_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language" ("languageCode") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "expiresAt", "firstName", "id", "isEmailVerified", "languageCode", "lastName", "password", "role", "totalCoins", "updatedAt", "verificationCode") SELECT "createdAt", "email", "expiresAt", "firstName", "id", "isEmailVerified", "languageCode", "lastName", "password", "role", "totalCoins", "updatedAt", "verificationCode" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
