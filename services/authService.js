const User = require('../models/user');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = { id: user._id, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const authService = {
  signup: async (email, password, name) => {
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('Email already in use');
      }

      const newUser = new User({ email, password, name });
      await newUser.save();

      const token = generateToken(newUser);

      return { success: true, user: { id: newUser._id, email: newUser.email }, token };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  loginUser: async (email, password) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      const token = generateToken(user);
      return { success: true, user: { id: user._id, email: user.email }, token };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getUserById: async (userId) => {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getUserByToken: async (token) => {
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }
    return User.findById(decoded.id).select('-password');
  }
};

module.exports = authService;