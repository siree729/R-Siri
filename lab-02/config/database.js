const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const dbPath = path.join(__dirname, '..', 'database.db');
let dbInstance = null;

/**
 * Initializes the SQLite database connection and ensures tables exist.
 * @returns {Promise<import('sqlite').Database>}
 */
async function initializeDB() {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Ensure the book table exists with all required columns and constraints
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    console.log(`Connected to SQLite database at: ${dbPath}`);
    return dbInstance;
  } catch (error) {
    console.error(`Failed to connect to SQLite database: ${error.message}`);
    throw error;
  }
}

/**
 * Returns the active SQLite database instance.
 * @returns {import('sqlite').Database}
 */
function getDB() {
  if (!dbInstance) {
    throw new Error('Database not initialized. Please call initializeDB() first.');
  }
  return dbInstance;
}

/**
 * Closes the active database connection.
 */
async function closeDB() {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    console.log('Database connection closed.');
  }
}

module.exports = {
  initializeDB,
  getDB,
  closeDB,
  dbPath,
};

