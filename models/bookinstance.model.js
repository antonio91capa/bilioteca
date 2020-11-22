const mongoose = require('mongoose');
const { DateTime } = require('luxon');

var Schema = mongoose.Schema;

var BookInstanceSchema = new Schema({
   book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: true
   },
   imprint: {
      type: String,
      required: true
   },
   status: {
      type: String,
      required: true,
      enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
      default: 'Maintenance'
   },
   due_back: {
      type: Date,
      default: Date.now
   }
}, {
   versionKey: false
});

BookInstanceSchema.virtual('url').get(function () {
   return '/catalog/bookinstance/' + this._id;
});

BookInstanceSchema.virtual('date_formatted').get(function () {
   return DateTime.fromJSDate(this.due_back).toFormat('dd/MM/yyyy');

   /*if(this.due_back !== null){
      let date_due_back = this.due_back.toISOString().slice(0,10);
      return DateTime.fromISO(date_due_back).toFormat('dd/MM/yyyy');
   }
   return '';*/

});

BookInstanceSchema.virtual('date_due_back').get(function () {
   return DateTime.fromJSDate(this.due_back).toISODate();  //format 'YYYY-MM-DD'
});

module.exports = mongoose.model('BookInstance', BookInstanceSchema);