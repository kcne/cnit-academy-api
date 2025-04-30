-- CreateTable
CREATE TABLE "Language" (
    "languageCode" TEXT NOT NULL PRIMARY KEY,
    "language" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationCode" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "totalCoins" INTEGER NOT NULL DEFAULT 0,
    "languageCode" TEXT NOT NULL DEFAULT 'en',
    CONSTRAINT "User_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language" ("languageCode") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "expiresAt", "firstName", "id", "isEmailVerified", "lastName", "password", "totalCoins", "updatedAt", "verificationCode") SELECT "createdAt", "email", "expiresAt", "firstName", "id", "isEmailVerified", "lastName", "password", "totalCoins", "updatedAt", "verificationCode" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
