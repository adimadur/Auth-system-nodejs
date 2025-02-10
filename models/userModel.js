// const { Schema } = require("mongoose");
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      validate: {
        validator: (value) => {
          return !/[^a-zA-Z ]/.test(value);
        },
        message:
          "First Name should only contain alphabetic characters and spaces",
      },
    },
    lastName: {
      type: String,
      validate: {
        validator: (value) => {
          return !/[^a-zA-Z ]/.test(value);
        },
        message:
          "Last Name should only contain alphabetic characters and spaces",
      },
    },
    age: { type: Number },
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User"
    },
    username: {
      type: String,
      unique: [true, "Username already taken"],
      required: [true, "UserName is a required field"],
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model("User", userSchema);
