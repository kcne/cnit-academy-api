/*
  Warnings:

  - Added the required column `role` to the `RoleRequest` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RoleRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RoleRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RoleRequest" ("coverLetter", "createdAt", "id", "status", "updatedAt", "userId") SELECT "coverLetter", "createdAt", "id", "status", "updatedAt", "userId" FROM "RoleRequest";
DROP TABLE "RoleRequest";
ALTER TABLE "new_RoleRequest" RENAME TO "RoleRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
