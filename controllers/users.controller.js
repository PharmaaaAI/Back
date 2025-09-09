import User from '../models/users.model.js';
import Product from '../models/product.model.js';
import generateJWT from '../utils/generateJWT.js';
import httpStatusText from '../utils/httpStatusText.js';
import bcrypt from 'bcrypt';
import appError from '../utils/appError.js';
import userRoles from '../utils/userRoles.js';

export const signup = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phoneNumber,
      customerProfile,
      addresses,
      dateOfBirth,
      gender,
      allergies,
      chronicConditions,
      currentMedications,
      skinType,
      skinConcerns,
      skinGoals,
      budgetRange
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const userData = { 
      email, 
      password, 
      firstName, 
      lastName, 
      phoneNumber, 
      cart: []
    };

    // add customer profile if provided 
    if (customerProfile) {
      userData.customerProfile = customerProfile;
    } else if (dateOfBirth || gender || allergies || chronicConditions || currentMedications || skinType || skinConcerns || skinGoals || budgetRange) {
      userData.customerProfile = {};
      
      if (dateOfBirth) userData.customerProfile.dateOfBirth = dateOfBirth;
      if (gender) userData.customerProfile.gender = gender;
      if (allergies) userData.customerProfile.allergies = allergies;
      if (chronicConditions) userData.customerProfile.chronicConditions = chronicConditions;
      if (currentMedications) userData.customerProfile.currentMedications = currentMedications;
      if (skinType) userData.customerProfile.skinType = skinType;
      if (skinConcerns) userData.customerProfile.skinConcerns = skinConcerns;
      if (skinGoals) userData.customerProfile.skinGoals = skinGoals;
      if (budgetRange) userData.customerProfile.budgetRange = budgetRange;
    }

    // Add addresses if provided
    if (addresses && Array.isArray(addresses)) {
      userData.addresses = addresses;
    }

    const user = new User(userData);

    await user.save();
    const token = await generateJWT({email: user.email, userId: user._id, role: user.role}); //check
    
    res.status(201).json({
      status: httpStatusText.SUCCESS, 
      data: {
        newUser: user, 
        token
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}


export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    // tokenn
    const token = await generateJWT({ email: user.email, userId: user._id, role: user.role} );
    res.status(200).json({ message: 'login successful',token: token, userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export const getAllUsers = async (req, res) => {
  const users = await User.find({}, {'__v': false});
  res.status(200).json({status: httpStatusText.SUCCESS, data: users})
}

export const getUserInfo = async (req, res, next) => {
  const user = await User.findById(req.params.userID);

  if(!user)
    return next(appError.create("User not found", 404, httpStatusText.FAIL))
  if(user._id.toString() !== req.currentUser.userId && req.currentUser.role !== userRoles.ADMIN)
    return next(appError.create("This user not authorized", 404, httpStatusText.FAIL))

  res.status(200).json({status: httpStatusText.SUCCESS, data: user})
}

export const updateInfo = async (req, res, next) => {
  const user = await User.findById(req.params.userID);
  if(user._id.toString() !== req.currentUser.userId && req.currentUser.role !== userRoles.ADMIN)
    return next(appError.create("This user not authorized", 401, httpStatusText.FAIL))

  if(req.body.cart)
  {
    for (const product of req.body.cart) {
      try {
        const prod = await Product.findById(product.productID);
        if (!prod) {
          return next(appError.create(`Product with ID: ${product.productID} not found`, 404, httpStatusText.FAIL));
        }
      }catch{
        const error = appError.create(`Product with ID: ${product.productID} is not valid`, 404, httpStatusText.FAIL);
        return next(error);
      }
    }
  }
  const apdatedUser = await User.updateOne({_id: req.params.userID}, {$set: {...req.body}}, { runValidators: true });
  res.json({status: httpStatusText.SUCCESS,data: apdatedUser});
}


export default {
  signup,
  signin,
  getAllUsers,
  getUserInfo,
  updateInfo
};
