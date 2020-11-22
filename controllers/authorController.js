const async = require('async');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const debug =require('debug')('author');

const Author = require('../models/author.model');
const Book = require('../models/book.model');

exports.authorList = function (req, res, next) {
   Author.find()
      .sort([['family_name', 'ascending']])
      .exec((error, authors) => {
         if (error){
            debug('Error al obtener los autores: '+error);
            return next(error);
         }

         if(authors === null){
            debug('No hay autores');
         }

         res.render('authors/author_list', {
            title: 'Lista de Autores', authors: authors
         });
      });
}

exports.author_details = function (req, res, next) {

   var id = mongoose.Types.ObjectId(req.params.id);

   async.parallel({
      author: function (callback) {
         Author.findById(id)
            .exec(callback);
      },
      author_books: function (callback) {
         Book.find({ 'author': id }, 'title summary')
            .exec(callback);
      }
   }, function (err, results) {
      if (err){
         debug('Error al obtener el autor: '+err);
         return next(err);
      } 

      if (results.author == null) {
         var err = new Error('Authors not found');
         err.status = 404;
         debug('Autor no encontrado')
         return next(err);
      }

      res.render('authors/author_detail', {
         title: 'Detalles del Autor',
         author: results.author, author_books: results.author_books
      });
   });
}

exports.createAuthorView = function (req, res) {
   res.render('authors/author_form', { title: 'Crear Autor' });
}

exports.createAuthor = [
   body('first_name').trim().isLength({ min: 3 }).escape().withMessage('El nombre es obligatorio')
      .isAlpha().withMessage('El nombre no debe tener caracteres especiales ni espacios en blanco.'),
   body('family_name').trim().isLength({ min: 3 }).escape().withMessage('El apellido es obligatorio')
      .isAlpha().withMessage('El apellido no debe tener caracteres especiales ni espacios en blanco.'),
   body('date_of_birth', 'Fecha de nacimiento inválido').optional({ checkFalsy: true }).isISO8601().toDate(),
   body('date_of_death', 'Fecha de fallecimiento inválido').optional({ checkFalsy: true }).isISO8601().toDate(),

   (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
         res.render('authors/author_form', {
            title: 'Crear autor',
            author: req.body,
            errors: errors.array()
         });
         return;
      } else {

         const author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death
         });

         author.save((err) => {
            if (err){
               debug('Error al guardar el autor: '+err);
               return next(err);
            } 

            debug('Autor creado correctamente');
            res.redirect(author.url);
         })
      }
   }

];

exports.editAuthorView = function (req, res, next) {
   const id = mongoose.Types.ObjectId(req.params.id);

   Author.findById(id).exec((err, author) => {
      if (err){
         debug('Error al buscar el autor: '+err);
         return next(err);
      } 

      res.render('authors/author_form', {
         title: 'Actualizar Autor', author: author 
      });
   });
}

exports.editAuthor = [

   // Validate and sanitise fields.
   body('first_name').trim().isLength({ min: 3 }).escape().withMessage('El nombre es obligatorio')
      .isAlphanumeric().withMessage('El nombre no debe tener caracteres especiales ni espacios en blanco.'),
   body('family_name').trim().isLength({ min: 3 }).escape().withMessage('El apellido es obligatorio')
      .isAlphanumeric().withMessage('El apellido no debe tener caracteres especiales ni espacios en blanco.'),
   body('date_of_birth', 'Fecha de nacimineto inválido').optional({ checkFalsy: true }).isISO8601().toDate(),
   body('date_of_death', 'Fecha de fallecimiento inválido').optional({ checkFalsy: true }).isISO8601().toDate(),

   (req, res, next) => {
      const errors = validationResult(req);

      // Create Author object with escaped and trimmed data (and the old id!)
      var author = new Author({
         first_name: req.body.first_name,
         family_name: req.body.family_name,
         date_of_birth: req.body.date_of_birth,
         date_of_death: req.body.date_of_death,
         _id: req.params.id
      });

      if (!errors.isEmpty()) {
         res.render('authors/author_form', {
            title: 'Actualizar Autor',
            author: author,
            errors: errors.array()
         });
         return;
      } else {

         Author.findByIdAndUpdate(req.params.id, author, (err, authorUpdated) => {
            if (err) {
               debug('Error al actualizar el autor: '+err);
               return next(err);
            }

            debug('Autor actualizado correctamente');
            res.redirect(authorUpdated.url);
         });
      }
   }
];

exports.deleteAuthorView = function (req, res) {

   var id = mongoose.Types.ObjectId(req.params.id);

   async.parallel({
      author: function (callback) {
         Author.findById(id).exec(callback);
      },
      authors_books: function (callback) {
         Book.find({ 'author': id }).exec(callback);
      },
   }, (err, results) => {
      if (err){
         debug('Error al buscar el autor para eliminarlo: '+err);
         return next(err);
      } 

      if (results.author == null) {
         debug('Autor no encontrado');
         res.redirect('/catalog/authors');
      }

      res.render('authors/author_delete', {
         title: 'Eliminar Autor', author: results.author,
         author_books: results.authors_books
      });
   });
}

exports.deleteAuthor = function (req, res) {
   async.parallel({
      author: function (callback) {
         Author.findById(req.body.authorid).exec(callback);
      },
      authors_books: function (callback) {
         Book.find({ 'author': req.body.authorid }).exec(callback);
      },
   }, (err, results) => {
      if (err){
         debug('Error al obtener el autor para eliminarlo: '+err);
         return next(err);
      } 

      if (results.authors_books.length > 0) {
         debug('El autor tiene libros, no se puede eliminar');
         // Author has books. Render in same way as for GET route.
         res.render('authors/author_delete', {
            title: 'Eliminar Autor',
            author: results.author, author_books: results.authors_books
         });
         return;
      }

      Author.findByIdAndRemove(req.body.authorid, err => {
         if (err){
            debug('Error al eliminar el autor: '+err);
            return next(err);
         }

         debug('Autor eliminado corretamente');
         res.redirect('/catalog/authors');
      });
   });
}
