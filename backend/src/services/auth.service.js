// src/services/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const authService = {
  registerUser: async (userData) => {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });
    
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    // Assign default role if not provided
    const role = userData.role || 'user';
    
    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash,
        displayName: userData.displayName,
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : null,
        gender: userData.gender,
        heightCm: userData.heightCm,
        weightKg: userData.weightKg,
        imageUrl: userData.imageUrl,
        role: role
      }
    });
    
    // Generate token
    const token = jwt.sign(
      { 
        id: newUser.id,
        email: newUser.email,
        role: newUser.role || 'user' // Include role with default
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role || 'user', // Include role in response
        imageUrl: newUser.imageUrl
      },
      token
    };
  },
  
  loginUser: async (email, password) => {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }
    
    // Generate token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role || 'user' // Include role with default
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role || 'user', // Include role in response
        imageUrl: user.imageUrl
      },
      token
    };
  }
};

module.exports = { authService };