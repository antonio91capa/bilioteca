const async = require('async');
const { body, validationResult } = require('express-validator');

const BookInstance = require('../models/bookinstance.model');
const Book = require('../models/book.model');

exports.booinstanceList = function (req, res, next) {
   BookInstance.find()
      .populate('book')
      .exec((err, booksinstances) => {
         if (err) {
            return next(err);
         }

         //console.log("Result: ", booksinstances)
         res.render('bookinstance/bookinstance_list', {
            title: 'Copia del Libro', booksinstance: booksinstances
         });
      })
}

exports.bookinstance_detail = function (req, res, next) {
   BookInstance.findById(req.params.id)
      .populate('book')
      .exec(function (err, bookInstances) {
         if (err) return next(err);

         if (bookInstances == null) {
            var err = new Error('Book copy not found');
            err.status = 404;
            return next(err);
         }

         //console.log('Book instances: ', bookInstances);
         res.render('bookinstance/bookinstance_detail', {
            title: 'Copia ' + bookInstances.book.title,
            bookinstance: bookInstances
         });
      });
}

exports.createBookInstanceView = function (req, res) {
   Book.find({}, 'title')
      .exec(function (err, books) {
         if (err) return next(err);

         //console.log("Books: ", books);
         res.render('bookinstance/bookinstance_form', {
            title: 'Crear Copia del Libro', book_list: books
         });
      });
}

exports.createBookInstance = [
   body('book', 'El libro es requerido').trim().isLength({ min: 1 }).escape(),
   body('imprint', 'Imprenta es requerida').trim().isLength({ min: 1 }).escape(),
   body('status').escape(),
   body('due_back', 'Fecha invalida').optional({ checkFalsy: true }).isISO8601().toDate(),
   //body('due_back', 'fecha invalida').optional({ checkFalsy: true }).toDate(),

   (req, res, next) => {
      const errors = validationResult(req);

      var bookinstance = new BookInstance({
         book: req.body.book,
         imprint: req.body.imprint,
         status: req.body.status,
         due_back: req.body.due_back
      });

      if (!errors.isEmpty()) {
         Book.find({}, 'title')
            .exec(function (err, books) {
               if (err) return next(err);

               res.render('bookinstance/bookinstance_form', {
                  title: 'Crear Copia del Libro', book_list: books,
                  selected_book: bookinstance.book._id,
                  errors: errors.array(), bookinstance: req.body
               });
            });

         return;
      } else {
         bookinstance.save(function (err) {
            if (err) return next(err);

            res.redirect(bookinstance.url);
         });
      }
   }
]

/************************* Muestra el formulario de Actualizar Book Instance */
exports.editBookInstanceView = function (req, res, next) {

   // Get book, authors and genres for form.
   async.parallel({
      bookinstance: function (callback) {
         BookInstance.findById(req.params.id)
            .populate('book')
            .exec(callback)
      },
      books: function (callback) {
         Book.find(callback)
      },
   }, function (err, results) {
      if (err) { 
         return next(err);
      }

      if (results.bookinstance == null) { // No results.
         var err = new Error('Book copy not found');
         err.status = 404;
         return next(err);
      }

      // Success.
      res.render('bookinstance/bookinstance_form', {
         title: 'Actualizar Estancia del Libro', book_list: results.books,
         selected_book: results.bookinstance.book._id, 
         bookinstance: results.bookinstance
      });
   });
}

exports.editBookInstance = [

   // Validacion del req.body
   body('book', 'El libro es requrido').trim().isLength({ min: 3 }).escape(),
   body('imprint', 'La Imprenta es requerida').trim().isLength({ min: 3 }).escape(),
   body('status').escape(),
   body('due_back', 'Fecha inválida').optional({ checkFalsy: true }).isISO8601().toDate(),

   (req, res, next) => {
      // obtiene las validaciones y se los asigna a una constante
      const errors = validationResult(req);

      var bookinstance = new BookInstance({
         book: req.body.book,
         imprint: req.body.imprint,
         status: req.body.status,
         due_back: req.body.due_back,
         _id: req.params.id
      });

      // Si los errores no estan vacios, entonces lo manda al formulario
      if (!errors.isEmpty()) {

         Book.find({}, 'title')
            .exec((err, books) => {
               if (err) return next(err);

               //console.log("Results update: ", results);
               res.render('bookinstance/bookinstance_form', {
                  title: 'Actualizar copia del libro', selected_book: bookinstance.book._id,
                  book_list: books, bookinstance: bookinstance, errors: errors.array()
               });
            });
         return;
      } else {

         //Si no existen errores, entonces lo actualiza
         BookInstance.findByIdAndUpdate(req.params.id, bookinstance, (err, bookUpdated) => {
            if (err) return next(err);

            //console.log('Book Instance updated successfully');
            //console.log('Book instance: ', bookUpdated);
            res.redirect(bookUpdated.url);
         });
      }
   }
];

exports.deleteBookInstanceView = function (req, res) {

}

exports.deleteBookInstance = function (req, res) {

}