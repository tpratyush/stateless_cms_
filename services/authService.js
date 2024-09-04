const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

// In-memory storage for users
let users = [];

const generateToken = (user) => {
  const payload = { id: user.id, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const signup = async (email, password) => {
  try {
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      policies: []
    };

    users.push(newUser);

    const token = generateToken(newUser);

    return { success: true, user: { id: newUser.id, email: newUser.email }, token };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const loginUser = async (email, password) => {
  try {
    const user = users.find(user => user.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user);
    console.log(token);
    return { success: true, user: { id: user.id, email: user.email }, token };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getUserById = async (userId) => {
  try {
    const user = users.find(user => user.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    const { password, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getUserByToken = async (token) => {
  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }
  return users.find(user => user.id === decoded.id);
};

const UserPermissions = {
  MANAGE_POLICY: 'MANAGE_POLICY',
  VIEW_POLICY: 'VIEW_POLICY',
  VIEW_ALL_POLICIES: 'VIEW_ALL_POLICIES'
};

const hasPermission = (user, permission) => {
  return user.permissions && user.permissions.includes(permission);
};

module.exports = {
  signup,
  loginUser,
  getUserById,
  getUserByToken,
  verifyToken,
  hasPermission,
  UserPermissions
};