const async = require('async');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

const Genre = require('../models/genre.model');
const Book = require('../models/book.model');

exports.genreList = function (req, res, next) {
   Genre.find()
      .exec((err, genres) => {
         if (err) return next(error);

         res.render('genre/genre_list', {
            title: 'Lista de Géneros', genres
         });
      });
}

exports.genreDetails = function (req, res, next) {

   var id = mongoose.Types.ObjectId(req.params.id);

   async.parallel({
      genre: function (callback) {
         Genre.findById(id).exec(callback);
      },
      genre_books: function (callback) {
         Book.find({ 'genre': id }).exec(callback);
      }
   }, function (err, results) {
      if (err) {
         //console.log(err);
         return next(err);
      }

      if (results.genre == null) {
         var err = new Error('Genre not found');
         err.status = 400;
         //console.log(err);
         return next(err);
      }

      res.render('genre/genre_details', { 
         title: 'Detalles del Género', genre: results.genre,
         genre_books: results.genre_books
      });
   });
}

exports.createGenreView = function (req, res) {
   res.render('genre/genre_form', { title: 'Crear Género' });
}

exports.createGenre = [
   // Valid the field name
   body('name').trim().isLength({ min: 3 }).escape().withMessage('El nombre es requerido.'),

   (req, res, next) => {

      // Extract the validation errors from a request
      const errors = validationResult(req);

      var genre = new Genre({
         name: req.body.name
      });

      if (!errors.isEmpty()) {
         res.render('genre/genre_form', {
            title: 'Crear Género',
            genre: genre,
            errors: errors.array()
         });
         return;
      } else {

         // Check if Genre with same name already exists
         Genre.findOne({ 'name': req.body.name })
            .exec((err, genreFound) => {
               if (err) return next(err);

               // If exists, redirect to detail genre
               if (genreFound) {
                  res.redirect(genreFound.url)
               } else {
                  //If not exists, save the genre and redirect to genre detail
                  genre.save((err) => {
                     if (err) return next(err);

                     res.redirect(genre.url);
                  });
               }
            });
      }
   }

];

exports.editGenreView = function (req, res, next) {

   const id = mongoose.Types.ObjectId(req.params.id);

   async.parallel({
      genre: function (callback) {
         Genre.findById(id).exec(callback);
      }
   }, (err, results) => {
      if (err) return next(err);

      //console.log(results);
      res.render('genre/genre_form', { title: 'Actualizar Género', genre: results.genre })
   });

}

exports.editGenre = [
   // Valid the field name
   body('name').trim().isLength({ min: 3 }).escape().withMessage('El nombre es obligatorio.'),

   (req, res, next) => {

      // Extract the validation errors from a request
      const errors = validationResult(req);

      const genre = new Genre({
         name: req.body.name
      });

      if (!errors.isEmpty()) {
         res.render('genre/genre_form', {
            title: 'Actualizar Género',
            genre: genre,
            errors: errors.array()
         });
         return;
      } else {

         Genre.findById(req.params.id, (err, genreFind) => {
            if (err) return next(err);
            //console.log("---------- Genre: ", genreFind);

            if (genreFind === null) {
               res.redirect(genre.url);
            } else {
               //If exists, update the genre and redirect to genre detail
               genreFind.updateOne({ name: genre.name }, (err) => {
                  if (err) return next(err);

                  res.redirect(genreFind.url);
               });
            }
         });
      }
   }
];

exports.deleteGenreView = function (req, res) {
   
   var id = mongoose.Types.ObjectId(req.params.id);

   async.parallel({
      genre: function (callback) {
         Genre.findById(id).exec(callback);
      },
      genre_books: function (callback) {
         Book.find({ 'genre': id }).exec(callback);
      }
   }, function (err, results) {
      if (err) {
         //console.log(err);
         return next(err);
      }

      if (results.genre == null) {
         var err = new Error('Genre not found');
         err.status = 400;
         //console.log(err);
         return next(err);
      }

      //console.log("RESULTS: ", results);

      res.render('genre/genre_delete', { title: 'Eliminar Género', 
            genre: results.genre, genre_books: results.genre_books });
   });

}

exports.deleteGenre = function (req, res, next) {
   async.parallel({
      genre: function (callback) {
         Genre.findById(req.body.genreid).exec(callback);
      },
      genre_books: function (callback) {
         Book.find({ 'genre': req.body.genreid }).exec(callback);
      }
   }, function (err, results) {
      if (err) return next(err);

      if (results.genre_books.length > 0) {
         res.render('genre/genre_delete', { 
            title: 'Eliminar Género',
            genre: results.genre, genre_books: results.genre_books
      });
      } else {
         Genre.findByIdAndDelete(req.body.genreid, (err) => {
            if (err) return next(err);

            res.redirect('/catalog/genres');
         })
      }
   });
}


