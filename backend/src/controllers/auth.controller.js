import bcrypt from "bcryptjs";

import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";
import jwtToken from "../utils/jwt.js";

export const register = async (req, res, next) => {
  try {
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(
        (err) => err.message,
      );
      throw ApiError.badRequest(errorMessages.join(", "));
    }

    const { name, email, password } = validationResult.data;
    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      throw ApiError.conflict("User with this email already exists");
    }

    const newUser = await User.createUser({ name, email, password });
    const token = jwtToken.sign({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(
        (err) => err.message,
      );
      throw ApiError.badRequest(errorMessages.join(", "));
    }

    const { email, password } = validationResult.data;
    const user = await User.findUserByEmail(email);

    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    res.json({
      message: "SignIn successfully..",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findUserById(req.user.id);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
};
