const mongoose = require('mongoose');
const Schema = mongoose.Schema;



//Course schema
const courseSchema = new Schema(
  {
    courseCode: { type: String, required: true, unique: true },
    courseName: { type: String, required: true },
    courseDescription: { type: String, required: true },
    credits: { type: Number, required: true },
    semester: { type: String, enum: ['Fall', 'Spring'], required: true },
    department: { type: String, required: true }
  },
  
  {
    timestamps: true
  }
  
);



module.exports = mongoose.model('Course', courseSchema);
