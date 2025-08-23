const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // basics
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: { 
    type: String, 
    required: true,
    trim: true 
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true 
  },
  phoneNumber: {
    type: String,
    trim: true
  },

  // when signing in (admin email and pass will be auto created in the database)
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },

  //(only for customers)
  customerProfile: {
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'prefer_not_to_say']
    },
    profileImage: String,
    
    // health Info to be entered after sign up (i need the ai model to know his user even before talking)
    allergies: [String],
    chronicConditions: [String],
    currentMedications: [String],
    
    skinType: {
      type: String,
      enum: ['oily', 'dry', 'combination', 'sensitive', 'normal']
    },
    skinConcerns: [String],
    skinGoals: [String],
    budgetRange: {
      type: String,
      enum: ['under_25', '25_50', '50_100', '100_200', 'over_200']
    }
  },

  // (for both customers and admins)
  addresses: [{
    type: {
      type: String,
      enum: ['shipping', 'billing', 'work'],
      default: 'shipping'
    },
    firstName: String,
    lastName: String,
    addressLine1: { type: String},
    addressLine2: String,
    city: { type: String, default: 'Abassyaa' },
    state: { type: String },
    postalCode: { type: String},
    country: { type: String, default: 'Egypt' },
    phoneNumber: String,
  }],

  lastActivity: Date,
  loginHistory: [{
    timestamp: Date,
    ip: String,
    userAgent: String,
    success: Boolean
  }],

});

//save the pass hashed
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);
