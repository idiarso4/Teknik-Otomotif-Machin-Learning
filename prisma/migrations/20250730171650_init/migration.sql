-- CreateTable
CREATE TABLE "sensor_readings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "engineTemp" REAL NOT NULL,
    "oilPressure" REAL NOT NULL,
    "batteryVoltage" REAL NOT NULL,
    "engineVibration" REAL NOT NULL,
    "rpm" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ai_detections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parameter" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "moduleId" TEXT NOT NULL,
    "userSession" TEXT NOT NULL,
    "completionPercentage" REAL NOT NULL,
    "quizScores" TEXT NOT NULL,
    "lastAccessed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "arduino_projects" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "pinConfig" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "configKey" TEXT NOT NULL,
    "configValue" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "system_config_configKey_key" ON "system_config"("configKey");
