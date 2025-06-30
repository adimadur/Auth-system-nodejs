import { UserModel } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { 
  ValidationError, 
  AuthenticationError, 
  NotFoundError, 
  ConflictError 
} from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";

// Generate JWT Token
const generateToken = (userId, role, username) => {
  const secret = process.env.JWTSECRETKEY;
  if (!secret) {
    throw new Error('JWT_SECRET_KEY is not defined');
  }
  
  return jwt.sign(
    {
      data: {
        _id: userId,
        role,
        username,
      },
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { username, firstName, lastName, password, age, email } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      const field = existingUser.username === username ? 'username' : 'email';
      throw new ConflictError(`${field} already exists`);
    }

    // Create user
    const userData = await UserModel.create({
      username,
      firstName,
      lastName,
      password,
      age,
      email
    });

    // Generate token
    const token = generateToken(userData._id, userData.role, userData.username);

    // Remove password from response
    userData.password = undefined;

    logger.info(`New user registered: ${userData.username}`);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userData,
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if username and password exist
    if (!username || !password) {
      throw new ValidationError("Please provide username and password");
    }

    // Check if user exists && password is correct
    const user = await UserModel.findOne({ username }).select('+password');
    
    if (!user) {
      throw new AuthenticationError("Invalid credentials");
    }

    if (!user.isActive) {
      throw new AuthenticationError("Account is deactivated");
    }

    const isPasswordCorrect = await user.correctPassword(password, user.password);
    
    if (!isPasswordCorrect) {
      throw new AuthenticationError("Invalid credentials");
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id, user.role, user.username);

    // Remove password from response
    user.password = undefined;

    logger.info(`User logged in: ${user.username}`);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.userId);
    
    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, age, email } = req.body;
    
    // Check if email is being updated and if it already exists
    if (email) {
      const existingUser = await UserModel.findOne({ 
        email, 
        _id: { $ne: req.user.userId } 
      });
      
      if (existingUser) {
        throw new ConflictError("Email already exists");
      }
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.userId,
      { firstName, lastName, age, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    logger.info(`User profile updated: ${updatedUser.username}`);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ValidationError("Please provide current and new password");
    }

    const user = await UserModel.findById(req.user.userId).select('+password');
    
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check current password
    const isCurrentPasswordCorrect = await user.correctPassword(currentPassword, user.password);
    
    if (!isCurrentPasswordCorrect) {
      throw new AuthenticationError("Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.username}`);

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/delete/:id
// @access  Private/Admin
const deleteUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ValidationError("User ID is required");
    }

    const user = await UserModel.findById(id);
    
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Prevent admin from deleting themselves
    if (id === req.user.userId) {
      throw new ValidationError("You cannot delete your own account");
    }

    await UserModel.findByIdAndDelete(id);

    logger.info(`User deleted by admin ${req.user.username}: ${user.username}`);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const users = await UserModel.find(query)
      .select('-password')
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .sort(options.sort);

    const total = await UserModel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: options.page,
        totalPages: Math.ceil(total / options.limit),
        totalUsers: total,
        usersPerPage: options.limit
      }
    });
  } catch (error) {
    next(error);
  }
};

export { 
  signup, 
  login, 
  getMe, 
  updateProfile, 
  changePassword, 
  deleteUserById, 
  getAllUsers 
};
