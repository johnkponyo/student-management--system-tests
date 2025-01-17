const mongoose = require('mongoose');
const Schema = mongoose.Schema;



//Instructor schema
const instructorSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    department: { type: String, required: true },
    officeLocation: { type: String, required: false },
    password: {type: String, required: true}
  },

  {
    timestamps: true
  }

);


module.exports = mongoose.model('Instructor', instructorSchema);
