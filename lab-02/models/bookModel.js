const { getDB } = require('../config/database');

/**
 * Model responsible for all SQLite database operations on the 'book' table.
 * Uses parameterized queries (?) to guarantee protection against SQL injection.
 */
class BookModel {
  /**
   * Retrieves all books from the database.
   * @returns {Promise<Array<Object>>}
   */
  static async getAll() {
    const db = getDB();
    const sql = `SELECT * FROM book ORDER BY id ASC;`;
    return await db.all(sql);
  }

  /**
   * Retrieves a single book by its ID.
   * @param {number} id - Book ID
   * @returns {Promise<Object|undefined>}
   */
  static async getById(id) {
    const db = getDB();
    const sql = `SELECT * FROM book WHERE id = ?;`;
    return await db.get(sql, [id]);
  }

  /**
   * Inserts a new book into the database.
   * @param {Object} bookData - Book details
   * @param {string} bookData.title
   * @param {string} bookData.author
   * @param {number} bookData.price
   * @param {number} bookData.pages
   * @returns {Promise<Object>} The created book object including generated ID
   */
  static async create({ title, author, price, pages }) {
    const db = getDB();
    const sql = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;
    const result = await db.run(sql, [title, author, price, pages]);
    return {
      id: result.lastID,
      title,
      author,
      price: Number(price),
      pages: Number(pages),
    };
  }

  /**
   * Updates an existing book by ID.
   * @param {number} id - Book ID
   * @param {Object} bookData - New book details
   * @returns {Promise<number>} Number of rows updated (0 if not found)
   */
  static async update(id, { title, author, price, pages }) {
    const db = getDB();
    const sql = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `;
    const result = await db.run(sql, [title, author, price, pages, id]);
    return result.changes;
  }

  /**
   * Deletes a book by ID.
   * @param {number} id - Book ID
   * @returns {Promise<number>} Number of rows deleted (0 if not found)
   */
  static async delete(id) {
    const db = getDB();
    const sql = `DELETE FROM book WHERE id = ?;`;
    const result = await db.run(sql, [id]);
    return result.changes;
  }

  /**
   * Counts the total number of books in the table.
   * @returns {Promise<number>}
   */
  static async count() {
    const db = getDB();
    const sql = `SELECT COUNT(*) AS total FROM book;`;
    const row = await db.get(sql);
    return row.total;
  }
}

module.exports = BookModel;

