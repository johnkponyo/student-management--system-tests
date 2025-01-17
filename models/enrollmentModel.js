const mongoose = require('mongoose');
const Schema = mongoose.Schema;



//Enrollment schema
const enrollmentSchema = new Schema({
  student: { 
    type: Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  course: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  instructor: { 
    type: Schema.Types.ObjectId, 
    ref: 'Instructor', 
    required: true 
  },
  enrollmentDate: { type: Date, default: Date.now },
  grade: { type: String, enum: ['A', 'B', 'C', 'D', 'F', 'Incomplete'], default: 'Incomplete' },
  status: { type: String, enum: ['Active', 'Completed', 'Withdrawn'], default: 'Active' }
});



module.exports = mongoose.model('Enrollment', enrollmentSchema);
