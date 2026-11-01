const express = require('express');
const { initializeDB, closeDB } = require('./config/database');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON request bodies
app.use(express.json());

// Mount the books CRUD router
app.use('/books', bookRoutes);

// Root route providing API documentation & lab details
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to BDF Lab 02: SQLite Database and CRUD Routes API',
    student: {
      name: 'Siri.R',
      registrationNumber: '252U2R8081',
      section: 'S-13,204,2B',
      course: 'B.Tech CSE (Quantum Engineering)',
    },
    faculty: 'Joel Prashanth D',
    availableEndpoints: [
      { method: 'GET', path: '/books/', description: 'Retrieve all books from SQLite database' },
      { method: 'GET', path: '/books/:bookId/', description: 'Retrieve a specific book by its ID' },
      { method: 'POST', path: '/books/', description: 'Add a new book (JSON body: title, author, price, pages)' },
      { method: 'PUT', path: '/books/:bookId/', description: 'Update an existing book (JSON body: title, author, price, pages)' },
      { method: 'DELETE', path: '/books/:bookId/', description: 'Delete a book by its ID' },
    ],
  });
});

// 404 Not Found handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: '404 - Endpoint Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.',
  });
});

let serverInstance = null;

/**
 * Initializes the SQLite database and starts the Express server.
 * Ensures the database connection succeeds before listening to incoming HTTP requests.
 */
async function initializeDBAndServer() {
  try {
    await initializeDB();
    serverInstance = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running at http://localhost:${PORT}/`);
      console.log(`Books endpoint available at http://localhost:${PORT}/books/`);
    });
    return serverInstance;
  } catch (error) {
    console.error(`DB Error during initialization: ${error.message}`);
    process.exit(1);
  }
}

// Start the server if this file is executed directly
if (require.main === module) {
  initializeDBAndServer();
}

module.exports = {
  app,
  initializeDBAndServer,
};

