const mongoose = require('mongoose');
const Schema = mongoose.Schema;



//Student schema
const studentSchema = new Schema({
  studentId: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  enrollmentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  password: {type: String, required: true, default: 'xxxxxxxxxx'}
});



module.exports = mongoose.model('Student', studentSchema);
