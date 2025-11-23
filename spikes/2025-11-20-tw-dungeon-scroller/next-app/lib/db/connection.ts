/**
 * Database connection management
 */
import Database from 'better-sqlite3';
import path from 'path';

// Database path
export const DB_PATH = path.join(process.cwd(), 'data', 'game.db');

// Initialize database connection
let db: Database.Database | null = null;

/**
 * Get or initialize the database connection
 */
export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    // Import and run initialization (avoid circular dependency)
    const { initializeDatabase } = require('./init');
    initializeDatabase(db);
  }
  return db;
}
