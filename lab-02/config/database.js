const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const dbPath = path.join(__dirname, '..', 'database.db');
let dbInstance = null;

/**
 * Initial seed data – inserted only when the book table is empty.
 * This ensures data is present on fresh Render deployments.
 */
const SEED_BOOKS = [
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 450, pages: 281 },
  { title: '1984', author: 'George Orwell', price: 350, pages: 328 },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 299, pages: 180 },
  { title: 'Pride and Prejudice', author: 'Jane Austen', price: 399, pages: 279 },
  { title: 'The Catcher in the Rye', author: 'J.D. Salinger', price: 420, pages: 234 },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', price: 499, pages: 310 },
  { title: 'Fahrenheit 451', author: 'Ray Bradbury', price: 320, pages: 249 },
  { title: 'Brave New World', author: 'Aldous Huxley', price: 380, pages: 268 },
  { title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', price: 550, pages: 671 },
  { title: 'The Alchemist', author: 'Paulo Coelho', price: 250, pages: 208 },
];

/**
 * Initializes the SQLite database connection, creates the table,
 * and seeds initial data if the table is empty.
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

    // Create the book table if it does not exist
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    // Seed initial data only if the table is empty
    const row = await dbInstance.get('SELECT COUNT(*) AS total FROM book;');
    if (row.total === 0) {
      const insertSQL = `
        INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);
      `;
      for (const book of SEED_BOOKS) {
        await dbInstance.run(insertSQL, [book.title, book.author, book.price, book.pages]);
      }
      console.log(`Seeded ${SEED_BOOKS.length} initial books into the database.`);
    }

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
