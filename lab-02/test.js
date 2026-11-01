/**
 * Automated Test Suite for Lab 02 CRUD API
 * Tests all endpoints, status codes, validations, and database state changes.
 */

const { initializeDBAndServer, app } = require('./server');
const { closeDB, initializeDB } = require('./config/database');

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting Lab 02 API & SQLite Automated Tests');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Helper fetch function
  async function apiCall(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    const status = res.status;
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { status, data };
  }

  try {
    // 1. Test Root Home Endpoint
    console.log('[Test 1] GET /');
    const rootRes = await apiCall('/');
    assert(rootRes.status === 200, 'GET / returns 200 OK');
    assert(rootRes.data && rootRes.data.student && rootRes.data.student.name === 'Siri.R', 'Root response contains student details');

    // 2. Test GET /books/
    console.log('\n[Test 2] GET /books/');
    const allBooksRes = await apiCall('/books/');
    assert(allBooksRes.status === 200, 'GET /books/ returns 200 OK');
    assert(Array.isArray(allBooksRes.data), 'GET /books/ returns an array of books');
    assert(allBooksRes.data.length >= 8, `Initial books count is at least 8 (found ${allBooksRes.data.length})`);
    console.log(`     Retrieved ${allBooksRes.data.length} books.`);

    // 3. Test GET /books/:bookId/ (Valid ID)
    console.log('\n[Test 3] GET /books/1/');
    const book1Res = await apiCall('/books/1/');
    assert(book1Res.status === 200, 'GET /books/1/ returns 200 OK');
    assert(book1Res.data && book1Res.data.id === 1, 'Book ID is 1');
    assert(book1Res.data && book1Res.data.title === 'To Kill a Mockingbird', 'Book title matches expected record');

    // 4. Test GET /books/:bookId/ (Non-existent ID)
    console.log('\n[Test 4] GET /books/9999/ (Not Found)');
    const notFoundRes = await apiCall('/books/9999/');
    assert(notFoundRes.status === 404, 'GET /books/9999/ returns 404 Not Found');

    // 5. Test GET /books/:bookId/ (Invalid ID Format)
    console.log('\n[Test 5] GET /books/invalid-id/ (Bad Request)');
    const invalidIdRes = await apiCall('/books/abc/');
    assert(invalidIdRes.status === 400, 'GET /books/abc/ returns 400 Bad Request');

    // 6. Test POST /books/ (Validation Failure)
    console.log('\n[Test 6] POST /books/ with missing fields');
    const badPostRes = await apiCall('/books/', {
      method: 'POST',
      body: JSON.stringify({ title: 'Incomplete Book' }),
    });
    assert(badPostRes.status === 400, 'POST /books/ with missing author returns 400 Bad Request');

    // 7. Test POST /books/ (Successful Creation)
    console.log('\n[Test 7] POST /books/ (Add new book)');
    const newBookPayload = {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      price: 650,
      pages: 464,
    };
    const createRes = await apiCall('/books/', {
      method: 'POST',
      body: JSON.stringify(newBookPayload),
    });
    assert(createRes.status === 201, 'POST /books/ returns 201 Created');
    assert(createRes.data && createRes.data.message === 'Book Added Successfully', 'Success message matches');
    assert(createRes.data && createRes.data.book && createRes.data.book.id > 0, 'New book has auto-incremented ID');
    const createdId = createRes.data?.book?.id;
    console.log(`     Created book ID: ${createdId}`);

    // 8. Test GET /books/:bookId/ for newly created book (Persistence)
    console.log(`\n[Test 8] GET /books/${createdId}/ (Verify Persistence)`);
    const verifyNewBook = await apiCall(`/books/${createdId}/`);
    assert(verifyNewBook.status === 200, `GET /books/${createdId}/ returns 200 OK`);
    assert(verifyNewBook.data && verifyNewBook.data.title === 'Clean Code', 'New book data matches submitted payload');

    // 9. Test PUT /books/:bookId/ (Update existing book)
    console.log(`\n[Test 9] PUT /books/${createdId}/ (Update book)`);
    const updatePayload = {
      title: 'Clean Code: Revised Edition',
      author: 'Robert C. Martin',
      price: 700,
      pages: 480,
    };
    const updateRes = await apiCall(`/books/${createdId}/`, {
      method: 'PUT',
      body: JSON.stringify(updatePayload),
    });
    assert(updateRes.status === 200, `PUT /books/${createdId}/ returns 200 OK`);
    assert(updateRes.data && updateRes.data.message === 'Book Updated Successfully', 'Update success message returned');
    assert(updateRes.data && updateRes.data.book && updateRes.data.book.price === 700, 'Book price updated to 700');

    // 10. Test PUT /books/9999/ (Non-existent ID)
    console.log('\n[Test 10] PUT /books/9999/ (Non-existent ID)');
    const putNotFoundRes = await apiCall('/books/9999/', {
      method: 'PUT',
      body: JSON.stringify(updatePayload),
    });
    assert(putNotFoundRes.status === 404, 'PUT /books/9999/ returns 404 Not Found');

    // 11. Test DELETE /books/:bookId/ (Delete newly created book)
    console.log(`\n[Test 11] DELETE /books/${createdId}/`);
    const deleteRes = await apiCall(`/books/${createdId}/`, {
      method: 'DELETE',
    });
    assert(deleteRes.status === 200, `DELETE /books/${createdId}/ returns 200 OK`);
    assert(deleteRes.data && deleteRes.data.message === 'Book Deleted Successfully', 'Delete success message returned');

    // 12. Test GET /books/:bookId/ after DELETE (Verify Deletion)
    console.log(`\n[Test 12] GET /books/${createdId}/ after DELETE (Confirm Removed)`);
    const verifyDeleted = await apiCall(`/books/${createdId}/`);
    assert(verifyDeleted.status === 404, `GET /books/${createdId}/ now returns 404 Not Found`);

    // 13. Test DELETE /books/9999/ (Non-existent ID)
    console.log('\n[Test 13] DELETE /books/9999/ (Non-existent ID)');
    const delNotFoundRes = await apiCall('/books/9999/', {
      method: 'DELETE',
    });
    assert(delNotFoundRes.status === 404, 'DELETE /books/9999/ returns 404 Not Found');

    // 14. Test 404 Invalid Route
    console.log('\n[Test 14] GET /non-existent-route');
    const invalidRouteRes = await apiCall('/non-existent-route');
    assert(invalidRouteRes.status === 404, 'Invalid route returns 404 Not Found');

    console.log('\n====================================================');
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

// Check if server is already running, or start it
(async () => {
  try {
    const probe = await fetch('http://localhost:3000/').catch(() => null);
    if (!probe) {
      console.log('Starting server for tests...');
      await initializeDBAndServer();
      // Give server a moment to bind
      await new Promise((r) => setTimeout(r, 800));
    } else {
      console.log('Server already running on port 3000. Running tests against it.');
    }
    await runTests();
    process.exit(0);
  } catch (err) {
    console.error('Failed to run test harness:', err);
    process.exit(1);
  }
})();

