var express = require('express');
var async = require('async');
const router = express.Router();

var Book = require('../models/book.model');
var Author = require('../models/author.model');
var Genre = require('../models/genre.model');
var BookInstance = require('../models/bookinstance.model');

/* GET home page. */
router.get('/', function (req, res, next) {

   async.parallel({
      book_count: function (callback) {
         Book.countDocuments({}, callback);
      },
      book_intance_count: function (callback) {
         BookInstance.countDocuments({}, callback);
      },
      book_instance_available: function (callback) {
         BookInstance.countDocuments({ status: 'Available' }, callback);
      },
      author_count: function (callback) {
         Author.countDocuments({}, callback);
      },
      genre_count: function (callback) {
         Genre.countDocuments({}, callback);
      }
   }, function (err, results) {
      //console.log(results);
      res.render('index', { title: 'Local Library Home', error: err, data: results });
   });
});

module.exports = router;