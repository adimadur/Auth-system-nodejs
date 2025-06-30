import { AuthenticationError, AuthorizationError } from "./errorHandler.js";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel.js";
import logger from "../utils/logger.js";

const secret = process.env.JWTSECRETKEY;

if (!secret) {
  throw new Error('JWT_SECRET_KEY is not defined in environment variables');
}

export const authorizeUser = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AuthenticationError("Access token required");
      }

      const token = authHeader.split(" ")[1];
      
      if (!token) {
        throw new AuthenticationError("Access token required");
      }

      // Verify token
      const decoded = jwt.verify(token, secret);
      
      if (!decoded.data) {
        throw new AuthenticationError("Invalid token structure");
      }

      const { _id, role, username } = decoded.data;

      // Check if user still exists
      const currentUser = await UserModel.findById(_id).select('+password');
      
      if (!currentUser) {
        throw new AuthenticationError("User no longer exists");
      }

      // Check if user is active
      if (!currentUser.isActive) {
        throw new AuthenticationError("User account is deactivated");
      }

      // Check if password was changed after token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        throw new AuthenticationError("User recently changed password! Please log in again");
      }

      // Check role authorization
      if (!allowedRoles.includes(role)) {
        logger.warn(`Unauthorized access attempt by user ${username} with role ${role}`);
        throw new AuthorizationError("You don't have permission to perform this action");
      }

      // Grant access to protected route
      req.user = { 
        userId: _id, 
        role, 
        username,
        email: currentUser.email 
      };
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check if user is authenticated (any role)
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("Access token required");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, secret);
    
    if (!decoded.data) {
      throw new AuthenticationError("Invalid token structure");
    }

    const { _id } = decoded.data;
    const currentUser = await UserModel.findById(_id);
    
    if (!currentUser) {
      throw new AuthenticationError("User no longer exists");
    }

    if (!currentUser.isActive) {
      throw new AuthenticationError("User account is deactivated");
    }

    req.user = { 
      userId: _id, 
      role: currentUser.role, 
      username: currentUser.username,
      email: currentUser.email 
    };
    
    next();
  } catch (error) {
    next(error);
  }
};
