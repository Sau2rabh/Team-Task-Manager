const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    console.log(`📝 Signup attempt for email: ${email}`);
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log(`⚠️ Signup failed: User already exists (${email})`);
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role: role || 'member' });
    console.log(`✅ User created: ${user.email} (${user._id})`);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    console.error(`❌ Signup error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log(`🔑 Login attempt for email: ${email}`);
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log(`⚠️ Login failed: User not found (${email})`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password, user.password);
    if (!isMatch) {
      console.log(`⚠️ Login failed: Password mismatch for ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`✅ Login successful for ${email}`);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    console.error(`❌ Login error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};
