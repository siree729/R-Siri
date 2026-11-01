const express = require('express');
const router = express.Router();
const BookController = require('../controllers/bookController');

// GET /books/ - Retrieve all books
router.get('/', BookController.getAllBooks);

// GET /books/:bookId/ - Retrieve a specific book by ID
router.get('/:bookId', BookController.getBookById);

// POST /books/ - Add a new book
router.post('/', BookController.createBook);

// PUT /books/:bookId/ - Update an existing book by ID
router.put('/:bookId', BookController.updateBook);

// DELETE /books/:bookId/ - Delete a book by ID
router.delete('/:bookId', BookController.deleteBook);

module.exports = router;

