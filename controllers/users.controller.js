// Example signup controller
const User = require('../models/users.model');
const Product = require('../models/product.model')
const generateJWT = require('../utils/generateJWT')
const httpStatusText = require('../utils/httpStatusText')
const bcrypt = require('bcrypt')
const appError = require('../utils/appError');
const userRoles = require('../utils/userRoles');
const asyncWrapper = require('../middleware/asyncWrapper');

const signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    
    const user = new User({ email, password, firstName, lastName, phoneNumber, cart: [] });

    const token = await generateJWT({email: user.email, id: user._id, role: user.role});
    await user.save();
    res.status(201).json({status: httpStatusText.SUCCESS, data: {newUser: user, token}});

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

const signin = async (req, res) => {
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

const getAllUsers = async (req, res) => {
  const users = await User.find({}, {'__v': false});
  res.status(200).json({status: httpStatusText.SUCCESS, data: users})
}

const getUserInfo = async (req, res, next) => {
  const user = await User.findById(req.params.userID);

  if(!user)
    return next(appError.create("User not found", 404, httpStatusText.FAIL))
  if(user._id.toString() !== req.currentUser.userId && req.currentUser.role !== userRoles.ADMIN)
    return next(appError.create("This user not authorized", 404, httpStatusText.FAIL))

  res.status(200).json({status: httpStatusText.SUCCESS, data: user})
}

const updateInfo = async (req, res, next) => {

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

const updateCart = async (req, res, next) => {

  const type = req.query.type;
  const user = await User.findById(req.params.userID);
  if(user._id.toString() !== req.currentUser.userId && req.currentUser.role !== userRoles.ADMIN)
    return next(appError.create("This user not authorized", 401, httpStatusText.FAIL))

  if(!type)
    return next(appError.create("Enter type of operation", 400, httpStatusText.FAIL))
  
  const typeOptions = ["addProduct", "removeProduct", "increaseProduct", "decreaseProduct"]

  let productID;
  if(typeOptions.includes(type))
  {
    ({productID} = req.body)
    if(!productID)
      return next(appError.create("Enter the productID to remove", 400, httpStatusText.FAIL))
  }
  
  if(type === "addProduct")
  {
    let {quantity} = req.body;
    quantity = quantity || 1;
    const product = await Product.findById(productID);
    if(!product)
      return next(appError.create("Enter valid productID", 400, httpStatusText.FAIL))

    const prod = user.cart.find(prod => prod.productID === productID)
    if(prod)
      return next(appError.create("Product already in cart", 400, httpStatusText.FAIL))

    user.cart.push({productID, quantity})
    await user.save();
  }
  else if(type === "removeProduct"){

    let lengthBefore = user.cart.length;
    user.cart = user.cart.filter(item => item.productID.toString() !== productID.toString());
    if(lengthBefore === user.cart.length)
      return next(appError.create("productID not found", 400, httpStatusText.FAIL))

    await user.save();
  }
  else if(type === "increaseProduct"){
    user.cart = user.cart.map(prod => prod.productID === productID? {productID: prod.productID, quantity: prod.quantity + 1} : prod)
    user.save();
    res.status(200).json({status: httpStatusText.SUCCESS, message: "updated successfully"});
  }
  else if(type === "decreaseProduct"){
    user.cart = user.cart.map(prod => prod.productID === productID? {productID: prod.productID, quantity: Math.max(prod.quantity - 1, 1)} : prod)
    user.save();
    res.status(200).json({status: httpStatusText.SUCCESS, message: "updated successfully"});
  }
  else if(type === "clear")
  {
    user.cart = []
    user.save();
    res.status(200).json({status: httpStatusText.SUCCESS, message: "updated successfully"});
  }
  else
  {
    return next(appError.create("Enter valid operation type", 400, httpStatusText.FAIL))
  }
  
  res.json({status: httpStatusText.SUCCESS, message: "updated successfully"});
}

const getUserCart = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.userID);

  if(!user)
    return next(appError.create("User not found", 404, httpStatusText.FAIL))
  if(user._id.toString() !== req.currentUser.userId && req.currentUser.role !== userRoles.ADMIN)
    return next(appError.create("This user not authorized", 404, httpStatusText.FAIL))

  res.status(200).json({status: httpStatusText.SUCCESS, data: user.cart})
})

const callback = asyncWrapper(async (req, res) => {
  const email = req.user.emails[0].value;
  const name = req.user.name;
  let user = await User.findOne({ email });
  if (!user){
    user = new User({ email, firstName: name.givenName, lastName: name.familyName})
    await user.save();
  }
  const token = await generateJWT({email: user.email, userId: user._id, role: user.role});
  res.redirect(`https://pharma-ai-front.vercel.app?token=${token}`);
  // res.redirect(`http://localhost:5173?token=${token}`);
})

module.exports = {
  signup,
  signin,
  getAllUsers,
  getUserInfo,
  updateInfo,
  getUserCart,
  updateCart,
  callback
};