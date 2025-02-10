import { CustomError } from "./errorHandler.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.JWTSECRETKEY;

export const authorizeUser = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new CustomError("Invalid Authorization Token!");
      }

      const token = authHeader.split(" ")[1];
      const decode = jwt.verify(token, secret);

      const { role, _id, username } = decode.data;

      if (!allowedRoles.includes(role)) {
        throw new CustomError("Unauthorized Access", 403);
      }

      req.user = { role, userId: _id, username };
      next();
    } catch (error) {
      next(error);
    }
  };
};
