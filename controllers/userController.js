import { UserModel } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const signup = async (req, res) => {
  try {
    const { username, firstName, lastName, password, age } = req.body;

    const user = await UserModel.findOne({username});
    if (user) {
      return res.status(400).json({
        message: "Username already exist",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = await UserModel.create({
      username,
      firstName,
      lastName,
      password: hashedPassword,
      age,
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

    const user = await UserModel.findOne({username});
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const passwordComparingResult = bcrypt.compare(password, user.password);

    if (!passwordComparingResult) {
      return res.status(400).json({
        message: "Password is incorrect!",
      });
    }

    const key = process.env.JWTSECRETKEY;
    const token = jwt.sign({ username }, key, { expiresIn: "1d" });

    return res.status(200).json({
      message: "User logged in successfully",
      token
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export { signup, login };
