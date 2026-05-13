const { PrismaClient } = require("@prisma/client");
const path = require("node:path");

const defaultDbPath = path.join(__dirname, "..", "prisma", "dev.db");

function dbPathFromUrl(databaseUrl) {
  if (!databaseUrl?.startsWith("file:")) return null;
  const rawPath = databaseUrl.slice(5);
  if (!rawPath) return null;
  return path.isAbsolute(rawPath) ? rawPath : path.join(__dirname, "..", "prisma", rawPath);
}

const dbPath = process.env.ATITHI_DB_PATH || dbPathFromUrl(process.env.DATABASE_URL) || defaultDbPath;
process.env.ATITHI_DB_PATH = dbPath;
process.env.DATABASE_URL = process.env.DATABASE_URL || `file:${dbPath}`;
const backupDir = process.env.ATITHI_BACKUP_DIR || path.join(__dirname, "..", "backups");

const prisma = new PrismaClient();

module.exports = { prisma, dbPath, backupDir };
