// Example signup controller
const User = require('../models/users.model');

exports.signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const user = new User({ email, password, firstName, lastName, phoneNumber });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};