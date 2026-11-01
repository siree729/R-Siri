const BookModel = require('../models/bookModel');

/**
 * Controller handling HTTP requests and responses for the /books API.
 */
class BookController {
  /**
   * Helper to validate and parse bookId parameter.
   * @param {string} param - Route parameter value
   * @returns {{ valid: boolean, id?: number, error?: string }}
   */
  static parseBookId(param) {
    const id = Number(param);
    if (!Number.isInteger(id) || id <= 0) {
      return {
        valid: false,
        error: 'Invalid Book ID: must be a positive integer.',
      };
    }
    return { valid: true, id };
  }

  /**
   * GET /books/
   * Retrieves all books.
   */
  static async getAllBooks(req, res, next) {
    try {
      const books = await BookModel.getAll();
      return res.status(200).json(books);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /books/:bookId/
   * Retrieves a single book by ID.
   */
  static async getBookById(req, res, next) {
    try {
      const { valid, id, error } = BookController.parseBookId(req.params.bookId);
      if (!valid) {
        return res.status(400).json({ error });
      }

      const book = await BookModel.getById(id);
      if (!book) {
        return res.status(404).json({ error: `Book with ID ${id} not found.` });
      }

      return res.status(200).json(book);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /books/
   * Adds a new book to the database.
   */
  static async createBook(req, res, next) {
    try {
      const { title, author, price, pages } = req.body;

      // Validation
      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
      }
      if (!author || typeof author !== 'string' || author.trim() === '') {
        return res.status(400).json({ error: 'Author is required and must be a non-empty string.' });
      }
      if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
        return res.status(400).json({ error: 'Price is required and must be a non-negative number.' });
      }
      if (pages === undefined || !Number.isInteger(Number(pages)) || Number(pages) <= 0) {
        return res.status(400).json({ error: 'Pages is required and must be a positive integer.' });
      }

      const newBook = await BookModel.create({
        title: title.trim(),
        author: author.trim(),
        price: Number(price),
        pages: Number(pages),
      });

      return res.status(201).json({
        message: 'Book Added Successfully',
        book: newBook,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /books/:bookId/
   * Updates an existing book.
   */
  static async updateBook(req, res, next) {
    try {
      const { valid, id, error } = BookController.parseBookId(req.params.bookId);
      if (!valid) {
        return res.status(400).json({ error });
      }

      // Check if book exists first
      const existingBook = await BookModel.getById(id);
      if (!existingBook) {
        return res.status(404).json({ error: `Book with ID ${id} not found.` });
      }

      const { title, author, price, pages } = req.body;

      // Validation
      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
      }
      if (!author || typeof author !== 'string' || author.trim() === '') {
        return res.status(400).json({ error: 'Author is required and must be a non-empty string.' });
      }
      if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
        return res.status(400).json({ error: 'Price is required and must be a non-negative number.' });
      }
      if (pages === undefined || !Number.isInteger(Number(pages)) || Number(pages) <= 0) {
        return res.status(400).json({ error: 'Pages is required and must be a positive integer.' });
      }

      const updatedData = {
        title: title.trim(),
        author: author.trim(),
        price: Number(price),
        pages: Number(pages),
      };

      await BookModel.update(id, updatedData);

      return res.status(200).json({
        message: 'Book Updated Successfully',
        book: { id, ...updatedData },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /books/:bookId/
   * Deletes a book by ID.
   */
  static async deleteBook(req, res, next) {
    try {
      const { valid, id, error } = BookController.parseBookId(req.params.bookId);
      if (!valid) {
        return res.status(400).json({ error });
      }

      const existingBook = await BookModel.getById(id);
      if (!existingBook) {
        return res.status(404).json({ error: `Book with ID ${id} not found.` });
      }

      await BookModel.delete(id);

      return res.status(200).json({
        message: 'Book Deleted Successfully',
        deletedBook: existingBook,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BookController;

