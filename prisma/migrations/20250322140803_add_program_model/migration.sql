-- CreateTable
CREATE TABLE "Program" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "founder" TEXT NOT NULL,
    "durationInDays" INTEGER NOT NULL,
    "appliedCount" INTEGER DEFAULT 0,
    "studentCount" INTEGER DEFAULT 0,
    "applicationDeadline" DATETIME NOT NULL,
    "CreatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
