const async = require('async');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

const Book = require('../models/book.model');
const BookInstance = require('../models/bookinstance.model');
const Author = require('../models/author.model');
const Genre = require('../models/genre.model');

exports.bookList = function (req, res, next) {
   Book.find({}, 'title author',)
      .populate('author')
      .exec((err, books) => {
         if (err) return next(err);

         res.render('books/book_list', { 
            title: 'Lista de Libros', books: books
         });
      });
}

exports.book_details = function (req, res, next) {

   var id = mongoose.Types.ObjectId(req.params.id);

   async.parallel({
      book: function (callback) {
         Book.findById(id)
            .populate('author')
            .populate('genre')
            .exec(callback);
      },
      book_instance: function (callback) {
         BookInstance.find({ 'book': id })
            .exec(callback);
      }
   }, function (err, results) {
      if (err) return next(err);

      if (results.book == null) {
         var err = new Error('Books not found');
         err.status = 404;
         return next(err);
      }

      //console.log('Results: ', results);
      res.render('books/book_detail', {
         book: results.book,
         book_instances: results.book_instance
      });
   });
}

exports.createBookView = function (req, res, next) {

   async.parallel({
      authors: function (callback) {
         Author.find(callback);
      },
      genres: function (callback) {
         Genre.find(callback);
      }
   }, function (err, results) {
      if (err) return next(err);

      res.render('books/book_form', {
         title: 'Crear Libro', authors: results.authors,
         genres: results.genres
      });
   });

}

exports.createBook = [
   // Convert the genre to an array.
   (req, res, next) => {
      if (!(req.body.genre instanceof Array)) {
         if (typeof req.body.genre === 'undefined')
            req.body.genre = [];
         else
            req.body.genre = new Array(req.body.genre);
      }
      next();
   },

   // Validate Fields
   body('title').trim().isLength({ min: 3 }).withMessage('Titulo es requerido.').escape(),
   body('author', 'Autor es requerido').trim().isLength({ min: 3 }).escape(),
   body('summary', 'Descripcion es requerido').trim().isLength({ min: 3 }).escape(),
   body('isbn', 'ISBN es obligatorio').trim().isLength({ min: 3 }).escape(),
   body('genre.*').escape(),

   (req, res, next) => {
      const errors = validationResult(req);

      var book = new Book({
         title: req.body.title,
         author: req.body.author,
         summary: req.body.summary,
         isbn: req.body.isbn,
         genre: req.body.genre
      });

      if (!errors.isEmpty()) {
         async.parallel({
            authors: function (callback) {
               Author.find(callback);
            },
            genres: function (callback) {
               Genre.find(callback);
            }
         }, function (err, results) {
            if (err) return next(err);

            for (let i = 0; i < results.genres.length; i++) {
               if (book.genre.indexOf(results.genres[i]._id) > -1) {
                  results.genres[i].checked = 'true';
               }
            }

            res.render('books/book_form', {
               title: 'Crear Libro', authors: results.authors,
               genres: results.genres, book: book, errors: errors.array()
            });
         });
         return;
      } else {
         book.save((err) => {
            if (err) return next(err);

            res.redirect(book.url);
         });
      }
   }
];

exports.editBookView = function (req, res, next) {
   async.parallel({
      book: function (callback) {
         Book.findById(req.params.id)
            .populate('author')
            .populate('genre')
            .exec(callback);
      },
      authors: function (callback) {
         Author.find(callback);
      },
      genres: function (callback) {
         Genre.find(callback);
      }
   }, function (err, results) {
      if (err) return next(err);

      if (results.book == null) {
         var err = new Error('There are no books');
         err.status = 404;
         return next(err);
      }

      // Success.
      // Mark our selected genres as checked.
      for (var all_genre_items = 0; all_genre_items < results.genres.length; all_genre_items++) {
         for (var book_genre_item = 0; book_genre_item < results.book.genre.length; book_genre_item++) {
            //console.log
            if (results.genres[all_genre_items]._id.toString() === results.book.genre[book_genre_item]._id.toString()) {
               //console.log("--- genre: ", results.genres[all_genre_items]);
               results.genres[all_genre_items].checked = 'true';
            }
         }
      }

      //console.log(results);
      res.render('books/book_form', {
         title: 'Actualizar libro', authors: results.authors,
         genres: results.genres, book: results.book
      });

   });
}

/******************************************* Edit Book *********************** */
exports.editBook = [
   (req, res, next) => {
      if (!(req.body.genre instanceof Array)) {
         if (typeof req.body.genre === 'undefined') {
            req.body.genre = [];
         } else {
            req.body.genre = new Array(req.body.genre);
         }
      }
      next();
   },

   // Validate Fields
   body('title').trim().isLength({ min: 3 }).withMessage('Titulo es requerido.').escape(),
   body('author', 'Autor es requerido').trim().isLength({ min: 3 }).escape(),
   body('summary', 'Descripcion es requerido').trim().isLength({ min: 3 }).escape(),
   body('isbn', 'ISBN es obligatorio').trim().isLength({ min: 3 }).escape(),
   body('genre.*').escape(),

   (req, res, next) => {
      const errors = validationResult(req);
      //console.log("------ BODY: ", req.body);

      const book = new Book({
         title: req.body.title,
         author: req.body.author,
         summary: req.body.summary,
         isbn: req.body.isbn,
         genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre,
         _id: req.params.id
      });

      if (!errors.isEmpty()) {
         async.parallel({
            authors: function (callback) {
               Author.find(callback);
            },
            genres: function (callback) {
               Genre.find(callback);
            }
         }, function (err, results) {
            if (err) return next(err);

            for (let i = 0; i < results.genres.length; i++) {
               if (book.genre.indexOf(results.genres[i]._id) > -1) {
                  results.genres[i].checked = 'true';
               }
            }

            res.render('books/book_form', {
               title: 'Actualizar Libro', authors: results.authors,
               genres: results.genres, book: book, errors: errors.array()
            });
         });
         return;
      } else {

         Book.findByIdAndUpdate(req.params.id, book, (err, bookUpdate) => {
            if (err) return next(err);

            res.redirect(bookUpdate.url);
         });

      }
   }
];

/******************************************* Delete Book View *********************** */
exports.deleteBookView = function (req, res, next) {

   var id = mongoose.Types.ObjectId(req.params.id);
   //console.log("id: ",id);

   async.parallel({
      book: function (callback) {
         Book.findById(req.params.id, '_id, title')
            .exec(callback);
      },
      book_instance: function (callback) {
         BookInstance.find({ 'book': id }, 'status imprint due_back')
            .exec(callback);
      }
   }, function (err, results) {
      if (err) return next(err);

      //console.log('---- Results: ', results);
      res.render('books/book_delete', { 
         title: 'Eliminar Libro', book: results.book,
         bookinstance: results.book_instance
      });
   });

}

/******************************************* Delete Book *********************** */
exports.deleteBook = function (req, res) {
   Book.findByIdAndDelete(req.body.bookid, (err)=>{
      if(err) return next(err);

      //console.log('Eliminado correctamente');
      res.redirect('/catalog/books')
   })
}
