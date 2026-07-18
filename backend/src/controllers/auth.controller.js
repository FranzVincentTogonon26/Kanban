import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import jwtToken from "../utils/jwt.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";

const validate = (schema, payload) => {
  const result = schema.safeParse(payload);

  if (!result.success) {
    throw ApiError.badRequest(
      result.error.issues.map(({ message }) => message).join(", "),
    );
  }

  return result.data;
};

const buildAuthResponse = (user) => ({
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
  },
  token: jwtToken.sign({
    id: user.id,
    name: user.name,
    email: user.email,
  }),
});

const ensureUserCanLogin = (user) => {
  switch (user.status.toLowerCase()) {
    case "pending":
      throw ApiError.unauthorized(
        "Your account is pending approval. Please wait for an administrator to approve your account.",
      );

    case "suspended":
      throw ApiError.unauthorized(
        "Your account has been suspended. Please contact the administrator.",
      );

    case "active":
      return;

    default:
      throw ApiError.unauthorized("Your account is unavailable.");
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = validate(registerSchema, req.body);

    const existingUser = await User.findUserByEmail(email);

    if (existingUser) {
      throw ApiError.conflict("User with this email already exists.");
    }

    const user = await User.createUser({
      name,
      email,
      password,
    });

    if (user.status.toLowerCase() !== "active") {
      return res.status(201).json({
        message:
          "Your account has been created and is awaiting administrator approval.",
      });
    }

    return res.status(201).json({
      message: "Account created successfully.",
      ...buildAuthResponse(user),
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = validate(loginSchema, req.body);

    const user = await User.findUserByEmail(email);

    if (!user) {
      throw ApiError.unauthorized("Invalid email or password.");
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      throw ApiError.unauthorized("Invalid email or password.");
    }

    ensureUserCanLogin(user);

    return res.json({
      message: "Signed in successfully.",
      ...buildAuthResponse(user),
    });
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findUserById(req.user.id);

    if (!user) {
      throw ApiError.notFound("User not found.");
    }

    ensureUserCanLogin(user);

    return res.json({ user });
  } catch (err) {
    next(err);
  }
};
