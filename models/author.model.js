const mongoose = require('mongoose');
const { DateTime } = require('luxon');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema({
   first_name: {
      type: String,
      required: true,
      maxlength: 100
   },
   family_name: {
      type: String,
      required: true,
      maxlength: 100
   },
   date_of_birth: {
      type: Date
   },
   date_of_death: {
      type: Date
   }
}, {
   versionKey: false
});

// Virtual for Author's Full Name
AuthorSchema.virtual('name').get(function () {
   return this.family_name + ', ' + this.first_name;
});

// Virtual for Author's Life
AuthorSchema.virtual('lifespan').get(function () {
   var lifespan_string = '';
   if (this.date_of_birth) {
      //lifespan_string = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_SHORT);
      lifespan_string = DateTime.fromJSDate(this.date_of_birth).toFormat('dd/MM/yyyy');
   }

   lifespan_string += ' - ';

   if (this.date_of_death) {
      //lifespan_string = DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_SHORT);
      lifespan_string += DateTime.fromJSDate(this.date_of_death).toFormat('dd/MM/yyyy');
   }
   return lifespan_string;
});

// Formatear fechas
//AuthorSchema.virtual('date_bird_formatted').get(function () {
   /*if (this.date_of_birth !== null) {
      let getDateOfBirth = this.date_of_birth.toISOString().slice(0, 10);
      return DateTime.fromISO(getDateOfBirth).toFormat('dd/MM/yyyy');
   }
   return '';*/
   //return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_SHORT) : '';
//});

/*AuthorSchema.virtual('date_death_formatted').get(function () {
   return this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_SHORT) : '';
});*/

AuthorSchema.virtual('date_birth_format').get(function(){
   return DateTime.fromJSDate(this.date_of_birth).toISODate(); // yyyy-MM-dd
});

AuthorSchema.virtual('date_death_format').get(function(){
   return DateTime.fromJSDate(this.date_of_death).toISODate(); // yyyy-MM-dd
})

// Virtual for Author's URL
AuthorSchema.virtual('url').get(function () {
   return '/catalog/author/' + this._id;
});

module.exports = mongoose.model('Author', AuthorSchema);
