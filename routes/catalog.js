const express = require('express');
const router = express.Router();

// Controllers
var book_controller = require('../controllers/bookController');
var author_controller = require('../controllers/authorController');
var genre_controller = require('../controllers/genreController');
var bookinstance_controller = require('../controllers/bookinstanceController');

// Book Routes
router.get('/book/create', book_controller.createBookView);
router.post('/book/create', book_controller.createBook);
router.get('/book/:id/update', book_controller.editBookView);
router.post('/book/:id/update', book_controller.editBook);
router.get('/book/:id/delete', book_controller.deleteBookView);
router.post('/book/:id/delete', book_controller.deleteBook);
router.get('/books', book_controller.bookList);
router.get('/book/:id', book_controller.book_details);

// Author Routes
router.get('/author/create', author_controller.createAuthorView);
router.post('/author/create', author_controller.createAuthor);
router.get('/author/:id/update', author_controller.editAuthorView);
router.post('/author/:id/update', author_controller.editAuthor);
router.get('/author/:id/delete', author_controller.deleteAuthorView);
router.post('/author/:id/delete', author_controller.deleteAuthor);
router.get('/authors', author_controller.authorList);
router.get('/author/:id', author_controller.author_details);

// Genre Routes
router.get('/genre/create', genre_controller.createGenreView);
router.post('/genre/create', genre_controller.createGenre);
router.get('/genre/:id/update', genre_controller.editGenreView);
router.post('/genre/:id/update', genre_controller.editGenre);
router.get('/genre/:id/delete', genre_controller.deleteGenreView);
router.post('/genre/:id/delete', genre_controller.deleteGenre);
router.get('/genre/:id', genre_controller.genreDetails);
router.get('/genres', genre_controller.genreList);

// Book Instance Routes
router.get('/bookinstance/create', bookinstance_controller.createBookInstanceView);
router.post('/bookinstance/create', bookinstance_controller.createBookInstance);
router.get('/bookinstance/:id/update', bookinstance_controller.editBookInstanceView);
router.post('/bookinstance/:id/update', bookinstance_controller.editBookInstance);
router.get('/bookinstance/:id/delete', bookinstance_controller.deleteBookInstanceView);
router.post('/bookinstance/:id/delete', bookinstance_controller.deleteBookInstance);
router.get('/bookinstances', bookinstance_controller.booinstanceList);
router.get('/bookinstance/:id', bookinstance_controller.bookinstance_detail);

module.exports = router;
