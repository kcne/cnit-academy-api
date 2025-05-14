-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
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
INSERT INTO "new_User" ("createdAt", "email", "expiresAt", "firstName", "id", "isEmailVerified", "languageCode", "lastName", "links", "password", "role", "totalCoins", "updatedAt", "verificationCode") SELECT "createdAt", "email", "expiresAt", "firstName", "id", "isEmailVerified", "languageCode", "lastName", "links", "password", "role", "totalCoins", "updatedAt", "verificationCode" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
