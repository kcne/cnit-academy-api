-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Program" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "founder" TEXT NOT NULL,
    "durationInDays" INTEGER NOT NULL,
    "appliedCount" INTEGER NOT NULL DEFAULT 0,
    "studentCount" INTEGER NOT NULL DEFAULT 0,
    "applicationDeadline" DATETIME NOT NULL,
    "CreatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Program" ("CreatedAt", "applicationDeadline", "appliedCount", "description", "durationInDays", "founder", "id", "studentCount", "title") SELECT "CreatedAt", "applicationDeadline", coalesce("appliedCount", 0) AS "appliedCount", "description", "durationInDays", "founder", "id", coalesce("studentCount", 0) AS "studentCount", "title" FROM "Program";
DROP TABLE "Program";
ALTER TABLE "new_Program" RENAME TO "Program";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
