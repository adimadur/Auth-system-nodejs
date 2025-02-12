import { UserModel } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CustomError } from "../middlewares/errorHandler.js";

const signup = async (req, res) => {
  try {
    const { username, firstName, lastName, password, age } = req.body;

    const user = await UserModel.findOne({ username });
    if (user) {
      return res.status(400).json({
        message: "Username already exist",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = await UserModel.create({
      ...req.body,
      password: hashedPassword,
    });

    return res.status(200).json({
      message: "User Created Successfully!",
      data: userData,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findOne({ username });
    if (!user) {
      throw new CustomError("User not found!", 404);
    }

    const passwordComparingResult = bcrypt.compare(password, user.password);

    if (!passwordComparingResult) {
      return res.status(400).json({
        message: "Password is incorrect!",
      });
    }

    const key = process.env.JWTSECRETKEY;
    const token = jwt.sign(
      {
        data: {
          _id: user._id,
          role: user.role,
          username: user.username,
        },
      },
      key,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "User logged in successfully",
      token,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      throw new CustomError("Provide user Id", 404);
    }
    // const { userId } = req.user;

    const deletedUser = await UserModel.findByIdAndDelete(id);

    return res.status(200).json({
      message: "User Deleted Successfully",
      data: deletedUser,
    });
  } catch (error) {
    next(error);
  }
};

export { signup, login, deleteUserById };
